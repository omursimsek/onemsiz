using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/users")]
[Authorize(Policy = "PlatformOnly")]
public class UserMembershipsController : ControllerBase
{
    private readonly AppDbContext _db;
    public UserMembershipsController(AppDbContext db) => _db = db;

    public record AssignMembershipDto(Guid UserId, Guid TenantId, string Role, bool IsDefault);

    [HttpPost("memberships")]
    public async Task<IActionResult> Assign([FromBody] AssignMembershipDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == dto.UserId);
        if (user is null) return NotFound(new { message = "User not found" });

        var tenant = await _db.Tenants.FirstOrDefaultAsync(x => x.Id == dto.TenantId);
        if (tenant is null) return NotFound(new { message = "Tenant not found" });

        if (!Enum.TryParse<AppRole>(dto.Role, out var role) || (role != AppRole.TenantUser && role != AppRole.TenantAdmin))
            return BadRequest(new { message = "Role must be TenantUser or TenantAdmin" });

        if (dto.IsDefault)
        {
            var existingDefaults = await _db.Set<UserTenantMembership>()
                .Where(m => m.UserId == dto.UserId && m.IsDefault)
                .ToListAsync();
            foreach (var m in existingDefaults) m.IsDefault = false;
        }

        var mem = new UserTenantMembership
        {
            UserId = dto.UserId,
            TenantId = dto.TenantId,
            Role = role,
            IsDefault = dto.IsDefault
        };
        _db.Set<UserTenantMembership>().Add(mem);
        await _db.SaveChangesAsync();

        return Ok(new { mem.Id, mem.UserId, mem.TenantId, Role = mem.Role.ToString(), mem.IsDefault });
    }
}
