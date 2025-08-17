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

    // UN/LOCODE'nin tipik kolonları. Sürüme göre Case/isim değişirse Map'te düzenle.
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

    // Ülke kodları için model
    private class CountryCodeRow
    {
        public string? CountryCode { get; set; }      // "TR"
        public string? CountryName { get; set; }      // "Turkey"
        public string? CountryNameWoDiacritics { get; set; } // "Turkey" (opsiyonel)
        public string? SubdivisionCode { get; set; }  // "TR-35" (opsiyonel)
        public string? SubdivisionName { get; set; }  // "Izmir" (opsiyonel)
    }

    // Fonksiyon sınıflandırıcıları için model
    private class FunctionClassifierRow
    {
        public string? FunctionCode { get; set; }     // "1", "2", "3", "4"
        public string? FunctionName { get; set; }     // "Port", "Rail", "Road", "Airport"
        public string? Description { get; set; }      // Detaylı açıklama
    }

    // Durum göstergeleri için model
    private class StatusIndicatorRow
    {
        public string? StatusCode { get; set; }       // "AA", "AC", "AF", "AI", "AS", "RL", "RN", "RO", "RQ", "RR", "SA", "SD", "SS", "ST", "SU", "SV", "SW", "SX", "SY", "SZ"
        public string? StatusName { get; set; }       // "Approved", "Approved, changes not yet in force", "Approved, functions not yet confirmed"
        public string? Description { get; set; }      // Detaylı açıklama
    }

    // Alt bölüm kodları için model
    private class SubdivisionCodeRow
    {
        public string? CountryCode { get; set; }      // "TR"
        public string? SubdivisionCode { get; set; }  // "35"
        public string? SubdivisionName { get; set; }  // "Izmir"
        public string? SubdivisionType { get; set; }  // "Province", "State", "Region"
    }

    // Takma adlar için model
    private class AliasRow
    {
        public string? CountryCode { get; set; }      // "TR"
        public string? LocationCode { get; set; }     // "IZM"
        public string? AliasName { get; set; }        // "Smyrna"
        public string? NameWoDiacritics { get; set; } // "Smyrna"
        public string? AliasType { get; set; }        // "Historical", "Alternative", "Local"
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

    private sealed class CountryCodeMap : ClassMap<CountryCodeRow>
    {
        public CountryCodeMap()
        {
            Map(m => m.CountryCode).Name("Country Code", "CountryCode", "ISO", "ISO 2");
            Map(m => m.CountryName).Name("Country Name", "CountryName", "Name");
            Map(m => m.CountryNameWoDiacritics).Name("Country Name Wo Diacritics", "CountryNameWoDiacritics").Optional();
            Map(m => m.SubdivisionCode).Name("Subdivision Code", "SubdivisionCode", "SubDiv").Optional();
            Map(m => m.SubdivisionName).Name("Subdivision Name", "SubdivisionName", "SubDivName").Optional();
        }
    }

    private sealed class FunctionClassifierMap : ClassMap<FunctionClassifierRow>
    {
        public FunctionClassifierMap()
        {
            Map(m => m.FunctionCode).Name("Function Code", "FunctionCode", "Code");
            Map(m => m.FunctionName).Name("Function Name", "FunctionName", "Name").Optional();
            Map(m => m.Description).Name("Function Description", "FunctionDescription", "Desc", "Description").Optional();
        }
    }

    private sealed class StatusIndicatorMap : ClassMap<StatusIndicatorRow>
    {
        public StatusIndicatorMap()
        {
            Map(m => m.StatusCode).Name("Status Code", "StatusCode", "Code","STStatus");
            Map(m => m.StatusName).Name("Status Name", "StatusName", "Name").Optional();
            Map(m => m.Description).Name("STDescription", "Desc").Optional();
        }
    }

    private sealed class SubdivisionCodeMap : ClassMap<SubdivisionCodeRow>
    {
        public SubdivisionCodeMap()
        {
            Map(m => m.CountryCode).Name("Country Code", "CountryCode", "ISO", "ISO 2","SUCountry");
            Map(m => m.SubdivisionCode).Name("Subdivision Code", "SubdivisionCode", "SubDiv","SUCode");
            Map(m => m.SubdivisionName).Name("Subdivision Name", "SubdivisionName", "SubDivName","SUName");
            Map(m => m.SubdivisionType).Name("Subdivision Type", "SubdivisionType", "SubDivType","SUType").Optional();
        }
    }

    private sealed class AliasMap : ClassMap<AliasRow>
    {
        public AliasMap()
        {
            Map(m => m.CountryCode).Name("Country Code", "CountryCode", "ISO", "ISO 2","Country");
            Map(m => m.LocationCode).Name("Location Code", "LocationCode", "Code").Optional();
            Map(m => m.AliasName).Name("Alias Name", "AliasName", "Name");
            Map(m => m.NameWoDiacritics).Name("NameWoDiacritics", "NameWoDiac", "Name w/o diacritics").Optional();
            Map(m => m.AliasType).Name("Alias Type", "AliasType", "Type").Optional();
        }
    }

    public async Task<ImportResult> ImportUnlocodeAsync(Stream csvStream, CancellationToken ct = default)
    {
        int rows = 0, locInserted = 0, locUpdated = 0, idInserted = 0, skipped = 0;

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
        
        // Batch içinde işlenen kodları takip etmek için
        var processedCodesInBatch = new HashSet<string>();

        await foreach (var rec in csv.GetRecordsAsync<UnlocodeRow>(ct))
        {
            try
            {
                rows++;
                if (string.IsNullOrWhiteSpace(rec.Country) || string.IsNullOrWhiteSpace(rec.Location))
                    continue;

                var code = (rec.Country!.Trim().ToUpperInvariant()) + (rec.Location!.Trim().ToUpperInvariant());

                // 1) Önce batch içinde bu kod işlendi mi kontrol et
                if (processedCodesInBatch.Contains(code))
                {
                    Console.WriteLine($"UNLOCODE kodu batch içinde zaten işlendi, skip ediliyor: {code}");
                    skipped++;
                    continue;
                }

                // 2) Database'de bu UNLOCODE kodu zaten var mı?
                var existingIdentifier = await _db.LocationIdentifiers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(i => i.Scheme == CodeScheme.UNLOCODE && i.Code == code, ct);

                if (existingIdentifier != null)
                {
                    // Bu UNLOCODE kodu zaten mevcut, skip et
                    Console.WriteLine($"UNLOCODE kodu database'de zaten mevcut, skip ediliyor: {code}");
                    skipped++;
                    continue;
                }

                // 3) Location var mı? Yoksa yeni oluştur
                var existingLocation = await _db.Locations
                    .FirstOrDefaultAsync(l =>
                        l.CountryISO2 == rec.Country && l.Name == (rec.Name ?? code), ct);

                Location loc;

                if (existingLocation == null)
                {
                    // Yeni location oluştur
                    loc = new Location
                    {
                        Kind = LocationKind.Station,
                        Name = rec.Name ?? code,
                        NameAscii = rec.NameWoDiacritics ?? rec.Name,
                        CountryISO2 = rec.Country!,
                        Subdivision = rec.Subdivision
                    };

                    _db.Locations.Add(loc);
                    locInserted++;
                }
                else
                {
                    // Mevcut location'ı güncelle
                    loc = existingLocation;
                    bool changed = false;
                    
                    if (string.IsNullOrWhiteSpace(loc.NameAscii) && !string.IsNullOrWhiteSpace(rec.NameWoDiacritics))
                    { 
                        loc.NameAscii = rec.NameWoDiacritics; 
                        changed = true; 
                    }
                    
                    if (string.IsNullOrWhiteSpace(loc.Subdivision) && !string.IsNullOrWhiteSpace(rec.Subdivision))
                    { 
                        loc.Subdivision = rec.Subdivision; 
                        changed = true; 
                    }
                    
                    if (changed) locUpdated++;
                }

                // 4) Yeni LocationIdentifier ekle
                var extra = JsonSerializer.Serialize(new
                {
                    rec.Function,
                    rec.Status,
                    rec.Date,
                    rec.IATA,
                    rec.Coordinates
                });

                Console.WriteLine($"LocationIdentifier ekleniyor: {code}, extra: {extra}");
                
                _db.LocationIdentifiers.Add(new LocationIdentifier
                {
                    Location = loc,
                    Scheme = CodeScheme.UNLOCODE,
                    Code = code,
                    ExtraJson = extra
                });
                
                // Batch içinde işlenen kodları takip et
                processedCodesInBatch.Add(code);
                idInserted++;

                batchCount++;
                if (batchCount >= batchSize)
                {
                    await _db.SaveChangesAsync(ct);
                    batchCount = 0;
                    // Batch sonrası processed codes'u temizle
                    processedCodesInBatch.Clear();
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

        return new ImportResult(rows, locInserted, idInserted, locUpdated, skipped);
    }

    public async Task<ImportResult> ImportCountryCodesAsync(Stream csvStream, CancellationToken ct = default)
    {
        int rows = 0, countriesProcessed = 0;

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
        csv.Context.RegisterClassMap<CountryCodeMap>();

        await foreach (var rec in csv.GetRecordsAsync<CountryCodeRow>(ct))
        {
            try
            {
                rows++;
                if (string.IsNullOrWhiteSpace(rec.CountryCode))
                    continue;

                // Ülke kodlarını işle - şimdilik sadece loglama yapıyoruz
                // İleride ayrı bir tablo oluşturulabilir
                Console.WriteLine($"Ülke kodu işlendi: {rec.CountryCode} - {rec.CountryName}");
                countriesProcessed++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu. Satır: {rows} | Hata: {ex.Message}");
                break;
            }
        }

        return new ImportResult(rows, countriesProcessed, 0, 0, 0);
    }

    public async Task<ImportResult> ImportFunctionClassifiersAsync(Stream csvStream, CancellationToken ct = default)
    {
        int rows = 0, functionsProcessed = 0;

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
        csv.Context.RegisterClassMap<FunctionClassifierMap>();

        await foreach (var rec in csv.GetRecordsAsync<FunctionClassifierRow>(ct))
        {
            try
            {
                rows++;
                if (string.IsNullOrWhiteSpace(rec.FunctionCode))
                    continue;

                // Fonksiyon sınıflandırıcılarını işle
                Console.WriteLine($"Fonksiyon sınıflandırıcısı işlendi: {rec.FunctionCode} - {rec.FunctionName}");
                functionsProcessed++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu. Satır: {rows} | Hata: {ex.Message}");
                break;
            }
        }

        return new ImportResult(rows, functionsProcessed, 0, 0, 0);
    }

    public async Task<ImportResult> ImportStatusIndicatorsAsync(Stream csvStream, CancellationToken ct = default)
    {
        int rows = 0, statusesProcessed = 0;

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
        csv.Context.RegisterClassMap<StatusIndicatorMap>();

        await foreach (var rec in csv.GetRecordsAsync<StatusIndicatorRow>(ct))
        {
            try
            {
                rows++;
                if (string.IsNullOrWhiteSpace(rec.StatusCode))
                    continue;

                // Durum göstergelerini işle
                Console.WriteLine($"Durum göstergesi işlendi: {rec.StatusCode} - {rec.StatusName}");
                statusesProcessed++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu. Satır: {rows} | Hata: {ex.Message}");
                break;
            }
        }

        return new ImportResult(rows, statusesProcessed, 0, 0, 0);
    }

    public async Task<ImportResult> ImportSubdivisionCodesAsync(Stream csvStream, CancellationToken ct = default)
    {
        int rows = 0, subdivisionsProcessed = 0;

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
        csv.Context.RegisterClassMap<SubdivisionCodeMap>();

        await foreach (var rec in csv.GetRecordsAsync<SubdivisionCodeRow>(ct))
        {
            try
            {
                rows++;
                if (string.IsNullOrWhiteSpace(rec.CountryCode) || string.IsNullOrWhiteSpace(rec.SubdivisionCode))
                    continue;

                // Alt bölüm kodlarını işle
                Console.WriteLine($"Alt bölüm kodu işlendi: {rec.CountryCode}-{rec.SubdivisionCode} - {rec.SubdivisionName}");
                subdivisionsProcessed++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu. Satır: {rows} | Hata: {ex.Message}");
                break;
            }
        }

        return new ImportResult(rows, subdivisionsProcessed, 0, 0, 0);
    }

    public async Task<ImportResult> ImportAliasAsync(Stream csvStream, CancellationToken ct = default)
    {
        int rows = 0, aliasesProcessed = 0;

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
        csv.Context.RegisterClassMap<AliasMap>();

        await foreach (var rec in csv.GetRecordsAsync<AliasRow>(ct))
        {
            try
            {
                rows++;
                if (string.IsNullOrWhiteSpace(rec.CountryCode) || string.IsNullOrWhiteSpace(rec.LocationCode))
                    continue;

                // Takma adları işle
                Console.WriteLine($"Takma ad işlendi: {rec.CountryCode}{rec.LocationCode} - {rec.AliasName}");
                aliasesProcessed++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu. Satır: {rows} | Hata: {ex.Message}");
                break;
            }
        }

        return new ImportResult(rows, aliasesProcessed, 0, 0, 0);
    }
}
