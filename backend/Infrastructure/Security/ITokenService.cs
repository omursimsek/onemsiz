using System.Security.Claims;

namespace Backend.Infrastructure.Security;

public interface ITokenService
{
    string CreateToken(IEnumerable<Claim> claims);
}
