using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Domain.Entities;

public class Location
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(160)]
    public string Name { get; set; } = default!;

    [MaxLength(160)]
    public string? NameAscii { get; set; }

    [MaxLength(2)]
    public string CountryISO2 { get; set; } = "TR";

    [MaxLength(16)]
    public string? Subdivision { get; set; } // ISO-3166-2 gibi: TR-35

    public LocationKind Kind { get; set; } = LocationKind.Station;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<LocationIdentifier> Identifiers { get; set; } = new List<LocationIdentifier>();
}
