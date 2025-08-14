using System.Text;
using Backend.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Backend.Infrastructure.Data;
using Backend.Application.Interfaces;
using Backend.Application.Services;
using Backend.Infrastructure.Files;

// ŞU ANKİ DbContext'İN AD ALANI:
// Taşıyana kadar bu kalsın. Taşıdıktan sonra Backend.Infrastructure.Data olarak değiştir.
//using Backend.Models;

namespace Backend.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAppDb(this IServiceCollection services, IConfiguration cfg)
    {
        var conn = cfg.GetConnectionString("DefaultConnection")
           ?? cfg["ConnectionStrings:DefaultConnection"];

        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(conn));

        return services;
    }

    public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration cfg)
    {
        services.Configure<JwtOptions>(cfg.GetSection("Jwt"));
        var jwt = cfg.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(o =>
            {
                o.TokenValidationParameters = new()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key))
                };
            });

        return services;
    }

    public static IServiceCollection AddAppServices(this IServiceCollection services)
    {
        // Geçiş süreci: Şimdilik boş bırakıyoruz.
        // Application/Interfaces + Application/Services altına taşıdıkça buraya ekleyeceğiz:
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITenantService, TenantService>();
        services.AddScoped<IFileStorage, LocalFileStorage>();
        services.AddScoped<ITenantHierarchyService, TenantHierarchyService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ITenantPublicService, TenantPublicService>();
        services.AddScoped<IUserMembershipService, UserMembershipService>();
        // Teknik servisler (JWT üretimi vs.)
        // services.AddSingleton<ITokenService, TokenService>();
        services.AddScoped<ITokenService, TokenService>();
        return services;
    }
}
