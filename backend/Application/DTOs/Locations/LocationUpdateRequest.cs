using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Application.DTOs.Locations;

public class LocationUpdateRequest
{
    [Required, MaxLength(160)] public string Name { get; set; } = default!;
    [MaxLength(160)] public string? NameAscii { get; set; }
    [Required, MaxLength(2)] public string CountryISO2 { get; set; } = "TR";
    [MaxLength(16)] public string? Subdivision { get; set; }
    public LocationKind Kind { get; set; } = LocationKind.Station;
    public bool IsActive { get; set; } = true;
}
