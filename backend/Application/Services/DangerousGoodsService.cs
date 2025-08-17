using Microsoft.EntityFrameworkCore;
using Backend.Application.DTOs.DangerousGoods;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;

namespace Backend.Application.Services;

public class DangerousGoodsService : IDangerousGoodsService
{
    private readonly AppDbContext _db;
    public DangerousGoodsService(AppDbContext db) => _db = db;

    public async Task<DangerousGoodsDto?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var x = await _db.DangerousGoods
            .Include(dg => dg.Identifiers)
            .FirstOrDefaultAsync(dg => dg.Id == id, ct);
        return x is null ? null : Map(x);
    }

    public async Task<IReadOnlyList<DangerousGoodsDto>> SearchAsync(
        string? query, string? unNumber, string? dgClass, string? scheme, string? code, int take = 50, CancellationToken ct = default)
    {
        IQueryable<DangerousGoods> q = _db.DangerousGoods.Include(dg => dg.Identifiers);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var ql = query.Trim().ToLower();
            q = q.Where(dg => dg.ProperShippingName.ToLower().Contains(ql) || 
                              (dg.TechnicalName != null && dg.TechnicalName.ToLower().Contains(ql)));
        }
        if (!string.IsNullOrWhiteSpace(unNumber))
        {
            var un = unNumber.Trim().ToUpper();
            q = q.Where(dg => dg.UNNumber == un);
        }
        if (!string.IsNullOrWhiteSpace(dgClass))
        {
            if (Enum.TryParse<DangerousGoodsClass>(dgClass, true, out var cls))
                q = q.Where(dg => dg.Class == cls);
        }
        if (!string.IsNullOrWhiteSpace(scheme))
        {
            if (Enum.TryParse<DangerousGoodsScheme>(scheme, true, out var sch))
                q = q.Where(dg => dg.Identifiers.Any(i => i.Scheme == sch));
        }
        if (!string.IsNullOrWhiteSpace(code))
        {
            var cd = code.Trim().ToUpper();
            q = q.Where(dg => dg.Identifiers.Any(i => i.Code == cd));
        }

        var list = await q.OrderBy(dg => dg.UNNumber).Take(take).ToListAsync(ct);
        return list.Select(Map).ToList();
    }

    public async Task<DangerousGoodsSearchResult> SearchWithPaginationAsync(
        string? query, string? unNumber, string? dgClass, string? scheme, string? code, int take = 50, int page = 1, CancellationToken ct = default)
    {
        IQueryable<DangerousGoods> q = _db.DangerousGoods.Include(dg => dg.Identifiers);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var ql = query.Trim().ToLower();
            q = q.Where(dg => dg.ProperShippingName.ToLower().Contains(ql) || 
                              (dg.TechnicalName != null && dg.TechnicalName.ToLower().Contains(ql)));
        }
        if (!string.IsNullOrWhiteSpace(unNumber))
        {
            var un = unNumber.Trim().ToUpper();
            q = q.Where(dg => dg.UNNumber == un);
        }
        if (!string.IsNullOrWhiteSpace(dgClass))
        {
            if (Enum.TryParse<DangerousGoodsClass>(dgClass, true, out var cls))
                q = q.Where(dg => dg.Class == cls);
        }
        if (!string.IsNullOrWhiteSpace(scheme))
        {
            if (Enum.TryParse<DangerousGoodsScheme>(scheme, true, out var sch))
                q = q.Where(dg => dg.Identifiers.Any(i => i.Scheme == sch));
        }
        if (!string.IsNullOrWhiteSpace(code))
        {
            var cd = code.Trim().ToUpper();
            q = q.Where(dg => dg.Identifiers.Any(i => i.Code == cd));
        }

        // Total count
        var totalCount = await q.CountAsync(ct);
        
        // Pagination
        var totalPages = (int)Math.Ceiling((double)totalCount / take);
        var currentPage = Math.Max(1, Math.Min(page, totalPages));
        var skip = (currentPage - 1) * take;
        
        // Get paginated results
        var dangerousGoods = await q.OrderBy(dg => dg.UNNumber)
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct);

        var hasNextPage = currentPage < totalPages;
        var hasPrevPage = currentPage > 1;

        return new DangerousGoodsSearchResult(
            dangerousGoods.Select(Map).ToList(),
            totalCount,
            totalPages,
            currentPage,
            take,
            hasNextPage,
            hasPrevPage
        );
    }

    public async Task<DangerousGoodsDto> CreateAsync(DangerousGoodsCreateRequest req, CancellationToken ct = default)
    {
        var dg = new DangerousGoods
        {
            UNNumber = req.UNNumber.Trim().ToUpper(),
            ProperShippingName = req.ProperShippingName,
            TechnicalName = req.TechnicalName,
            Class = req.Class,
            SubsidiaryRisk = req.SubsidiaryRisk,
            PackingGroup = req.PackingGroup,
            Labels = req.Labels,
            SpecialProvisions = req.SpecialProvisions,
            LimitedQuantity = req.LimitedQuantity,
            ExceptedQuantity = req.ExceptedQuantity,
            Notes = req.Notes,
            IsActive = true
        };

        if (!string.IsNullOrWhiteSpace(req.PrimaryScheme) && !string.IsNullOrWhiteSpace(req.PrimaryCode))
        {
            if (!Enum.TryParse<DangerousGoodsScheme>(req.PrimaryScheme, true, out var sch))
                throw new ArgumentException("Invalid dangerous goods scheme");
            dg.Identifiers.Add(new DangerousGoodsIdentifier
            {
                Scheme = sch,
                Code = req.PrimaryCode!.Trim().ToUpper()
            });
        }

        _db.DangerousGoods.Add(dg);
        await _db.SaveChangesAsync(ct);
        return Map(dg);
    }

    public async Task<DangerousGoodsDto?> UpdateAsync(Guid id, DangerousGoodsUpdateRequest req, CancellationToken ct = default)
    {
        var dg = await _db.DangerousGoods.Include(d => d.Identifiers).FirstOrDefaultAsync(d => d.Id == id, ct);
        if (dg is null) return null;

        dg.UNNumber = req.UNNumber.Trim().ToUpper();
        dg.ProperShippingName = req.ProperShippingName;
        dg.TechnicalName = req.TechnicalName;
        dg.Class = req.Class;
        dg.SubsidiaryRisk = req.SubsidiaryRisk;
        dg.PackingGroup = req.PackingGroup;
        dg.Labels = req.Labels;
        dg.SpecialProvisions = req.SpecialProvisions;
        dg.LimitedQuantity = req.LimitedQuantity;
        dg.ExceptedQuantity = req.ExceptedQuantity;
        dg.Notes = req.Notes;
        dg.IsActive = req.IsActive;
        dg.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Map(dg);
    }

    public async Task<bool> AddIdentifierAsync(Guid dangerousGoodsId, string scheme, string code, CancellationToken ct = default)
    {
        var dg = await _db.DangerousGoods.FirstOrDefaultAsync(d => d.Id == dangerousGoodsId, ct);
        if (dg is null) return false;

        if (!Enum.TryParse<DangerousGoodsScheme>(scheme, true, out var sch))
            return false;

        dg.Identifiers.Add(new DangerousGoodsIdentifier
        {
            Scheme = sch,
            Code = code.Trim().ToUpper()
        });

        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RemoveIdentifierAsync(Guid dangerousGoodsId, Guid identifierId, CancellationToken ct = default)
    {
        var dg = await _db.DangerousGoods.Include(d => d.Identifiers).FirstOrDefaultAsync(d => d.Id == dangerousGoodsId, ct);
        if (dg is null) return false;

        var identifier = dg.Identifiers.FirstOrDefault(i => i.Id == identifierId);
        if (identifier is null) return false;

        dg.Identifiers.Remove(identifier);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<DangerousGoodsStatistics> GetStatisticsAsync(CancellationToken ct = default)
    {
        var totalDangerousGoods = await _db.DangerousGoods.CountAsync(ct);
        var uniqueClasses = await _db.DangerousGoods.Select(dg => dg.Class).Distinct().CountAsync(ct);
        var totalIdentifiers = await _db.DangerousGoodsIdentifiers.CountAsync(ct);
        
        var now = DateTime.UtcNow;
        var thisMonthDangerousGoods = await _db.DangerousGoods
            .Where(dg => dg.CreatedAt.Month == now.Month && dg.CreatedAt.Year == now.Year)
            .CountAsync(ct);

        return new DangerousGoodsStatistics(totalDangerousGoods, uniqueClasses, totalIdentifiers, thisMonthDangerousGoods);
    }

    public async Task<IReadOnlyList<DangerousGoodsClassStatistics>> GetClassStatisticsAsync(CancellationToken ct = default)
    {
        var stats = await _db.DangerousGoods
            .GroupBy(dg => dg.Class)
            .Select(g => new DangerousGoodsClassStatistics(g.Key.ToString(), g.Count()))
            .OrderBy(s => s.Class)
            .ToListAsync(ct);

        return stats;
    }

    public async Task<IReadOnlyList<DangerousGoodsSchemeStatistics>> GetSchemeStatisticsAsync(CancellationToken ct = default)
    {
        var stats = await _db.DangerousGoodsIdentifiers
            .GroupBy(i => i.Scheme)
            .Select(g => new DangerousGoodsSchemeStatistics(g.Key.ToString(), g.Count()))
            .OrderBy(s => s.Scheme)
            .ToListAsync(ct);

        return stats;
    }

    private static DangerousGoodsDto Map(DangerousGoods x) =>
        new DangerousGoodsDto(
            x.Id, x.UNNumber, x.ProperShippingName, x.TechnicalName, x.Class.ToString(), x.SubsidiaryRisk,
            x.PackingGroup.ToString(), x.Labels, x.SpecialProvisions, x.LimitedQuantity, x.ExceptedQuantity,
            x.Notes, x.IsActive, x.CreatedAt, x.UpdatedAt,
            x.Identifiers.Select(i => new DangerousGoodsIdentifierDto(i.Id, i.Scheme.ToString(), i.Code, i.ExtraJson)).ToList()
        );
}
