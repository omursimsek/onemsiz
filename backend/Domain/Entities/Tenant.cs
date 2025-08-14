using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ParentId { get; set; }
    public Tenant? Parent { get; set; }
    public ICollection<Tenant> Children { get; set; } = new List<Tenant>();

    [Required, MaxLength(160)]
    public string Name { get; set; } = default!;

    [Required, MaxLength(80)]
    public string Slug { get; set; } = default!; // subdomain / kısa ad

    public TenantLevel Level { get; set; } = TenantLevel.Organization;

    // Postgres'te LTREE düşünüldüyse: "a.b.c" gibi bir yol
    public string? Path { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(16)]
    public string DefaultCulture { get; set; } = "en";
    [MaxLength(512)]
    public string? LogoPath { get; set; } // /tenants/{id}/logo.png gibi
}
