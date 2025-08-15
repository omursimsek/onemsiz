using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Backend.Application.DTOs.Tenants;
using Backend.Application.Services;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Backend.Tests.Utils;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using Backend.Infrastructure.Files;

namespace Backend.Tests.Application.Services;

public class TenantServiceTests
{
    [Fact]
    public async Task CreateAsync_Fails_WhenNameOrSlugMissing()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateAsync_Fails_WhenNameOrSlugMissing));
        var svc = new TenantService(db, FileStorageStub.Create());

        var req = new CreateTenantRequest("", "", "en");
        var res = await svc.CreateAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(400, res.StatusCode);
        Assert.Contains("Name and Slug are required", res.Error);
    }

    [Fact]
    public async Task CreateAsync_Fails_WhenSlugAlreadyExists()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateAsync_Fails_WhenSlugAlreadyExists));
        db.Tenants.Add(new Tenant { Name = "Test", Slug = "duplicate", Path = "duplicate", Level = Domain.Enums.TenantLevel.Organization });
        await db.SaveChangesAsync();

        var svc = new TenantService(db, FileStorageStub.Create());

        var req = new CreateTenantRequest("Another", "duplicate", "en");
        var res = await svc.CreateAsync(req, default);

        Assert.False(res.Success);
        Assert.Equal(409, res.StatusCode);
        Assert.Contains("Slug already exists", res.Error);
    }

    [Fact]
    public async Task CreateAsync_Succeeds_WithValidInput()
    {
        var db = TestDbFactory.CreateInMemory(nameof(CreateAsync_Succeeds_WithValidInput));
        var svc = new TenantService(db, FileStorageStub.Create());

        var req = new CreateTenantRequest("Company A", "company-a", "en");
        var res = await svc.CreateAsync(req, default);

        Assert.True(res.Success);
        Assert.NotNull(res.Value);
        Assert.Equal("company-a", res.Value!.Slug);
        Assert.Equal("en", res.Value!.DefaultCulture);
    }

    [Fact]
    public async Task ListAsync_ReturnsAllTenants()
    {
        var db = TestDbFactory.CreateInMemory(nameof(ListAsync_ReturnsAllTenants));
        db.Tenants.AddRange(
            new Tenant { Name = "T1", Slug = "t1", DefaultCulture = "en" },
            new Tenant { Name = "T2", Slug = "t2", DefaultCulture = "tr" }
        );
        await db.SaveChangesAsync();

        var svc = new TenantService(db, FileStorageStub.Create());
        var res = await svc.ListAsync(default);

        Assert.True(res.Success);
        Assert.Equal(2, res.Value!.Count);
    }

    [Fact]
    public async Task UploadLogoAsync_Fails_WhenTenantNotFound()
    {
        var db = TestDbFactory.CreateInMemory(nameof(UploadLogoAsync_Fails_WhenTenantNotFound));
        var svc = new TenantService(db, FileStorageStub.Create());

        var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        var res = await svc.UploadLogoAsync(Guid.NewGuid(), "logo.png", "image/png", stream, default);

        Assert.False(res.Success);
        Assert.Equal(404, res.StatusCode);
    }

    [Fact]
    public async Task UploadLogoAsync_Fails_WhenInvalidFileType()
    {
        var db = TestDbFactory.CreateInMemory(nameof(UploadLogoAsync_Fails_WhenInvalidFileType));
        var tenant = new Tenant { Id = Guid.NewGuid(), Name = "T", Slug = "t" };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        var svc = new TenantService(db, FileStorageStub.Create());

        var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        var res = await svc.UploadLogoAsync(tenant.Id, "logo.jpg", "image/jpeg", stream, default);

        Assert.False(res.Success);
        Assert.Equal(400, res.StatusCode);
        Assert.Contains("Only PNG/SVG/WEBP", res.Error);
    }

    [Fact]
    public async Task UploadLogoAsync_Succeeds_WhenValid()
    {
        var db = TestDbFactory.CreateInMemory(nameof(UploadLogoAsync_Succeeds_WhenValid));
        var tenant = new Tenant { Id = Guid.NewGuid(), Name = "T", Slug = "t" };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        var fileMock = new Mock<IFileStorage>();
        fileMock.Setup(f => f.SaveAsync(It.IsAny<string>(), It.IsAny<Stream>(), true, default))
                .Returns(Task.CompletedTask);

        var svc = new TenantService(db, fileMock.Object);
        var res = await svc.UploadLogoAsync(tenant.Id, "logo.png", "image/png", stream, default);

        Assert.True(res.Success);
        Assert.Equal($"/tenants/{tenant.Id}/logo.png", res.Value);
    }

    [Fact]
    public async Task ToggleAsync_Fails_WhenTenantNotFound()
    {
        var db = TestDbFactory.CreateInMemory(nameof(ToggleAsync_Fails_WhenTenantNotFound));
        var svc = new TenantService(db, FileStorageStub.Create());

        var res = await svc.ToggleAsync(Guid.NewGuid(), false, default);

        Assert.False(res.Success);
        Assert.Equal(404, res.StatusCode);
    }

    [Fact]
    public async Task ToggleAsync_Succeeds()
    {
        var db = TestDbFactory.CreateInMemory(nameof(ToggleAsync_Succeeds));
        var tenant = new Tenant { Id = Guid.NewGuid(), Name = "T", Slug = "t", IsActive = true };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        var svc = new TenantService(db, FileStorageStub.Create());
        var res = await svc.ToggleAsync(tenant.Id, false, default);

        Assert.True(res.Success);
        var updated = await db.Tenants.FindAsync(tenant.Id);
        Assert.False(updated!.IsActive);
    }
}
