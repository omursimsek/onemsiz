using Backend.Application.Common;
using Backend.Application.DTOs.Users;
using Backend.Application.Interfaces;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    public UserService(AppDbContext db) => _db = db;

    public async Task<Result<List<UserDto>>> ListAsync(Guid? tenantId, CancellationToken ct)
    {
        IQueryable<Backend.Domain.Entities.AppUser> q = _db.Users.Include(u => u.Tenant);
        if (tenantId is Guid tid)
            q = q.Where(u => u.TenantId == tid);

        var list = await q.OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDto(
                u.Id,
                u.Email,
                u.Role.ToString(),
                u.IsActive,
                u.CreatedAt,
                u.TenantId,
                u.Tenant != null ? u.Tenant.Name : null
            ))
            .ToListAsync(ct);

        return Result<List<UserDto>>.Ok(list);
    }

    public async Task<Result> ToggleAsync(Guid id, bool isActive, CancellationToken ct)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (u is null) return Result.Fail("User not found.", 404);

        u.IsActive = isActive;
        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
