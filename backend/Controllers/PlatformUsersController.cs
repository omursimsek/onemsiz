using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/users")]
[Authorize(Policy = "SuperAdminOnly")]
public class PlatformUsersController : ControllerBase
{
    private readonly IUserService _users;
    public PlatformUsersController(IUserService users) => _users = users;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? tenantId = null, CancellationToken ct = default)
    {
        var res = await _users.ListAsync(tenantId, ct);
        if (!res.Success) return StatusCode(res.StatusCode ?? 400, new { error = res.Error });
        return Ok(res.Value);
    }

    [HttpPost("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, [FromQuery] bool isActive, CancellationToken ct = default)
    {
        var res = await _users.ToggleAsync(id, isActive, ct);
        if (!res.Success) return StatusCode(res.StatusCode ?? 400, new { error = res.Error });
        return Ok(new { Id = id, IsActive = isActive });
    }
}

