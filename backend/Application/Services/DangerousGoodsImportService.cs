using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using Backend.Application.Interfaces;
using Backend.Application.Services.LocationImporting;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;
using System.Text.Json;

namespace Backend.Application.Services;

public class DangerousGoodsImportService : IDangerousGoodsImportService
{
    private readonly AppDbContext _db;
    
    public DangerousGoodsImportService(AppDbContext db) => _db = db;

    public async Task<ImportResult> ImportUnNumbersAsync(Stream csvStream, CancellationToken ct = default)
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null,
            Delimiter = ",",
            HasHeaderRecord = true
        };

        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, config);

        // CSV mapping için class
        var records = new List<UnNumberRow>();
        await foreach (var record in csv.GetRecordsAsync<UnNumberRow>(ct))
        {
            records.Add(record);
        }

        var rows = records.Count;
        var dangerousGoodsInserted = 0;
        var identifiersInserted = 0;
        var dangerousGoodsUpdated = 0;
        var skipped = 0;

        foreach (var rec in records)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(rec.UNNumber) || string.IsNullOrWhiteSpace(rec.ProperShippingName))
                    continue;

                var unNumber = rec.UNNumber.Trim().ToUpperInvariant();

                // Mevcut UN Number kontrolü
                var existingDg = await _db.DangerousGoods
                    .AsNoTracking()
                    .FirstOrDefaultAsync(dg => dg.UNNumber == unNumber, ct);

                if (existingDg != null)
                {
                    // Mevcut kaydı güncelle
                    existingDg.ProperShippingName = rec.ProperShippingName.Trim();
                    existingDg.TechnicalName = rec.TechnicalName?.Trim();
                    existingDg.Class = ParseDangerousGoodsClass(rec.Class);
                    existingDg.PackingGroup = ParsePackingGroup(rec.PackingGroup);
                    existingDg.Labels = rec.Labels?.Trim();
                    existingDg.SpecialProvisions = rec.SpecialProvisions?.Trim();
                    existingDg.LimitedQuantity = rec.LimitedQuantity?.Trim();
                    existingDg.ExceptedQuantity = rec.ExceptedQuantity?.Trim();
                    existingDg.Notes = rec.Notes?.Trim();
                    existingDg.UpdatedAt = DateTime.UtcNow;

                    _db.DangerousGoods.Update(existingDg);
                    dangerousGoodsUpdated++;
                }
                else
                {
                    // Yeni kayıt oluştur
                    var dg = new DangerousGoods
                    {
                        UNNumber = unNumber,
                        ProperShippingName = rec.ProperShippingName.Trim(),
                        TechnicalName = rec.TechnicalName?.Trim(),
                        Class = ParseDangerousGoodsClass(rec.Class),
                        PackingGroup = ParsePackingGroup(rec.PackingGroup),
                        Labels = rec.Labels?.Trim(),
                        SpecialProvisions = rec.SpecialProvisions?.Trim(),
                        LimitedQuantity = rec.LimitedQuantity?.Trim(),
                        ExceptedQuantity = rec.ExceptedQuantity?.Trim(),
                        Notes = rec.Notes?.Trim(),
                        IsActive = true
                    };

                    _db.DangerousGoods.Add(dg);
                    dangerousGoodsInserted++;

                    // UN Number identifier'ı ekle
                    dg.Identifiers.Add(new DangerousGoodsIdentifier
                    {
                        Scheme = DangerousGoodsScheme.UN,
                        Code = unNumber
                    });
                    identifiersInserted++;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu. UN Number: {rec.UNNumber} | Hata: {ex.Message}");
                skipped++;
            }
        }

        await _db.SaveChangesAsync(ct);

        return new ImportResult(
            rows, 
            0, // LocationsInserted
            0, // IdentifiersInserted  
            0, // LocationsUpdated
            skipped,
            dangerousGoodsInserted,
            dangerousGoodsUpdated
        );
    }

    public async Task<ImportResult> ImportIataDgrAsync(Stream csvStream, CancellationToken ct = default)
    {
        // IATA DGR import implementation
        return await ImportGenericAsync(csvStream, DangerousGoodsScheme.IATA, ct);
    }

    public async Task<ImportResult> ImportImdgCodeAsync(Stream csvStream, CancellationToken ct = default)
    {
        // IMDG Code import implementation
        return await ImportGenericAsync(csvStream, DangerousGoodsScheme.IMDG, ct);
    }

    public async Task<ImportResult> ImportAdrAgreementAsync(Stream csvStream, CancellationToken ct = default)
    {
        // ADR Agreement import implementation
        return await ImportGenericAsync(csvStream, DangerousGoodsScheme.ADR, ct);
    }

    public async Task<ImportResult> ImportRidRegulationsAsync(Stream csvStream, CancellationToken ct = default)
    {
        // RID Regulations import implementation
        return await ImportGenericAsync(csvStream, DangerousGoodsScheme.RID, ct);
    }

    private async Task<ImportResult> ImportGenericAsync(Stream csvStream, DangerousGoodsScheme scheme, CancellationToken ct = default)
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null,
            Delimiter = ",",
            HasHeaderRecord = true
        };

        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, config);

        var records = new List<GenericDangerousGoodsRow>();
        await foreach (var record in csv.GetRecordsAsync<GenericDangerousGoodsRow>(ct))
        {
            records.Add(record);
        }

        var rows = records.Count;
        var dangerousGoodsInserted = 0;
        var identifiersInserted = 0;
        var dangerousGoodsUpdated = 0;
        var skipped = 0;

        foreach (var rec in records)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(rec.UNNumber) || string.IsNullOrWhiteSpace(rec.ProperShippingName))
                    continue;

                var unNumber = rec.UNNumber.Trim().ToUpperInvariant();

                // Mevcut UN Number kontrolü
                var existingDg = await _db.DangerousGoods
                    .Include(dg => dg.Identifiers)
                    .FirstOrDefaultAsync(dg => dg.UNNumber == unNumber, ct);

                if (existingDg != null)
                {
                    // Mevcut kaydı güncelle
                    existingDg.ProperShippingName = rec.ProperShippingName.Trim();
                    existingDg.TechnicalName = rec.TechnicalName?.Trim();
                    existingDg.Class = ParseDangerousGoodsClass(rec.Class);
                    existingDg.PackingGroup = ParsePackingGroup(rec.PackingGroup);
                    existingDg.Labels = rec.Labels?.Trim();
                    existingDg.SpecialProvisions = rec.SpecialProvisions?.Trim();
                    existingDg.LimitedQuantity = rec.LimitedQuantity?.Trim();
                    existingDg.ExceptedQuantity = rec.ExceptedQuantity?.Trim();
                    existingDg.Notes = rec.Notes?.Trim();
                    existingDg.UpdatedAt = DateTime.UtcNow;

                    _db.DangerousGoods.Update(existingDg);
                    dangerousGoodsUpdated++;

                    // Scheme identifier'ı ekle (eğer yoksa)
                    if (!existingDg.Identifiers.Any(i => i.Scheme == scheme))
                    {
                        existingDg.Identifiers.Add(new DangerousGoodsIdentifier
                        {
                            Scheme = scheme,
                            Code = rec.Code?.Trim() ?? unNumber,
                            ExtraJson = JsonSerializer.Serialize(new
                            {
                                rec.AdditionalInfo,
                                rec.RegulationSpecific
                            })
                        });
                        identifiersInserted++;
                    }
                }
                else
                {
                    // Yeni kayıt oluştur
                    var dg = new DangerousGoods
                    {
                        UNNumber = unNumber,
                        ProperShippingName = rec.ProperShippingName.Trim(),
                        TechnicalName = rec.TechnicalName?.Trim(),
                        Class = ParseDangerousGoodsClass(rec.Class),
                        PackingGroup = ParsePackingGroup(rec.PackingGroup),
                        Labels = rec.Labels?.Trim(),
                        SpecialProvisions = rec.SpecialProvisions?.Trim(),
                        LimitedQuantity = rec.LimitedQuantity?.Trim(),
                        ExceptedQuantity = rec.ExceptedQuantity?.Trim(),
                        Notes = rec.Notes?.Trim(),
                        IsActive = true
                    };

                    _db.DangerousGoods.Add(dg);
                    dangerousGoodsInserted++;

                    // UN Number identifier'ı ekle
                    dg.Identifiers.Add(new DangerousGoodsIdentifier
                    {
                        Scheme = DangerousGoodsScheme.UN,
                        Code = unNumber
                    });
                    identifiersInserted++;

                    // Scheme identifier'ı ekle
                    dg.Identifiers.Add(new DangerousGoodsIdentifier
                    {
                        Scheme = scheme,
                        Code = rec.Code?.Trim() ?? unNumber,
                        ExtraJson = JsonSerializer.Serialize(new
                        {
                            rec.AdditionalInfo,
                            rec.RegulationSpecific
                        })
                    });
                    identifiersInserted++;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu. UN Number: {rec.UNNumber} | Hata: {ex.Message}");
                skipped++;
            }
        }

        await _db.SaveChangesAsync(ct);

        return new ImportResult(
            rows, 
            0, // LocationsInserted
            0, // IdentifiersInserted  
            0, // LocationsUpdated
            skipped,
            dangerousGoodsInserted,
            dangerousGoodsUpdated
        );
    }

    private static DangerousGoodsClass ParseDangerousGoodsClass(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return DangerousGoodsClass.Class9;

        // Remove "Class" prefix if present
        var cleanValue = value.Replace("Class", "").Trim();
        
        return int.TryParse(cleanValue, out var classNumber) && classNumber >= 1 && classNumber <= 9
            ? (DangerousGoodsClass)classNumber
            : DangerousGoodsClass.Class9;
    }

    private static PackingGroup ParsePackingGroup(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return PackingGroup.III;

        return value.Trim().ToUpper() switch
        {
            "I" => PackingGroup.I,
            "II" => PackingGroup.II,
            "III" => PackingGroup.III,
            _ => PackingGroup.III
        };
    }

    // CSV mapping classes
    private class UnNumberRow
    {
        public string? UNNumber { get; set; }
        public string? ProperShippingName { get; set; }
        public string? TechnicalName { get; set; }
        public string? Class { get; set; }
        public string? PackingGroup { get; set; }
        public string? Labels { get; set; }
        public string? SpecialProvisions { get; set; }
        public string? LimitedQuantity { get; set; }
        public string? ExceptedQuantity { get; set; }
        public string? Notes { get; set; }
    }

    private class GenericDangerousGoodsRow
    {
        public string? UNNumber { get; set; }
        public string? ProperShippingName { get; set; }
        public string? TechnicalName { get; set; }
        public string? Class { get; set; }
        public string? PackingGroup { get; set; }
        public string? Labels { get; set; }
        public string? SpecialProvisions { get; set; }
        public string? LimitedQuantity { get; set; }
        public string? ExceptedQuantity { get; set; }
        public string? Notes { get; set; }
        public string? Code { get; set; }
        public string? AdditionalInfo { get; set; }
        public string? RegulationSpecific { get; set; }
    }
}
