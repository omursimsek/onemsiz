using Backend.Application.Common;
using Backend.Application.DTOs.Users;

namespace Backend.Application.Interfaces;

public interface IUserMembershipService
{
    Task<Result<MembershipDto>> AssignAsync(AssignMembershipRequest req, CancellationToken ct);
}
