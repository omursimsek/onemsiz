using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Backend.Domain.Entities;
using Backend.Domain.Enums;

namespace Backend.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly IHttpContextAccessor _http;

    public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor http)
        : base(options)
    {
        _http = http;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<UserTenantMembership> TenantMemberships => Set<UserTenantMembership>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // Postgres ltree
        b.HasPostgresExtension("ltree");

        // Tenant
        b.Entity<Tenant>(entity =>
        {
            entity.HasIndex(t => t.Slug).IsUnique();

            entity.HasOne(t => t.Parent)
                .WithMany(p => p.Children)
                .HasForeignKey(t => t.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(t => t.Path)
                .HasColumnType("ltree");

            entity.HasIndex(t => t.Path).HasMethod("gist");
        });


        // AppUser
        b.Entity<AppUser>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // IMPORTANT: Enum’u int olarak sakla (string dönüşümü YOK)
        // Eğer önceki tabloda text ise, aşağıdaki Not’a göre migration yap.
        b.Entity<AppUser>()
           .Property(u => u.Role)
           .HasConversion<string>(); // <-- BUNU KULLANMIYORUZ

        b.Entity<AppUser>()
            .HasOne(u => u.Tenant)
            .WithMany()
            .HasForeignKey(u => u.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // TenantMembership
        b.Entity<UserTenantMembership>()
            .HasIndex(x => new { x.UserId, x.TenantId })
            .IsUnique(false);

        b.Entity<UserTenantMembership>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<UserTenantMembership>()
            .HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<UserTenantMembership>()
            .HasIndex(x => new { x.UserId, x.TenantId, x.Role })
            .IsUnique();
    }

    public Guid? CurrentTenantId()
    {
        var http = _http.HttpContext;
        if (http?.Items.TryGetValue("TenantId", out var val) == true && val is Guid g)
            return g;
        return null;
    }
}
