namespace Backend.Application.DTOs.Users;

public record MembershipDto(
    Guid Id,
    Guid UserId,
    Guid TenantId,
    string Role,
    bool IsDefault,
    DateTime CreatedAt
);
