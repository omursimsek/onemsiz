//using Backend.Domain.Entities;
using Backend.Domain.Enums;
//using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
//using Backend.Models;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;

namespace Backend.Infrastructure.Extensions
{
    public static class DatabaseExtensions
    {
        public static void ApplyMigrationsAndSeed(this IApplicationBuilder app)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Migrate DB
            db.Database.Migrate();

            // İlk SuperAdmin kontrolü
            if (!db.Users.Any(u => u.Role == AppRole.SuperAdmin))
            {
                var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                var email = config["Seed:SuperAdminEmail"] ?? "superadmin@example.com";
                var pass  = config["Seed:SuperAdminPassword"] ?? "Super#1234";

                db.Users.Add(new AppUser
                {
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(pass),
                    Role = AppRole.SuperAdmin,
                    IsActive = true
                });
                db.SaveChanges();
            }
        }
    }
}
