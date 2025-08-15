using Backend.Application.Services;
using Backend.Infrastructure.Data;
using Backend.Tests.Utils;
using Xunit;

namespace Backend.Tests.Application.Services;

public class TenantPublicServiceTests
{
    [Fact]
    public async Task GetCurrentTenantAsync_ReturnsTenant_WhenActive()
    {
        var db = TestDbFactory.CreateInMemory(nameof(GetCurrentTenantAsync_ReturnsTenant_WhenActive));
        var (org, country, office, user) = Seed.BasicTenantWithUser(db);

        var svc = new TenantPublicService(db);
        var res = await svc.GetCurrentTenantAsync(office.Id, default);

        Assert.True(res.Success);
        Assert.NotNull(res.Value);
        Assert.Equal(office.Id, res.Value!.Id);
        Assert.Equal(office.Slug, res.Value!.Slug);
        Assert.Equal(office.DefaultCulture, res.Value!.DefaultCulture);
    }

    [Fact]
    public async Task GetCurrentTenantAsync_Fails_WhenNotFoundOrInactive()
    {
        var db = TestDbFactory.CreateInMemory(nameof(GetCurrentTenantAsync_Fails_WhenNotFoundOrInactive));
        var svc = new TenantPublicService(db);

        var res = await svc.GetCurrentTenantAsync(Guid.NewGuid(), default);
        Assert.False(res.Success);
        Assert.Equal(404, res.StatusCode);
    }
}
