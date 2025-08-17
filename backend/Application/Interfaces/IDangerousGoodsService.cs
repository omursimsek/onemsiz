using Backend.Application.DTOs.DangerousGoods;

namespace Backend.Application.Interfaces;

public interface IDangerousGoodsService
{
    Task<DangerousGoodsDto?> GetAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<DangerousGoodsDto>> SearchAsync(
        string? query, string? unNumber, string? dgClass, string? scheme, string? code, int take = 50, CancellationToken ct = default);
    Task<DangerousGoodsSearchResult> SearchWithPaginationAsync(
        string? query, string? unNumber, string? dgClass, string? scheme, string? code, int take = 50, int page = 1, CancellationToken ct = default);

    Task<DangerousGoodsDto> CreateAsync(DangerousGoodsCreateRequest req, CancellationToken ct = default);
    Task<DangerousGoodsDto?> UpdateAsync(Guid id, DangerousGoodsUpdateRequest req, CancellationToken ct = default);

    Task<bool> AddIdentifierAsync(Guid dangerousGoodsId, string scheme, string code, CancellationToken ct = default);
    Task<bool> RemoveIdentifierAsync(Guid dangerousGoodsId, Guid identifierId, CancellationToken ct = default);

    // Statistics metodları
    Task<DangerousGoodsStatistics> GetStatisticsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<DangerousGoodsClassStatistics>> GetClassStatisticsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<DangerousGoodsSchemeStatistics>> GetSchemeStatisticsAsync(CancellationToken ct = default);
}
