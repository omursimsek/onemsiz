using Backend.Application.Common;
using Xunit;

namespace Backend.Tests.Application.Common;

public class ResultTests
{
    [Fact]
    public void Ok_ShouldBeSuccess()
    {
        var r = Result.Ok();
        Assert.True(r.Success);
        Assert.Null(r.StatusCode);
    }

    [Fact]
    public void Fail_ShouldContainErrorAndStatus()
    {
        var r = Result.Fail("bad", 400);
        Assert.False(r.Success);
        Assert.Equal("bad", r.Error);
        Assert.Equal(400, r.StatusCode);
    }

    [Fact]
    public void OkT_ShouldCarryValue()
    {
        var r = Result<string>.Ok("hello");
        Assert.True(r.Success);
        Assert.Equal("hello", r.Value);
    }
}
