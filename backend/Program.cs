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
var config = builder.Configuration;

// Services 

builder.Services.AddAppDb(config);
builder.Services.AddHttpContextAccessor();
builder.Services.AddAppServices();
builder.Services.AddAppLocalization(config);
builder.Services.AddAppCors(config);
builder.Services.AddAppAuthorization();
builder.Services.AddJwtAuth(config);
builder.Services.AddAppSwagger();

var app = builder.Build();

await app.SeedDatabaseIfNeededAsync();
app.UseAppSwaggerUI();
app.UseAppLocalization();
app.UseAppStaticFiles();
app.UseRouting();
app.UseTenantResolver();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
