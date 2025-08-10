using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;

namespace Backend.Controllers;

/// <summary>Authentication endpoints (register/login).</summary>
[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(GroupName = "v1")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    /// <summary>Registers a new user (SuperAdmin only).</summary>
    [Authorize(Policy = "SuperAdminOnly")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Email and Password are required.");

        var exists = await _db.Users.AnyAsync(u => u.Email == req.Email);
        if (exists) return Conflict("User already exists.");

        if ((req.Role == AppRole.TenantAdmin || req.Role == AppRole.TenantUser) && req.TenantId is null)
            return BadRequest("TenantId is required for tenant users.");

        if (req.TenantId is Guid tid && !await _db.Tenants.AnyAsync(t => t.Id == tid))
            return BadRequest("Tenant not found.");

        var user = new AppUser
        {
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = req.Role,
            TenantId = req.TenantId
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Registered" });
    }

    /// <summary>Authenticates a user and returns a JWT.</summary>
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users.Include(u => u.Tenant).FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user is null || !user.IsActive) return Unauthorized();

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized();

        if (user.TenantId is Guid && (user.Tenant is null || !user.Tenant.IsActive))
            return Unauthorized();

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "dev_secret_change_me"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };
        if (user.TenantId is Guid tid)
            claims.Add(new Claim("tid", tid.ToString()));

        var expiresMinutes = double.TryParse(_config["Jwt:ExpireMinutes"], out var m) ? m : 480;
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: creds);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return Ok(new LoginResponse(tokenString, user.Email, user.Role.ToString(), user.TenantId));
    }
}
