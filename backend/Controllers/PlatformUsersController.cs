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

/*
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
//using Backend.Models;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/users")]
[Authorize(Policy = "SuperAdminOnly")]
public class PlatformUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public PlatformUsersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? tenantId = null)
    {
        IQueryable<AppUser> q = _db.Users.Include(u => u.Tenant);
        if (tenantId is Guid tid) q = q.Where(u => u.TenantId == tid);

        var list = await q.OrderByDescending(u => u.CreatedAt)
            .Select(u => new {
                u.Id, u.Email, Role = u.Role.ToString(), u.IsActive, u.CreatedAt, u.TenantId,
                TenantName = u.Tenant != null ? u.Tenant.Name : null
            }).ToListAsync();

        return Ok(list);
    }

    [HttpPost("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, [FromQuery] bool isActive)
    {
        var u = await _db.Users.FindAsync(id);
        if (u is null) return NotFound();
        u.IsActive = isActive;
        await _db.SaveChangesAsync();
        return Ok(new { u.Id, u.IsActive });
    }
}
*/
