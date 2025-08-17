namespace Backend.Application.DTOs.DangerousGoods;

public record DangerousGoodsSearchResult(
    IReadOnlyList<DangerousGoodsDto> DangerousGoods,
    int TotalCount,
    int TotalPages,
    int CurrentPage,
    int Take,
    bool HasNextPage,
    bool HasPrevPage
);
