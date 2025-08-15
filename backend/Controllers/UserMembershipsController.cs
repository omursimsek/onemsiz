using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.DTOs.Users;
using Backend.Application.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/users")]
[Authorize(Policy = "PlatformOnly")]
public class UserMembershipsController : ControllerBase
{
    private readonly IUserMembershipService _svc;
    public UserMembershipsController(IUserMembershipService svc) => _svc = svc;

    [HttpPost("memberships")]
    public async Task<IActionResult> Assign([FromBody] AssignMembershipRequest dto, CancellationToken ct)
    {
        var res = await _svc.AssignAsync(dto, ct);
        if (!res.Success) return StatusCode(res.StatusCode ?? 400, new { error = res.Error });
        return Ok(res.Value);
    }
}
