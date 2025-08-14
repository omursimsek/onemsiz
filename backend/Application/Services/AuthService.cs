using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Backend.Application.Common;
using Backend.Application.DTOs.Auth;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;
using Backend.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _token; // Infrastructure/Security/TokenService

    public AuthService(AppDbContext db, ITokenService token)
    {
        _db = db;
        _token = token;
    }

    public async Task<Result> RegisterAsync(RegisterRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return Result.Fail("Email and Password are required.");

        var exists = await _db.Users.AnyAsync(u => u.Email == req.Email, ct);
        if (exists) return Result.Fail("User already exists.", statusCode: 409);

        if ((req.Role is AppRole.TenantAdmin or AppRole.TenantUser) && req.TenantId is null)
            return Result.Fail("TenantId is required for tenant users.");

        if (req.TenantId is Guid tid && !await _db.Tenants.AnyAsync(t => t.Id == tid, ct))
            return Result.Fail("Tenant not found.", statusCode: 404);

        var user = new AppUser
        {
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = req.Role,
            TenantId = req.TenantId,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return Result.Ok();
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest req, CancellationToken ct)
    {
        var user = await _db.Users.Include(u => u.Tenant)
                                  .FirstOrDefaultAsync(u => u.Email == req.Email, ct);
        if (user is null || !user.IsActive)
            return Result<LoginResponse>.Fail("Unauthorized", statusCode: 401);

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Result<LoginResponse>.Fail("Unauthorized", statusCode: 401);

        if (user.TenantId is Guid && (user.Tenant is null || !user.Tenant.IsActive))
            return Result<LoginResponse>.Fail("Unauthorized", statusCode: 401);

        // claims
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };
        if (user.TenantId is Guid tid)
            claims.Add(new("tid", tid.ToString()));

        var token = _token.CreateToken(claims);
        var dto = new LoginResponse(token, user.Email, user.Role.ToString(), user.TenantId);
        return Result<LoginResponse>.Ok(dto);
    }
}
