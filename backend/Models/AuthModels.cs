using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public enum AppRole { SuperAdmin, Staff, TenantAdmin, TenantUser }

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required, MaxLength(160)]
    public string Name { get; set; } = default!;
    [Required, MaxLength(80)]
    public string Slug { get; set; } = default!; // subdomain / kısa ad
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

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

// DTOs
public record RegisterRequest(string Email, string Password, AppRole Role, Guid? TenantId);
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Email, string Role, Guid? TenantId);
