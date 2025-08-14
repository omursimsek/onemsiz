namespace Backend.Application.DTOs.Tenants;

public record TenantDto(
    Guid Id,
    string Name,
    string Slug,
    bool IsActive,
    DateTime CreatedAt,
    string DefaultCulture,
    string? LogoPath // relative public path (/tenants/{id}/logo.png)
);
