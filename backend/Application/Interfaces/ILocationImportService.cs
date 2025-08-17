using Backend.Application.Services.LocationImporting;

namespace Backend.Application.Interfaces;

public interface ILocationImportService
{
    Task<ImportResult> ImportUnlocodeAsync(Stream csvStream, CancellationToken ct = default);
    
    // Yeni UN-LOCODE dosya türleri için metodlar
    Task<ImportResult> ImportCountryCodesAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportFunctionClassifiersAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportStatusIndicatorsAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportSubdivisionCodesAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportAliasAsync(Stream csvStream, CancellationToken ct = default);
}
