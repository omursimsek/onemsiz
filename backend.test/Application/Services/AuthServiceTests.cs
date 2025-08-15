using System;
using System.Threading.Tasks;
using Backend.Application.DTOs.Auth;
using Backend.Application.Services;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;
using Backend.Tests.Utils;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace Backend.Tests.Application.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_Fails_WhenEmailOrPasswordMissing()
    {
        var db = TestDbFactory.CreateInMemory(nameof(RegisterAsync_Fails_WhenEmailOrPasswordMissing));
        var tenant = new Domain.Entities.Tenant { Id = Guid.NewGuid(), Name = "ValidTenant", Slug = "valid-tenant", IsActive = true };
        db.Tenants.Add(tenant);
        var svc = new AuthService(db, TokenServiceStub.Create());

        var req = new RegisterRequest("", "", AppRole.TenantUser, tenant.Id);

        var res = await svc.RegisterAsync(req, default);

        Assert.False(res.Success);
        Assert.Contains("Email and Password are required", res.Error);
    }

    [Fact]
    public async Task RegisterAsync_Fails_WhenUserAlreadyExists()
    {
        var db = TestDbFactory.CreateInMemory(nameof(RegisterAsync_Fails_WhenUserAlreadyExists));
        db.Users.Add(new() { Email = "existing@user.com", PasswordHash = "hashed", IsActive = true });
        var tenant = new Domain.Entities.Tenant { Id = Guid.NewGuid(), Name = "ValidTenant", Slug = "valid-tenant", IsActive = true };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        var svc = new AuthService(db, TokenServiceStub.Create());

        var req = new RegisterRequest("existing@user.com", "123456", AppRole.TenantUser, tenant.Id);

        var res = await svc.RegisterAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(409, res.StatusCode);
    }

    [Fact]
    public async Task RegisterAsync_Fails_WhenTenantRoleGivenButTenantIdMissing()
    {
        var db = TestDbFactory.CreateInMemory(nameof(RegisterAsync_Fails_WhenTenantRoleGivenButTenantIdMissing));
        var svc = new AuthService(db, TokenServiceStub.Create());

        var req = new RegisterRequest("user@tenant.com", "123456", AppRole.TenantUser, null);


        var res = await svc.RegisterAsync(req, default);

        Assert.False(res.Success);
        Assert.Contains("TenantId is required", res.Error);
    }

    [Fact]
    public async Task RegisterAsync_Fails_WhenTenantNotFound()
    {
        var db = TestDbFactory.CreateInMemory(nameof(RegisterAsync_Fails_WhenTenantNotFound));
        var svc = new AuthService(db, TokenServiceStub.Create());

        var req = new RegisterRequest("user@tenant.com", "123456", AppRole.TenantAdmin, Guid.NewGuid());



        var res = await svc.RegisterAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(404, res.StatusCode);
    }

    [Fact]
    public async Task RegisterAsync_Succeeds_WhenValid()
    {
        var db = TestDbFactory.CreateInMemory(nameof(RegisterAsync_Succeeds_WhenValid));
        var tenant = new Domain.Entities.Tenant { Id = Guid.NewGuid(), Name = "ValidTenant", Slug = "valid-tenant", IsActive = true };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        var svc = new AuthService(db, TokenServiceStub.Create());

        var req = new RegisterRequest("newuser@tenant.com", "password123", AppRole.TenantUser, tenant.Id);

        var res = await svc.RegisterAsync(req, default);

        Assert.True(res.Success);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        Assert.NotNull(user);
        Assert.Equal(AppRole.TenantUser, user.Role);
        Assert.Equal(tenant.Id, user.TenantId);
    }
}
