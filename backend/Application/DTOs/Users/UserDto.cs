namespace Backend.Application.DTOs.Users;

public record UserDto(
    Guid Id,
    string Email,
    string Role,       // string gösterim (SuperAdmin/TenantAdmin/…)
    bool IsActive,
    DateTime CreatedAt,
    Guid? TenantId,
    string? TenantName
);
