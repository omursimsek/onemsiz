using Backend.Application.Common;
using Backend.Application.DTOs.Tenants;

namespace Backend.Application.Interfaces;

public interface ITenantService
{
    Task<Result<TenantDto>> CreateAsync(CreateTenantRequest req, CancellationToken ct);
    Task<Result<List<TenantDto>>> ListAsync(CancellationToken ct);
    Task<Result<string>> UploadLogoAsync(Guid tenantId, string fileName, string contentType, Stream fileStream, CancellationToken ct);
    Task<Result> ToggleAsync(Guid tenantId, bool isActive, CancellationToken ct);
}
