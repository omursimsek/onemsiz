using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Reflection;
using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
//using Backend.Models;
using Microsoft.Extensions.FileProviders;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Backend.Domain.Enums;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Backend.Infrastructure.Extensions;


var builder = WebApplication.CreateBuilder(args);

// EF Core - PostgreSQL
var conn = builder.Configuration.GetConnectionString("DefaultConnection") 
           ?? builder.Configuration["ConnectionStrings:DefaultConnection"];
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(conn));

builder.Services.AddHttpContextAccessor();

builder.Services.AddAppServices();

// Localization
var supportedCultures = (builder.Configuration["SupportedCultures"] ?? "en,tr").Split(',');
var defaultCulture = builder.Configuration["DefaultCulture"] ?? "en";
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var cultures = supportedCultures.Select(c => new CultureInfo(c)).ToList();
    options.DefaultRequestCulture = new RequestCulture(defaultCulture);
    options.SupportedCultures = cultures;
    options.SupportedUICultures = cultures;
});

builder.Services.AddControllersWithViews()
    .AddViewLocalization()
    .AddDataAnnotationsLocalization();

// CORS
var corsOrigins = (builder.Configuration["CORS:Origins"] ?? "http://localhost:3000").Split(',');
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy("PlatformOnly", p =>
        p.RequireAssertion(ctx =>
            ctx.User.IsInRole(nameof(AppRole.SuperAdmin)) ||
            ctx.User.IsInRole(nameof(AppRole.Staff))));

    options.AddPolicy("SuperAdminOnly", p =>
        p.RequireRole(nameof(AppRole.SuperAdmin)));

    options.AddPolicy("TenantOnly", p =>
        p.RequireAssertion(ctx =>
            (ctx.User.IsInRole(nameof(AppRole.TenantAdmin)) ||
             ctx.User.IsInRole(nameof(AppRole.TenantUser))) &&
            ctx.User.HasClaim(c => c.Type == "tid")));

    options.AddPolicy("TenantAdminOnly", p =>
        p.RequireRole(nameof(AppRole.TenantAdmin)));

    options.AddPolicy("TenantScope", p => p.RequireAssertion(ctx =>
        ctx.User.HasClaim(c => c.Type == "tpath") &&
       (ctx.User.IsInRole(nameof(AppRole.TenantAdmin)) ||
        ctx.User.IsInRole(nameof(AppRole.TenantUser)))
    ));
    options.AddPolicy("PlatformOnly", p => p.RequireRole(nameof(AppRole.SuperAdmin), nameof(AppRole.Staff)));
});

// JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? builder.Configuration["Jwt:Key"] ?? "dev_secret_change_me";
var jwtIssuer = jwtSection["Issuer"] ?? builder.Configuration["Jwt:Issuer"];
var jwtAudience = jwtSection["Audience"] ?? builder.Configuration["Jwt:Audience"];
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters.NameClaimType = JwtRegisteredClaimNames.Sub;
    options.TokenValidationParameters.RoleClaimType = ClaimTypes.Role;
    
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer),
        ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        IssuerSigningKey = signingKey,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero,

        // 🔧 ÖNEMLİ: JWT'deki role/tid mapping'i netleştir
        NameClaimType = JwtRegisteredClaimNames.Sub,
        RoleClaimType = ClaimTypes.Role
    };
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "B2B API", Version = "v1" });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename), includeControllerXmlComments: true);

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

var app = builder.Build();

// Dev DB bootstrap & seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    //db.Database.EnsureCreated();
    db.Database.Migrate();

    Console.WriteLine($"{AppRole.SuperAdmin}");

    if (!db.Users.Any(u => u.Role == AppRole.SuperAdmin))
    {
        var email = builder.Configuration["Seed:SuperAdminEmail"] ?? "superadmin@example.com";
        var pass = builder.Configuration["Seed:SuperAdminPassword"] ?? "Super#1234";
        db.Users.Add(new AppUser
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(pass),
            Role = AppRole.SuperAdmin,
        });
        db.SaveChanges();
    }
}

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "B2B API v1");
    });
}

app.UseRequestLocalization(app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<RequestLocalizationOptions>>().Value);
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(app.Environment.ContentRootPath, "wwwroot", "tenants")),
    RequestPath = "/tenants"
});
app.UseRouting();

// Tenant resolver middleware
app.Use(async (ctx, next) =>
{
    Guid? tenantId = null;
    var tidClaim = ctx.User?.Claims.FirstOrDefault(c => c.Type == "tid")?.Value;
    if (Guid.TryParse(tidClaim, out var tid)) tenantId = tid;
    if (tenantId == null && ctx.Request.Headers.TryGetValue("X-Tenant-Id", out var hdr))
        if (Guid.TryParse(hdr, out var t2)) tenantId = t2;
    ctx.Items["TenantId"] = tenantId;
    await next();
});

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();



app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
