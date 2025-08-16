using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Domain.Entities;

public class LocationIdentifier
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid LocationId { get; set; }
    public Location Location { get; set; } = default!;

    public CodeScheme Scheme { get; set; } = CodeScheme.UNLOCODE;

    [Required, MaxLength(64)]
    public string Code { get; set; } = default!; // TRIZM, 8501234 vb.

    [MaxLength(2048)]
    public string? ExtraJson { get; set; }
}
