using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using System;
using System.Globalization;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Localization;

namespace Backend.Infrastructure.Extensions;

public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseAppSwaggerUI(this IApplicationBuilder app)
    {
        var env = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "B2B API v1");
            });
        }
        return app;
    }

    public static IApplicationBuilder UseAppStaticFiles(this IApplicationBuilder app)
    {
        var env = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();

        app.UseStaticFiles(); // wwwroot
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(
                Path.Combine(env.ContentRootPath, "wwwroot", "tenants")),
            RequestPath = "/tenants"
        });

        return app;
    }

    public static IApplicationBuilder UseTenantResolver(this IApplicationBuilder app)
    {
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

        return app;
    }

    public static IApplicationBuilder UseAppLocalization(this IApplicationBuilder app)
    {
        var options = app.ApplicationServices.GetRequiredService<
            Microsoft.Extensions.Options.IOptions<RequestLocalizationOptions>>().Value;

        return app.UseRequestLocalization(options);
    }
}
