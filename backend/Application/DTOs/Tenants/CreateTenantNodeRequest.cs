namespace Backend.Application.DTOs.Tenants;

public record CreateTenantNodeRequest(
    string Name,
    string Slug,
    int Level,              // 0=Organization,1=Country,2=Office (TenantLevel ile eşleşecek)
    Guid? ParentId,
    string? DefaultCulture  // null/empty → "en"
);
