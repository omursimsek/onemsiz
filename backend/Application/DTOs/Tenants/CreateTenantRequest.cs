namespace Backend.Application.DTOs.Tenants;

public record CreateTenantRequest(
    string Name,
    string Slug,
    string DefaultCulture = "en"
);
