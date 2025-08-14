using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/tenant")]
[Authorize(Policy = "TenantOnly")] // sınıf seviyesinde
public class TenantPublicController : ControllerBase
{
    private readonly ITenantPublicService _svc;
    public TenantPublicController(ITenantPublicService svc) => _svc = svc;

    /// <summary>Aktif kullanıcının token’ındaki tid’e göre tenant bilgisi.</summary>
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var tidClaim = User.Claims.FirstOrDefault(c => c.Type == "tid")?.Value;
        if (!Guid.TryParse(tidClaim, out var tid))
            return Unauthorized(new { error = "Missing or invalid tenant id (tid) claim." });

        var res = await _svc.GetCurrentTenantAsync(tid, ct);
        if (!res.Success)
            return StatusCode(res.StatusCode ?? 400, new { error = res.Error });

        // var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var baseUrl = $"{Request.Scheme}://localhost:8080"; // TODO: Configurable base URL
        return Ok(new
        {
            id = res.Value!.Id,
            name = res.Value!.Name,
            slug = res.Value!.Slug,
            defaultCulture = res.Value!.DefaultCulture,
            logoUrl = res.Value!.LogoPath is null ? null : baseUrl + res.Value!.LogoPath
        });
    }
}
/*
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
//using Backend.Models;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;

namespace Backend.Controllers;

[ApiController]
[Route("api/tenant")]
//[Authorize(Policy = "TenantOnly")]
public class TenantPublicController : ControllerBase
{
    private readonly AppDbContext _db;
    public TenantPublicController(AppDbContext db) => _db = db;

    // Tenant kullanıcıları ve adminleri erişebilsin
    [Authorize(Policy = "TenantOnly")]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        /*
        Console.WriteLine("TenantPublicController: Me endpoint called");

        var a = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
        Console.WriteLine("User claims:");
        foreach (var claim in a)
        {
            Console.WriteLine(claim);
        }
        */
        /*
        var tidClaim = User.Claims.FirstOrDefault(c => c.Type == "tid")?.Value;
        if (!Guid.TryParse(tidClaim, out var tid)) return Unauthorized();

        

        var t = await _db.Tenants.FirstOrDefaultAsync(x => x.Id == tid && x.IsActive);
        if (t is null) return NotFound();

        var baseUrl = $"{Request.Scheme}://localhost:8080"; // TODO: Configurable base URL
        var logoUrl = t.LogoPath != null ? baseUrl + t.LogoPath : null;

        return Ok(new
        {
            id = t.Id,
            name = t.Name,
            slug = t.Slug,
            defaultCulture = t.DefaultCulture,
            logoUrl
        });
    }
}
*/
