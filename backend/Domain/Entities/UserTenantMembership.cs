using Backend.Domain.Enums;

namespace Backend.Domain.Entities;

public class UserTenantMembership
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public AppUser User { get; set; } = default!;

    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;

    public AppRole Role { get; set; } // TenantUser/TenantAdmin
    public bool IsDefault { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
