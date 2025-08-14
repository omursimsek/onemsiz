using Backend.Application.DTOs.Auth;
using Backend.Application.Common;

namespace Backend.Application.Interfaces;

public interface IAuthService
{
    Task<Result> RegisterAsync(RegisterRequest req, CancellationToken ct);
    Task<Result<LoginResponse>> LoginAsync(LoginRequest req, CancellationToken ct);
}
