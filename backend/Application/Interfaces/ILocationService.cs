using Backend.Application.DTOs.Locations;

namespace Backend.Application.Interfaces;

public interface ILocationService
{
    Task<LocationDto?> GetAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<LocationDto>> SearchAsync(
        string? query, string? country, string? scheme, string? code, int take = 50, CancellationToken ct = default);

    Task<LocationDto> CreateAsync(LocationCreateRequest req, CancellationToken ct = default);
    Task<LocationDto?> UpdateAsync(Guid id, LocationUpdateRequest req, CancellationToken ct = default);

    Task<bool> AddIdentifierAsync(Guid locationId, string scheme, string code, CancellationToken ct = default);
    Task<bool> RemoveIdentifierAsync(Guid locationId, Guid identifierId, CancellationToken ct = default);
}
