
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Backend.Domain.Entities;
using Backend.Domain.Enums;

namespace Backend.Infrastructure.Data;


public static class AppDbInitializer
{
    public static async Task SeedDatabaseIfNeededAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await db.Database.MigrateAsync();

        if (!db.Users.Any(u => u.Role == AppRole.SuperAdmin))
        {
            var email = config["Seed:SuperAdminEmail"] ?? "superadmin@example.com";
            var pass = config["Seed:SuperAdminPassword"] ?? "Super#1234";

            db.Users.Add(new AppUser
            {
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(pass),
                Role = AppRole.SuperAdmin
            });

            await db.SaveChangesAsync();
        }
    }
}
