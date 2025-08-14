using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.DTOs.Auth;
using Backend.Application.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(GroupName = "v1")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [Authorize(Policy = "SuperAdminOnly")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        var result = await _auth.RegisterAsync(req, ct);
        if (!result.Success)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error ?? "Bad Request" });

        return Ok(new { message = "Registered" });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        var result = await _auth.LoginAsync(req, ct);
        if (!result.Success || result.Value is null)
            return StatusCode(result.StatusCode ?? 401, new { error = result.Error ?? "Unauthorized" });

        return Ok(result.Value);
    }
}

