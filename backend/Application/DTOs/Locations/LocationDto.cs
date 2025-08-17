
using Backend.Domain.Enums;

namespace Backend.Application.DTOs.Locations;

public record LocationDto(
    Guid Id,
    string Name,
    string? NameAscii,
    string CountryISO2,
    string? Subdivision,
    LocationKind Kind,
    bool IsActive,
    DateTime CreatedAt,
    IReadOnlyList<IdentifierDto> Identifiers
);

public record IdentifierDto(Guid Id, string Scheme, string Code, string? ExtraJson);
