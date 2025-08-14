namespace Backend.Application.DTOs.Auth;

public record LoginResponse(string Token, string Email, string Role, Guid? TenantId);   