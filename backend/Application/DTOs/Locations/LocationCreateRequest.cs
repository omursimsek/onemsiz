using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Application.DTOs.Locations;

public class LocationCreateRequest
{
    [Required, MaxLength(160)] public string Name { get; set; } = default!;
    [MaxLength(160)] public string? NameAscii { get; set; }
    [Required, MaxLength(2)] public string CountryISO2 { get; set; } = "TR";
    [MaxLength(16)] public string? Subdivision { get; set; }
    public LocationKind Kind { get; set; } = LocationKind.Station;

    // opsiyonel ilk kod
    public string? PrimaryCode { get; set; }
    public string? PrimaryScheme { get; set; } // "UNLOCODE", "UIC" ...
}
