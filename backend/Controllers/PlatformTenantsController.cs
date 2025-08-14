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


/*
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
//using Backend.Models;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/tenants")]
[Authorize(Policy = "SuperAdminOnly")]
public class PlatformTenantsController : ControllerBase
{
    private readonly AppDbContext _db;
    public PlatformTenantsController(AppDbContext db) => _db = db;

    public record CreateTenantDto(string Name, string Slug, string DefaultCulture = "en");

    [HttpPost]
    public async Task<IActionResult> CreateTenant([FromBody] CreateTenantDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Name and Slug are required.");
        if (await _db.Tenants.AnyAsync(t => t.Slug == dto.Slug))
            return Conflict("Slug already exists.");

        var tenant = new Tenant { Name = dto.Name, Slug = dto.Slug, DefaultCulture = dto.DefaultCulture };
        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync();
        return Ok(new {
            tenant.Id, tenant.Name, tenant.Slug, tenant.IsActive, tenant.CreatedAt,
            tenant.DefaultCulture, tenant.LogoPath
        });
    }

    [HttpGet]
    public async Task<IActionResult> ListTenants()
    {
        var baseUrl = $"{Request.Scheme}://localhost:8080";
        var list = await _db.Tenants
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new {
                t.Id, t.Name, t.Slug, t.IsActive, t.CreatedAt, t.DefaultCulture,
                LogoUrl = t.LogoPath != null ? baseUrl + t.LogoPath : null
            }).ToListAsync();
        return Ok(list);
    }

    // 👇 Logo yükleme: multipart/form-data ile file alanı
    [HttpPost("{tenantId:guid}/logo")]
    public async Task<IActionResult> UploadLogo(Guid tenantId, IFormFile file)
    {
        var tenant = await _db.Tenants.FindAsync(tenantId);
        if (tenant is null) return NotFound();

        if (file is null || file.Length == 0) return BadRequest("File is empty.");
        var allowed = new[] { "image/png", "image/svg+xml", "image/webp" };
        if (!allowed.Contains(file.ContentType)) return BadRequest("Only PNG/SVG/WEBP allowed.");

        // Kaydetme yolu
        var dir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "tenants", tenantId.ToString());
        Directory.CreateDirectory(dir);

        // İsim: logo.png|svg|webp
        var ext = file.ContentType switch {
            "image/png" => ".png",
            "image/svg+xml" => ".svg",
            "image/webp" => ".webp",
            _ => ".bin"
        };
        var filePath = Path.Combine(dir, "logo" + ext);

        using (var stream = System.IO.File.Create(filePath))
            await file.CopyToAsync(stream);

        // Public path
        tenant.LogoPath = $"/tenants/{tenantId}/logo{ext}";
        await _db.SaveChangesAsync();

        var url = $"{Request.Scheme}://{Request.Host}{tenant.LogoPath}";
        return Ok(new { tenant.Id, LogoUrl = url });
    }

    [HttpPost("{tenantId:guid}/toggle")]
    public async Task<IActionResult> ToggleTenant(Guid tenantId, [FromQuery] bool isActive)
    {
        var t = await _db.Tenants.FindAsync(tenantId);
        if (t is null) return NotFound();
        t.IsActive = isActive;
        await _db.SaveChangesAsync();
        return Ok(new { t.Id, t.IsActive });
    }
}
*/