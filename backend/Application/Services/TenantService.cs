using Backend.Application.Common;
using Backend.Application.DTOs.Tenants;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Backend.Infrastructure.Files;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Services;

public class TenantService : ITenantService
{
    private readonly AppDbContext _db;
    private readonly IFileStorage _files;

    public TenantService(AppDbContext db, IFileStorage files)
    {
        _db = db;
        _files = files;
    }

    public async Task<Result<TenantDto>> CreateAsync(CreateTenantRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Slug))
            return Result<TenantDto>.Fail("Name and Slug are required.", 400);

        var exists = await _db.Tenants.AnyAsync(t => t.Slug == req.Slug, ct);
        if (exists) return Result<TenantDto>.Fail("Slug already exists.", 409);

        var tenant = new Tenant
        {
            Name = req.Name,
            Slug = req.Slug,
            DefaultCulture = req.DefaultCulture
        };
        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync(ct);

        return Result<TenantDto>.Ok(new TenantDto(
            tenant.Id, tenant.Name, tenant.Slug,
            tenant.IsActive, tenant.CreatedAt,
            tenant.DefaultCulture, tenant.LogoPath
        ));
    }

    public async Task<Result<List<TenantDto>>> ListAsync(CancellationToken ct)
    {
        var list = await _db.Tenants
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TenantDto(
                t.Id, t.Name, t.Slug, t.IsActive, t.CreatedAt,
                t.DefaultCulture, t.LogoPath
            ))
            .ToListAsync(ct);

        return Result<List<TenantDto>>.Ok(list);
    }

    public async Task<Result<string>> UploadLogoAsync(Guid tenantId, string fileName, string contentType, Stream fileStream, CancellationToken ct)
    {
        var tenant = await _db.Tenants.FindAsync(new object?[] { tenantId }, ct);
        if (tenant is null) return Result<string>.Fail("Tenant not found.", 404);

        var okTypes = new[] { "image/png", "image/svg+xml", "image/webp" };
        if (!okTypes.Contains(contentType))
            return Result<string>.Fail("Only PNG/SVG/WEBP allowed.", 400);

        var ext = contentType switch {
            "image/png" => ".png",
            "image/svg+xml" => ".svg",
            "image/webp" => ".webp",
            _ => ".bin"
        };

        var relPath = $"/tenants/{tenantId}/logo{ext}";
        // Fiziksel olarak kaydet
        await _files.SaveAsync(relPath, fileStream, overwrite: true, ct);

        tenant.LogoPath = relPath;
        await _db.SaveChangesAsync(ct);

        return Result<string>.Ok(relPath);
    }

    public async Task<Result> ToggleAsync(Guid tenantId, bool isActive, CancellationToken ct)
    {
        var t = await _db.Tenants.FindAsync(new object?[] { tenantId }, ct);
        if (t is null) return Result.Fail("Tenant not found.", 404);

        t.IsActive = isActive;
        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
