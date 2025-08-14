using Backend.Application.Common;
using Backend.Application.DTOs.Users;

namespace Backend.Application.Interfaces;

public interface IUserService
{
    Task<Result<List<UserDto>>> ListAsync(Guid? tenantId, CancellationToken ct);
    Task<Result> ToggleAsync(Guid id, bool isActive, CancellationToken ct);
}
