using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.DTOs.Tenants;
using Backend.Application.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/tenants")]
[Authorize(Policy = "PlatformOnly")]
public class PlatformTenantsHierarchyController : ControllerBase
{
    private readonly ITenantHierarchyService _svc;
    public PlatformTenantsHierarchyController(ITenantHierarchyService svc) => _svc = svc;

    [HttpPost("node")]
    public async Task<IActionResult> CreateNode([FromBody] CreateTenantNodeRequest dto, CancellationToken ct)
    {
        var res = await _svc.CreateNodeAsync(dto, ct);
        if (!res.Success)
            return StatusCode(res.StatusCode ?? 400, new { error = res.Error });
        return Ok(res.Value);
    }

    [HttpGet("tree")]
    public async Task<IActionResult> GetTree(CancellationToken ct)
    {
        var res = await _svc.GetTreeAsync(ct);
        if (!res.Success)
            return StatusCode(res.StatusCode ?? 400, new { error = res.Error });
        return Ok(res.Value);
    }
}
