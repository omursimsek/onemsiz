/*
using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;
using Backend.Domain.Entities;

namespace Backend.Models;
*/
//public enum AppRole { SuperAdmin = 0, Staff = 1, TenantAdmin = 2, TenantUser = 3 }

//public enum TenantLevel { Organization = 0, Country = 1, Office = 2 }
/*
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

    // Hiyerarşi yolu, Postgres'te LTREE olarak tutulacak (örn: acme.tr.istanbul)
    public string? Path { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(16)]
    public string DefaultCulture { get; set; } = "en"; // örn: en, tr
    [MaxLength(512)]
    public string? LogoPath { get; set; } // wwwroot içindeki göreli yol: /tenants/{id}/logo.png
}
*/
/*
// Kullanıcının belirli bir node üzerindeki rolü
public class UserTenantMembership
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = default!;
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;
    public AppRole Role { get; set; } // TenantUser/TenantAdmin gibi
    public bool IsDefault { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
*/

/*
public class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required, EmailAddress] public string Email { get; set; } = default!;
    [Required] public string PasswordHash { get; set; } = default!;
    public AppRole Role { get; set; } = AppRole.TenantUser;

    // Platform kullanıcıları için null, tenant kullanıcıları için zorunlu
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
*/

// DTOs
//public record RegisterRequest(string Email, string Password, AppRole Role, Guid? TenantId);
//public record LoginRequest(string Email, string Password);
//public record LoginResponse(string Token, string Email, string Role, Guid? TenantId);
