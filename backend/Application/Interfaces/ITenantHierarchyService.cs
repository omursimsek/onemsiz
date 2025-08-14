using Backend.Application.Common;
using Backend.Application.DTOs.Tenants;

namespace Backend.Application.Interfaces;

public interface ITenantHierarchyService
{
    Task<Result<TenantNodeDto>> CreateNodeAsync(CreateTenantNodeRequest req, CancellationToken ct);
    Task<Result<List<TenantNodeDto>>> GetTreeAsync(CancellationToken ct);
}
