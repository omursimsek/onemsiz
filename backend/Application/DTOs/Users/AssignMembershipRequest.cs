namespace Backend.Application.DTOs.Users;

public record AssignMembershipRequest(
    Guid UserId,
    Guid TenantId,
    string Role,   // "TenantUser" | "TenantAdmin"
    bool IsDefault
);
