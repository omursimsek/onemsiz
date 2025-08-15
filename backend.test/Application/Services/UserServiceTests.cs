using Backend.Application.Services;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;
using Backend.Tests.Utils;
using Xunit;

namespace Backend.Tests.Application.Services;

public class UserServiceTests
{
    [Fact]
    public async Task ListAsync_FiltersByTenant()
    {
        var db = TestDbFactory.CreateInMemory(nameof(ListAsync_FiltersByTenant));
        var (org, country, office, user) = Seed.BasicTenantWithUser(db);

        db.Users.Add(new AppUser{
            Email="staff@platform.com",
            PasswordHash = "x",
            Role = AppRole.Staff,
            IsActive=true
        });
        db.SaveChanges();

        var svc = new UserService(db);
        var all = await svc.ListAsync(null, default);
        Assert.True(all.Success);
        Assert.True(all.Value!.Count >= 2);

        var tenantOnly = await svc.ListAsync(office.Id, default);
        Assert.True(tenantOnly.Success);
        Assert.Single(tenantOnly.Value!); // sadece office kullanıcısı
    }
}
