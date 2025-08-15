using Backend.Application.DTOs.Users;
using Backend.Application.Services;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;
using Backend.Tests.Utils;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests.Application.Services;

public class UserMembershipServiceTests
{
    [Fact]
    public async Task AssignAsync_CreatesMembership_And_RespectsDefaultUniqueness()
    {
        var db = TestDbFactory.CreateInMemory(nameof(AssignAsync_CreatesMembership_And_RespectsDefaultUniqueness));
        var (org, country, office, user) = Seed.BasicTenantWithUser(db);

        var svc = new UserMembershipService(db);

        // 1) İlk default üyelik
        var r1 = await svc.AssignAsync(new AssignMembershipRequest(
            user.Id, office.Id, nameof(AppRole.TenantUser), true), default);
        Assert.True(r1.Success);
        Assert.True(r1.Value!.IsDefault);

        // 2) Aynı kullanıcıya aynı tenant’ta ikinci default → önceki default false olmalı
        var r2 = await svc.AssignAsync(new AssignMembershipRequest(
            user.Id, country.Id, nameof(AppRole.TenantAdmin), true), default);
        Assert.True(r2.Success);
        Assert.True(r2.Value!.IsDefault);

        var defaults = await db.Set<UserTenantMembership>()
            .Where(m => m.UserId == user.Id && m.IsDefault)
            .CountAsync();
        Assert.Equal(1, defaults);
    }

    [Fact]
    public async Task AssignAsync_Fails_WhenDuplicateMembership()
    {
        var db = TestDbFactory.CreateInMemory(nameof(AssignAsync_Fails_WhenDuplicateMembership));
        var (org, country, office, user) = Seed.BasicTenantWithUser(db);
        var svc = new UserMembershipService(db);

        var ok = await svc.AssignAsync(new AssignMembershipRequest(
            user.Id, office.Id, nameof(AppRole.TenantUser), false), default);
        Assert.True(ok.Success);

        var dup = await svc.AssignAsync(new AssignMembershipRequest(
            user.Id, office.Id, nameof(AppRole.TenantUser), false), default);
        Assert.False(dup.Success);
        Assert.Equal(409, dup.StatusCode);
    }

    [Fact]
    public async Task AssignAsync_Fails_WhenTenantInactive()
    {
        var db = TestDbFactory.CreateInMemory(nameof(AssignAsync_Fails_WhenTenantInactive));
        var (org, country, office, user) = Seed.BasicTenantWithUser(db);
        office.IsActive = false; db.SaveChanges();

        var svc = new UserMembershipService(db);

        var res = await svc.AssignAsync(new AssignMembershipRequest(
            user.Id, office.Id, nameof(AppRole.TenantUser), false), default);

        Assert.False(res.Success);
        Assert.Equal(409, res.StatusCode);
    }
}
