using Microsoft.EntityFrameworkCore;
using Backend.Application.DTOs.Locations;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;

namespace Backend.Application.Services;

public class LocationService : ILocationService
{
    private readonly AppDbContext _db;
    public LocationService(AppDbContext db) => _db = db;

    public async Task<LocationDto?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var x = await _db.Locations
            .Include(l => l.Identifiers)
            .FirstOrDefaultAsync(l => l.Id == id, ct);
        return x is null ? null : Map(x);
    }

    public async Task<IReadOnlyList<LocationDto>> SearchAsync(
        string? query, string? country, string? scheme, string? code, int take = 50, CancellationToken ct = default)
    {
        IQueryable<Location> q = _db.Locations.Include(l => l.Identifiers);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var ql = query.Trim().ToLower();
            q = q.Where(l => l.Name.ToLower().Contains(ql) || (l.NameAscii != null && l.NameAscii.ToLower().Contains(ql)));
        }
        if (!string.IsNullOrWhiteSpace(country))
        {
            var c2 = country.Trim().ToUpper();
            q = q.Where(l => l.CountryISO2 == c2);
        }
        if (!string.IsNullOrWhiteSpace(scheme))
        {
            if (Enum.TryParse<CodeScheme>(scheme, true, out var sch))
                q = q.Where(l => l.Identifiers.Any(i => i.Scheme == sch));
        }
        if (!string.IsNullOrWhiteSpace(code))
        {
            var cd = code.Trim().ToUpper();
            q = q.Where(l => l.Identifiers.Any(i => i.Code == cd));
        }

        var list = await q.OrderBy(l => l.Name).Take(take).ToListAsync(ct);
        return list.Select(Map).ToList();
    }

    public async Task<LocationDto> CreateAsync(LocationCreateRequest req, CancellationToken ct = default)
    {
        var loc = new Location
        {
            Name = req.Name,
            NameAscii = req.NameAscii,
            CountryISO2 = req.CountryISO2,
            Subdivision = req.Subdivision,
            Kind = req.Kind,
            IsActive = true
        };

        if (!string.IsNullOrWhiteSpace(req.PrimaryCode) && !string.IsNullOrWhiteSpace(req.PrimaryScheme))
        {
            if (!Enum.TryParse<CodeScheme>(req.PrimaryScheme, true, out var sch))
                throw new ArgumentException("Invalid code scheme");
            loc.Identifiers.Add(new LocationIdentifier
            {
                Scheme = sch,
                Code = req.PrimaryCode!.Trim().ToUpper()
            });
        }

        _db.Locations.Add(loc);
        await _db.SaveChangesAsync(ct);
        return Map(loc);
    }

    public async Task<LocationDto?> UpdateAsync(Guid id, LocationUpdateRequest req, CancellationToken ct = default)
    {
        var loc = await _db.Locations.Include(l => l.Identifiers).FirstOrDefaultAsync(l => l.Id == id, ct);
        if (loc is null) return null;

        loc.Name = req.Name;
        loc.NameAscii = req.NameAscii;
        loc.CountryISO2 = req.CountryISO2;
        loc.Subdivision = req.Subdivision;
        loc.Kind = req.Kind;
        loc.IsActive = req.IsActive;

        await _db.SaveChangesAsync(ct);
        return Map(loc);
    }

    public async Task<bool> AddIdentifierAsync(Guid locationId, string scheme, string code, CancellationToken ct = default)
    {
        var loc = await _db.Locations.FirstOrDefaultAsync(l => l.Id == locationId, ct);
        if (loc is null) return false;

        if (!Enum.TryParse<CodeScheme>(scheme, true, out var sch)) return false;
        var c = code.Trim().ToUpper();

        var exists = await _db.LocationIdentifiers.AnyAsync(i => i.Scheme == sch && i.Code == c, ct);
        if (exists) return true; // idempotent

        _db.LocationIdentifiers.Add(new LocationIdentifier { LocationId = loc.Id, Scheme = sch, Code = c });
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RemoveIdentifierAsync(Guid locationId, Guid identifierId, CancellationToken ct = default)
    {
        var ident = await _db.LocationIdentifiers.FirstOrDefaultAsync(i => i.Id == identifierId && i.LocationId == locationId, ct);
        if (ident is null) return false;
        _db.LocationIdentifiers.Remove(ident);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static LocationDto Map(Location x) =>
        new LocationDto(
            x.Id, x.Name, x.NameAscii, x.CountryISO2, x.Subdivision, x.Kind, x.IsActive, x.CreatedAt,
            x.Identifiers.Select(i => new IdentifierDto(i.Id, i.Scheme.ToString(), i.Code)).ToList()
        );
}
