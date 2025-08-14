using Backend.Domain.Enums;

namespace Backend.Application.DTOs.Auth;

public record RegisterRequest(
    string Email, 
    string Password, 
    AppRole Role, 
    Guid? TenantId
);
