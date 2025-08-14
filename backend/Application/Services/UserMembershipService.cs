using Backend.Application.Common;
using Backend.Application.DTOs.Users;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Services;

public class UserMembershipService : IUserMembershipService
{
    private readonly AppDbContext _db;
    public UserMembershipService(AppDbContext db) => _db = db;

    public async Task<Result<MembershipDto>> AssignAsync(AssignMembershipRequest req, CancellationToken ct)
    {
        if (!Enum.TryParse<AppRole>(req.Role, out var role) ||
            (role != AppRole.TenantUser && role != AppRole.TenantAdmin))
        {
            return Result<MembershipDto>.Fail("Role must be TenantUser or TenantAdmin.", 400);
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == req.UserId, ct);
        if (user is null) return Result<MembershipDto>.Fail("User not found.", 404);

        var tenant = await _db.Tenants.FirstOrDefaultAsync(x => x.Id == req.TenantId, ct);
        if (tenant is null) return Result<MembershipDto>.Fail("Tenant not found.", 404);
        if (!tenant.IsActive) return Result<MembershipDto>.Fail("Tenant is inactive.", 409);

        // Duplicate membership kontrolü (aynı user-tenant-role için)
        var already = await _db.Set<UserTenantMembership>()
            .AnyAsync(m => m.UserId == req.UserId && m.TenantId == req.TenantId && m.Role == role, ct);
        if (already) return Result<MembershipDto>.Fail("Membership already exists.", 409);

        // Varsayılan üyelik tek olsun → diğer default'ları kapat
        if (req.IsDefault)
        {
            var defaults = await _db.Set<UserTenantMembership>()
                .Where(m => m.UserId == req.UserId && m.IsDefault)
                .ToListAsync(ct);
            foreach (var d in defaults) d.IsDefault = false;
        }

        var mem = new UserTenantMembership
        {
            UserId = req.UserId,
            TenantId = req.TenantId,
            Role = role,
            IsDefault = req.IsDefault
        };

        _db.Set<UserTenantMembership>().Add(mem);
        await _db.SaveChangesAsync(ct);

        return Result<MembershipDto>.Ok(new MembershipDto(
            mem.Id, mem.UserId, mem.TenantId, mem.Role.ToString(), mem.IsDefault, mem.CreatedAt
        ));
    }
}
