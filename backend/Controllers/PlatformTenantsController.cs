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

    public record CreateTenantDto(string Name, string Slug);

    [HttpPost]
    public async Task<IActionResult> CreateTenant([FromBody] CreateTenantDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Name and Slug are required.");
        if (await _db.Tenants.AnyAsync(t => t.Slug == dto.Slug))
            return Conflict("Slug already exists.");

        var tenant = new Tenant { Name = dto.Name, Slug = dto.Slug };
        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync();
        return Ok(tenant);
    }

    [HttpGet]
    public async Task<IActionResult> ListTenants()
    {
        var list = await _db.Tenants.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Ok(list);
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
