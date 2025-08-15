using Backend.Application.DTOs.Tenants;
using Backend.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/tenants")]
[Authorize(Policy = "SuperAdminOnly")]
public class PlatformTenantsController : ControllerBase
{
    
    private readonly ITenantService _svc;

    public PlatformTenantsController(ITenantService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> CreateTenant([FromBody] CreateTenantRequest dto, CancellationToken ct)
    {
        var result = await _svc.CreateAsync(dto, ct);
        if (!result.Success)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });

        // Servis relatif path döner; burada absolute URL’e çeviriyoruz (UI kolaylığı)
        // var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var baseUrl = $"http://localhost:8080";
        var payload = result.Value! with
        {
            LogoPath = result.Value!.LogoPath is null ? null : baseUrl + result.Value!.LogoPath
        };
        return Ok(payload);
    }

    [HttpGet]
    public async Task<IActionResult> ListTenants(CancellationToken ct)
    {
        var result = await _svc.ListAsync(ct);
        if (!result.Success)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });

        // var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var baseUrl = $"http://localhost:8080";
        var list = result.Value!.Select(t => new {
            t.Id, t.Name, t.Slug, t.IsActive, t.CreatedAt, t.DefaultCulture,
            LogoUrl = t.LogoPath is null ? null : baseUrl + t.LogoPath
        });
        return Ok(list);
    }

    // multipart/form-data: name="file"
    [HttpPost("{tenantId:guid}/logo")]
    public async Task<IActionResult> UploadLogo(Guid tenantId, IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0) return BadRequest(new { error = "File is empty." });

        var rel = await _svc.UploadLogoAsync(tenantId, file.FileName, file.ContentType, file.OpenReadStream(), ct);
        if (!rel.Success)
            return StatusCode(rel.StatusCode ?? 400, new { error = rel.Error });

        var url = $"{Request.Scheme}://{Request.Host}{rel.Value}";
        return Ok(new { Id = tenantId, LogoUrl = url });
    }

    [HttpPost("{tenantId:guid}/toggle")]
    public async Task<IActionResult> ToggleTenant(Guid tenantId, [FromQuery] bool isActive, CancellationToken ct)
    {
        var result = await _svc.ToggleAsync(tenantId, isActive, ct);
        if (!result.Success)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });

        return Ok(new { Id = tenantId, IsActive = isActive });
    }
}
