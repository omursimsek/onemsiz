using System.Text;
using Backend.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Backend.Infrastructure.Data;
using Backend.Application.Interfaces;
using Backend.Application.Services;
using Backend.Infrastructure.Files;
using Backend.Domain.Enums;
using Backend.Domain.Entities;
using Backend.Infrastructure.Extensions;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace Backend.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
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
        services.AddScoped<ILocationService, LocationService>();
        services.AddScoped<ILocationImportService, LocationImportService>(); // ETL istiyorsan
        
        // Teknik servisler (JWT üretimi vs.)
        // services.AddSingleton<ITokenService, TokenService>();
        services.AddScoped<ITokenService, TokenService>();
        return services;
    }

    public static IServiceCollection AddAppDb(this IServiceCollection services, IConfiguration config)
    {
        var conn = config.GetConnectionString("DefaultConnection") ?? config["ConnectionStrings:DefaultConnection"];
        return services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(conn));
    }

    public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration config)
    {
        var jwtSection = config.GetSection("Jwt");
        var key = jwtSection["Key"] ?? "dev_secret_change_me";
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opt =>
            {
                opt.MapInboundClaims = false;
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = jwtSection["Issuer"],
                    ValidAudience = jwtSection["Audience"],
                    ClockSkew = TimeSpan.Zero,
                    NameClaimType = JwtRegisteredClaimNames.Sub,
                    RoleClaimType = ClaimTypes.Role
                };
            });

        return services;
    }

    public static IServiceCollection AddAppLocalization(this IServiceCollection services, IConfiguration config)
    {
        var supportedCultures = (config["SupportedCultures"] ?? "en,tr").Split(',').Select(c => new CultureInfo(c)).ToList();
        var defaultCulture = config["DefaultCulture"] ?? "en";

        services.AddLocalization(opt => opt.ResourcesPath = "Resources");
        services.Configure<RequestLocalizationOptions>(opt =>
        {
            opt.DefaultRequestCulture = new RequestCulture(defaultCulture);
            opt.SupportedCultures = supportedCultures;
            opt.SupportedUICultures = supportedCultures;
        });

        services.AddControllersWithViews()
            .AddViewLocalization()
            .AddDataAnnotationsLocalization();

        return services;
    }

    public static IServiceCollection AddAppCors(this IServiceCollection services, IConfiguration config)
    {
        var origins = (config["CORS:Origins"] ?? "http://localhost:3000").Split(',');
        services.AddCors(opt =>
        {
            opt.AddPolicy("frontend", p =>
            {
                p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
            });
        });

        return services;
    }

    public static IServiceCollection AddAppAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser().Build();

            options.AddPolicy("PlatformOnly", p =>
                p.RequireRole(nameof(AppRole.SuperAdmin), nameof(AppRole.Staff)));

            options.AddPolicy("TenantOnly", p => p.RequireAssertion(ctx =>
                (ctx.User.IsInRole(nameof(AppRole.TenantAdmin)) || ctx.User.IsInRole(nameof(AppRole.TenantUser))) &&
                ctx.User.HasClaim(c => c.Type == "tid")));

            // Diğer politikalar burada devam eder
        });

        return services;
    }

    public static IServiceCollection AddAppSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "B2B API", Version = "v1" });

            var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename), true);

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter JWT Bearer token"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}





