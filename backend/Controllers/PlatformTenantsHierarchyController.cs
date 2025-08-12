using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/tenants")]
[Authorize(Policy = "PlatformOnly")]
public class PlatformTenantsHierarchyController : ControllerBase
{
    private readonly AppDbContext _db;
    public PlatformTenantsHierarchyController(AppDbContext db) => _db = db;

    public record CreateNodeDto(string Name, string Slug, int Level, Guid? ParentId, string? DefaultCulture);

    [HttpPost("node")]
    public async Task<IActionResult> CreateNode([FromBody] CreateNodeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest(new { message = "Name and Slug are required" });

        var slug = TenantPathHelper.Slugify(dto.Slug);
        var exists = await _db.Tenants.AnyAsync(t => t.Slug == slug);
        if (exists) return Conflict(new { message = "Slug already exists" });

        string? parentPath = null;
        if (dto.ParentId.HasValue)
        {
            var parent = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == dto.ParentId.Value);
            if (parent is null) return NotFound(new { message = "Parent not found" });
            parentPath = parent.Path;
        }

        var t = new Tenant
        {
            Name = dto.Name,
            Slug = slug,
            Level = (TenantLevel)dto.Level,
            ParentId = dto.ParentId,
            DefaultCulture = string.IsNullOrWhiteSpace(dto.DefaultCulture) ? "en" : dto.DefaultCulture!,
            Path = TenantPathHelper.BuildPath(parentPath, slug)
        };
        _db.Tenants.Add(t);
        await _db.SaveChangesAsync();

        return Ok(new { t.Id, t.Name, t.Slug, t.Level, t.ParentId, t.Path, t.DefaultCulture, t.IsActive, t.CreatedAt });
    }

    [HttpGet("tree")]
    public async Task<IActionResult> GetTree()
    {
        var nodes = await _db.Tenants
            .OrderBy(t => t.Level).ThenBy(t => t.Name)
            .Select(t => new {
                t.Id, t.Name, t.Slug, t.Level, t.ParentId, t.IsActive, t.DefaultCulture, t.Path
            }).ToListAsync();
        return Ok(nodes);
    }
}
