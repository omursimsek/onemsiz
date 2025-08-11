using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

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
