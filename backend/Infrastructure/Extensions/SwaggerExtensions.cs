using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace Backend.Infrastructure.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddOpenApi(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "B2B API", Version = "v1" });

            // JWT Bearer
            var scheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "JWT Bearer. Örnek: Bearer {token}",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Reference = new OpenApiReference
                {
                    Id = "Bearer",
                    Type = ReferenceType.SecurityScheme
                }
            };

            c.AddSecurityDefinition("Bearer", scheme);
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                { scheme, Array.Empty<string>() }
            });
        });

        return services;
    }

    public static void UseOpenApiUI(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "B2B API v1");
            c.DisplayRequestDuration();
        });
    }
}
