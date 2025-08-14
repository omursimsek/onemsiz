using Backend.Application.Common;
using Backend.Application.DTOs.Tenants;
using Backend.Application.Interfaces;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Services;

public class TenantPublicService : ITenantPublicService
{
    private readonly AppDbContext _db;
    public TenantPublicService(AppDbContext db) => _db = db;

    public async Task<Result<TenantPublicInfoDto>> GetCurrentTenantAsync(Guid tenantId, CancellationToken ct)
    {
        var t = await _db.Tenants
            .Where(x => x.Id == tenantId && x.IsActive)
            .Select(x => new TenantPublicInfoDto(
                x.Id, x.Name, x.Slug, x.DefaultCulture, x.LogoPath
            ))
            .FirstOrDefaultAsync(ct);

        return t is null
            ? Result<TenantPublicInfoDto>.Fail("Tenant not found.", 404)
            : Result<TenantPublicInfoDto>.Ok(t);
    }
}
