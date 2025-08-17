namespace Backend.Application.DTOs.DangerousGoods;

public record DangerousGoodsStatistics(
    int TotalDangerousGoods,
    int UniqueClasses,
    int TotalIdentifiers,
    int ThisMonthDangerousGoods
);

public record DangerousGoodsClassStatistics(
    string Class,
    int Count
);

public record DangerousGoodsSchemeStatistics(
    string Scheme,
    int Count
);
