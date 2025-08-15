using System;
using System.Threading.Tasks;
using Backend.Application.DTOs.Tenants;
using Backend.Application.Services;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;
using Backend.Tests.Utils;
using Xunit;

namespace Backend.Tests.Application.Services;

public class TenantHierarchyServiceTests
{
    [Fact]
    public async Task CreateNodeAsync_Fails_WhenNameOrSlugMissing()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateNodeAsync_Fails_WhenNameOrSlugMissing));
        var svc = new TenantHierarchyService(db);

        var req = new CreateTenantNodeRequest("", "", (int)TenantLevel.Organization, null, null);
        var res = await svc.CreateNodeAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(400, res.StatusCode);
        Assert.Contains("Name and Slug are required", res.Error);
    }

    [Fact]
    public async Task CreateNodeAsync_Fails_WhenLevelInvalid()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateNodeAsync_Fails_WhenLevelInvalid));
        var svc = new TenantHierarchyService(db);

        var req = new CreateTenantNodeRequest("Test", "test", 5, null, null);
        var res = await svc.CreateNodeAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(400, res.StatusCode);
        Assert.Contains("Level must be 0..2", res.Error);
    }

    [Fact]
    public async Task CreateNodeAsync_Fails_WhenSlugExists()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateNodeAsync_Fails_WhenSlugExists));
        db.Tenants.Add(new Tenant { Slug = "existing", Name = "Existing", Path = "existing", Level = TenantLevel.Organization });
        await db.SaveChangesAsync();

        var svc = new TenantHierarchyService(db);
        var req = new CreateTenantNodeRequest("Test", "existing", 0, null, null);
        var res = await svc.CreateNodeAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(409, res.StatusCode);
        Assert.Contains("Slug already exists", res.Error);
    }

    [Fact]
    public async Task CreateNodeAsync_Fails_WhenParentNotFound()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateNodeAsync_Fails_WhenParentNotFound));
        var svc = new TenantHierarchyService(db);

        var req = new CreateTenantNodeRequest("Child", "child", 1, Guid.NewGuid(), null);
        var res = await svc.CreateNodeAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(404, res.StatusCode);
        Assert.Contains("Parent not found", res.Error);
    }

    [Fact]
    public async Task CreateNodeAsync_Fails_WhenChildLevelIsNotGreaterThanParent()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateNodeAsync_Fails_WhenChildLevelIsNotGreaterThanParent));
        var parent = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Parent",
            Slug = "parent",
            Level = TenantLevel.Country,
            Path = "parent"
        };
        db.Tenants.Add(parent);
        await db.SaveChangesAsync();

        var svc = new TenantHierarchyService(db);
        var req = new CreateTenantNodeRequest("Child", "child", (int)TenantLevel.Country, parent.Id, null);
        var res = await svc.CreateNodeAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(400, res.StatusCode);
        Assert.Contains("Child level must be greater than parent level", res.Error);
    }

    [Fact]
    public async Task CreateNodeAsync_Fails_WhenRootNodeLevelNotOrganization()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateNodeAsync_Fails_WhenRootNodeLevelNotOrganization));
        var svc = new TenantHierarchyService(db);

        var req = new CreateTenantNodeRequest("RootCountry", "root-country", (int)TenantLevel.Country, null, null);
        var res = await svc.CreateNodeAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(400, res.StatusCode);
        Assert.Contains("Root nodes must be Organization level", res.Error);
    }

    [Fact]
    public async Task CreateNodeAsync_Succeeds_ForValidRootNode()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateNodeAsync_Succeeds_ForValidRootNode));
        var svc = new TenantHierarchyService(db);

        var req = new CreateTenantNodeRequest("RootOrg", "Root Org", (int)TenantLevel.Organization, null, "en");
        var res = await svc.CreateNodeAsync(req, default);

        Assert.True(res.Success);
        Assert.NotNull(res.Value);
        Assert.Equal("root-org", res.Value!.Slug);
        Assert.Equal(0, res.Value.Level);
        Assert.Null(res.Value.ParentId);
        Assert.Equal("en", res.Value.DefaultCulture);
    }

    [Fact]
    public async Task CreateNodeAsync_Succeeds_ForValidChild()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateNodeAsync_Succeeds_ForValidChild));
        var parent = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "ParentOrg",
            Slug = "parent-org",
            Level = TenantLevel.Organization,
            Path = "parent-org"
        };
        db.Tenants.Add(parent);
        await db.SaveChangesAsync();

        var svc = new TenantHierarchyService(db);
        var req = new CreateTenantNodeRequest("ChildCountry", "child-country", (int)TenantLevel.Country, parent.Id, "tr");
        var res = await svc.CreateNodeAsync(req, default);

        Assert.True(res.Success);
        Assert.NotNull(res.Value);
        Assert.Equal("child-country", res.Value!.Slug);
        Assert.Equal((int)TenantLevel.Country, res.Value.Level);
        Assert.Equal(parent.Id, res.Value.ParentId);
        Assert.Equal("parent-org.child-country", res.Value.Path);
    }
}
