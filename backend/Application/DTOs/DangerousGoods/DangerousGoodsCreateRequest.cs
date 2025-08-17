using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Application.DTOs.DangerousGoods;

public record DangerousGoodsCreateRequest(
    [Required] string UNNumber,
    [Required] string ProperShippingName,
    string? TechnicalName,
    [Required] DangerousGoodsClass Class,
    string? SubsidiaryRisk,
    [Required] PackingGroup PackingGroup,
    string? Labels,
    string? SpecialProvisions,
    string? LimitedQuantity,
    string? ExceptedQuantity,
    string? Notes,
    string? PrimaryScheme,
    string? PrimaryCode
);
