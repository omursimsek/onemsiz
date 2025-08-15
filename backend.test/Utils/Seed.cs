using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.Infrastructure.Data;

namespace Backend.Tests.Utils;

public static class Seed
{
    public static (Tenant org, Tenant country, Tenant office, AppUser user) BasicTenantWithUser(AppDbContext db)
    {
        var org = new Tenant { Name="Acme", Slug="acme", Level=TenantLevel.Organization, Path="acme" };
        var country = new Tenant { Name="Türkiye", Slug="tr", Level=TenantLevel.Country, Parent=org, Path="acme.tr" };
        var office = new Tenant { Name="İzmir", Slug="izmir", Level=TenantLevel.Office, Parent=country, Path="acme.tr.izmir" };

        db.Tenants.AddRange(org, country, office);

        var user = new AppUser {
            Email = "user@acme.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("P@ssw0rd"),
            Role = AppRole.TenantUser,
            Tenant = office,
            IsActive = true
        };

        db.Users.Add(user);
        db.SaveChanges();

        return (org, country, office, user);
    }
}
