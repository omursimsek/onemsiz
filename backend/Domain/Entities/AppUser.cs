using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Domain.Entities;

public class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    public string PasswordHash { get; set; } = default!;

    public AppRole Role { get; set; } = AppRole.TenantUser;

    // Platform kullanıcıları için null, tenant kullanıcıları için zorunlu
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
