using Backend.Application.Common;
using Backend.Application.DTOs.Tenants;

namespace Backend.Application.Interfaces;

public interface ITenantPublicService
{
    Task<Result<TenantPublicInfoDto>> GetCurrentTenantAsync(Guid tenantId, CancellationToken ct);
}
