namespace Backend.Application.DTOs.Tenants;

public record TenantNodeDto(
    Guid Id,
    string Name,
    string Slug,
    int Level,
    Guid? ParentId,
    string? Path,
    string DefaultCulture,
    bool IsActive,
    DateTime CreatedAt
);
