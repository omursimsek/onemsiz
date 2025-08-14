namespace Backend.Application.DTOs.Tenants;

public record TenantPublicInfoDto(
    Guid Id,
    string Name,
    string Slug,
    string DefaultCulture,
    string? LogoPath // relative path (/tenants/{id}/logo.png)
);
