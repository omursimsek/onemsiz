using Backend.Application.Common;
using Backend.Application.DTOs.Tenants;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Domain.ValueObjects; // TenantPath
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Services;

public class TenantHierarchyService : ITenantHierarchyService
{
    private readonly AppDbContext _db;

    public TenantHierarchyService(AppDbContext db) => _db = db;

    public async Task<Result<TenantNodeDto>> CreateNodeAsync(CreateTenantNodeRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Slug))
            return Result<TenantNodeDto>.Fail("Name and Slug are required.", 400);

        // Level doğrulama
        if (req.Level < 0 || req.Level > 2)
            return Result<TenantNodeDto>.Fail("Level must be 0..2 (Organization/Country/Office).", 400);

        var slug = TenantPath.Slugify(req.Slug);

        var exists = await _db.Tenants.AnyAsync(t => t.Slug == slug, ct);
        if (exists) return Result<TenantNodeDto>.Fail("Slug already exists.", 409);

        string? parentPath = null;
        Tenant? parent = null;

        if (req.ParentId.HasValue)
        {
            parent = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == req.ParentId.Value, ct);
            if (parent is null) return Result<TenantNodeDto>.Fail("Parent not found.", 404);

            parentPath = parent.Path;

            // İsteğe bağlı: hiyerarşi kuralı (child level > parent level)
            var childLevel = (TenantLevel)req.Level;
            if ((int)childLevel <= (int)parent.Level)
                return Result<TenantNodeDto>.Fail("Child level must be greater than parent level.", 400);
        }
        else
        {
            // Köke yalnızca Organization (0) izin ver
            if (req.Level != (int)TenantLevel.Organization)
                return Result<TenantNodeDto>.Fail("Root nodes must be Organization level (0).", 400);
        }

        var node = new Tenant
        {
            Name = req.Name.Trim(),
            Slug = slug,
            Level = (TenantLevel)req.Level,
            ParentId = req.ParentId,
            DefaultCulture = string.IsNullOrWhiteSpace(req.DefaultCulture) ? "en" : req.DefaultCulture!.Trim(),
            Path = TenantPath.BuildPath(parentPath, slug),
            IsActive = true
        };

        _db.Tenants.Add(node);
        await _db.SaveChangesAsync(ct);

        return Result<TenantNodeDto>.Ok(new TenantNodeDto(
            node.Id, node.Name, node.Slug, (int)node.Level, node.ParentId,
            node.Path, node.DefaultCulture, node.IsActive, node.CreatedAt
        ));
    }

    public async Task<Result<List<TenantNodeDto>>> GetTreeAsync(CancellationToken ct)
    {
        var nodes = await _db.Tenants
            .OrderBy(t => t.Level).ThenBy(t => t.Name)
            .Select(t => new TenantNodeDto(
                t.Id, t.Name, t.Slug, (int)t.Level, t.ParentId, t.Path,
                t.DefaultCulture, t.IsActive, t.CreatedAt
            ))
            .ToListAsync(ct);

        return Result<List<TenantNodeDto>>.Ok(nodes);
    }
}
