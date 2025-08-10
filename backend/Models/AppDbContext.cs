using Microsoft.EntityFrameworkCore;

namespace Backend.Models;

public class AppDbContext : DbContext
{
    private readonly IHttpContextAccessor _http;

    public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor http) : base(options)
    {
        _http = http;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<AppUser> Users => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Tenant>().HasIndex(t => t.Slug).IsUnique();
        b.Entity<AppUser>().HasIndex(u => u.Email).IsUnique();

        /*
        // 👇 ENUM <-> STRING dönüşümü (kritik düzeltme)
        b.Entity<AppUser>()
        .Property(u => u.Role)
        .HasConversion<string>();*/

        base.OnModelCreating(b);
    }

    public Guid? CurrentTenantId()
    {
        var http = _http.HttpContext;
        if (http?.Items.TryGetValue("TenantId", out var val) == true && val is Guid g)
            return g;
        return null;
    }
}
