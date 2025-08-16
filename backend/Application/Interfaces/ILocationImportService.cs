using Backend.Application.Services.LocationImporting;

namespace Backend.Application.Interfaces;

public interface ILocationImportService
{
    Task<ImportResult> ImportUnlocodeAsync(Stream csvStream, CancellationToken ct = default);
}
