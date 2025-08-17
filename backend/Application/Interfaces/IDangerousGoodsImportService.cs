namespace Backend.Application.Interfaces;

public interface IDangerousGoodsImportService
{
    Task<ImportResult> ImportUnNumbersAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportIataDgrAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportImdgCodeAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportAdrAgreementAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportRidRegulationsAsync(Stream csvStream, CancellationToken ct = default);
}
