using System.Globalization;
using System.Text.Json;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using Backend.Application.Interfaces;
using Backend.Application.Services.LocationImporting;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Backend.Domain.Enums;

namespace Backend.Application.Services.LocationImporting;

public class LocationImportService : ILocationImportService
{
    private readonly AppDbContext _db;

    public LocationImportService(AppDbContext db)
    {
        _db = db;
    }

    // UN/LOCODE’nin tipik kolonları. Sürüme göre Case/isim değişirse Map’te düzenle.
    private class UnlocodeRow
    {
        // UNECE setlerinde genellikle:
        public string? Country { get; set; }          // "TR"
        public string? Location { get; set; }         // "IZM" → birleşik kod: "TRIZM"
        public string? Name { get; set; }             // "IZMIR"
        public string? NameWoDiacritics { get; set; } // "IZMIR" (opsiyonel)
        public string? Subdivision { get; set; }      // "TR-35" (opsiyonel)
        public string? Function { get; set; }         // "----34--" gibi bayraklar
        public string? Status { get; set; }           // "AA", "AC" ...
        public string? Date { get; set; }             // "2407"
        public string? IATA { get; set; }             // (varsa)
        public string? Coordinates { get; set; }      // "3830N 02706E" gibi (opsiyonel)
    }

    private sealed class UnlocodeMap : ClassMap<UnlocodeRow>
    {
        public UnlocodeMap()
        {
            // Sık görülen başlık varyasyonları:
            Map(m => m.Country).Name("Country", "ISO", "ISO 2");
            Map(m => m.Location).Name("Location", "LOCODE", "Code");
            Map(m => m.Name).Name("Name", "Location name", "Name without diacritics");
            Map(m => m.NameWoDiacritics).Name("NameWoDiacritics", "NameWoDiac", "Name w/o diacritics").Optional();
            Map(m => m.Subdivision).Name("SubDiv", "Subdivision", "SubDiv (ISO 3166-2)").Optional();
            Map(m => m.Function).Name("Function", "Functions").Optional();
            Map(m => m.Status).Name("Status").Optional();
            Map(m => m.Date).Name("Date").Optional();
            Map(m => m.IATA).Name("IATA").Optional();
            Map(m => m.Coordinates).Name("Coordinates", "Coords").Optional();
        }
    }

    public async Task<ImportResult> ImportUnlocodeAsync(Stream csvStream, CancellationToken ct = default)
    {
        int rows = 0, locInserted = 0, locUpdated = 0, idInserted = 0;

        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            IgnoreBlankLines = true,
            BadDataFound = null,
            MissingFieldFound = null,
            DetectDelimiter = true
        };

        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, config);
        csv.Context.RegisterClassMap<UnlocodeMap>();

        // Performans için batch kaydetme
        var batchSize = 1000;
        var batchCount = 0;

        await foreach (var rec in csv.GetRecordsAsync<UnlocodeRow>(ct))
        {
            try
            {
                rows++;
                if (string.IsNullOrWhiteSpace(rec.Country) || string.IsNullOrWhiteSpace(rec.Location))
                    continue;

                var code = (rec.Country!.Trim().ToUpperInvariant()) + (rec.Location!.Trim().ToUpperInvariant());

                // 1) Identifier var mı?
                var ident = await _db.LocationIdentifiers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(i => i.Scheme == CodeScheme.UNLOCODE && i.Code == code, ct);

                Location loc;

                if (ident is null)
                {
                    loc = await _db.Locations
                        .FirstOrDefaultAsync(l =>
                            l.CountryISO2 == rec.Country && l.Name == (rec.Name ?? code), ct)
                        ?? new Location
                        {
                            Kind = LocationKind.Station,
                            Name = rec.Name ?? code,
                            NameAscii = rec.NameWoDiacritics ?? rec.Name,
                            CountryISO2 = rec.Country!,
                            Subdivision = rec.Subdivision
                        };

                    if (loc.Id == Guid.Empty)
                    {
                        _db.Locations.Add(loc);
                        locInserted++;
                    }
                    else
                    {
                        bool changed = false;
                        if (string.IsNullOrWhiteSpace(loc.NameAscii) && !string.IsNullOrWhiteSpace(rec.NameWoDiacritics))
                        { loc.NameAscii = rec.NameWoDiacritics; changed = true; }
                        if (string.IsNullOrWhiteSpace(loc.Subdivision) && !string.IsNullOrWhiteSpace(rec.Subdivision))
                        { loc.Subdivision = rec.Subdivision; changed = true; }
                        if (changed) locUpdated++;
                    }

                    var extra = JsonSerializer.Serialize(new
                    {
                        rec.Function,
                        rec.Status,
                        rec.Date,
                        rec.IATA,
                        rec.Coordinates
                    });

                    _db.LocationIdentifiers.Add(new LocationIdentifier
                    {
                        Location = loc,
                        Scheme = CodeScheme.UNLOCODE,
                        Code = code,
                        ExtraJson = extra
                    });
                    idInserted++;
                }
                else
                {
                    var existing = await _db.Locations.FirstAsync(l => l.Id == ident.LocationId, ct);
                    bool changed = false;
                    if (string.IsNullOrWhiteSpace(existing.NameAscii) && !string.IsNullOrWhiteSpace(rec.NameWoDiacritics))
                    { existing.NameAscii = rec.NameWoDiacritics; changed = true; }
                    if (string.IsNullOrWhiteSpace(existing.Subdivision) && !string.IsNullOrWhiteSpace(rec.Subdivision))
                    { existing.Subdivision = rec.Subdivision; changed = true; }
                    if (changed) locUpdated++;
                }

                batchCount++;
                if (batchCount >= batchSize)
                {
                    await _db.SaveChangesAsync(ct);
                    batchCount = 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu. Satır: {rows} | Hata: {ex.Message}");
                break;
            }
        }



        if (batchCount > 0)
            await _db.SaveChangesAsync(ct);

        return new ImportResult(rows, locInserted, idInserted, locUpdated);
    }
}
