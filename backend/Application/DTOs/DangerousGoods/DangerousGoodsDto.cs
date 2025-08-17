using Backend.Domain.Enums;

namespace Backend.Application.DTOs.DangerousGoods;

public record DangerousGoodsDto(
    Guid Id,
    string UNNumber,
    string ProperShippingName,
    string? TechnicalName,
    string Class,
    string? SubsidiaryRisk,
    string PackingGroup,
    string? Labels,
    string? SpecialProvisions,
    string? LimitedQuantity,
    string? ExceptedQuantity,
    string? Notes,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<DangerousGoodsIdentifierDto> Identifiers
);

public record DangerousGoodsIdentifierDto(
    Guid Id,
    string Scheme,
    string Code,
    string? ExtraJson
);
