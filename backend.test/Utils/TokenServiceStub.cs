using System.Collections.Generic;
using System.Security.Claims;
using Backend.Application.Interfaces;
using Backend.Infrastructure.Security;

namespace Backend.Tests.Utils;

public static class TokenServiceStub
{
    public static ITokenService Create()
    {
        var stub = new Moq.Mock<ITokenService>();
        stub.Setup(t => t.CreateToken(Moq.It.IsAny<IEnumerable<Claim>>()))
            .Returns("fake-jwt-token");
        return stub.Object;
    }
}
