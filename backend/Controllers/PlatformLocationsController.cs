using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.DTOs.Locations;
using Backend.Application.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/locations")]
[Authorize(Policy = "PlatformOnly")] // SuperAdmin/Staff
public class PlatformLocationsController : ControllerBase
{
    private readonly ILocationService _svc;
    public PlatformLocationsController(ILocationService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? q, [FromQuery] string? country,
        [FromQuery] string? scheme, [FromQuery] string? code, [FromQuery] int take = 50, [FromQuery] int page = 1, CancellationToken ct = default)
    {
        var result = await _svc.SearchWithPaginationAsync(q, country, scheme, code, take, page, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var x = await _svc.GetAsync(id, ct);
        return x is null ? NotFound() : Ok(x);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LocationCreateRequest req, CancellationToken ct)
    {
        var x = await _svc.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] LocationUpdateRequest req, CancellationToken ct)
    {
        var x = await _svc.UpdateAsync(id, req, ct);
        return x is null ? NotFound() : Ok(x);
    }

    [HttpPost("{id:guid}/identifiers")]
    public async Task<IActionResult> AddIdentifier(Guid id, [FromBody] IdentifierDto dto, CancellationToken ct)
    {
        var ok = await _svc.AddIdentifierAsync(id, dto.Scheme, dto.Code, ct);
        return ok ? Ok() : BadRequest();
    }

    [HttpDelete("{id:guid}/identifiers/{identifierId:guid}")]
    public async Task<IActionResult> RemoveIdentifier(Guid id, Guid identifierId, CancellationToken ct)
    {
        var ok = await _svc.RemoveIdentifierAsync(id, identifierId, ct);
        return ok ? NoContent() : NotFound();
    }

    // Statistics endpoint'leri
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(CancellationToken ct)
    {
        var stats = await _svc.GetStatisticsAsync(ct);
        return Ok(stats);
    }

    [HttpGet("statistics/countries")]
    public async Task<IActionResult> GetCountryStatistics(CancellationToken ct)
    {
        var stats = await _svc.GetCountryStatisticsAsync(ct);
        return Ok(stats);
    }

    [HttpGet("statistics/schemes")]
    public async Task<IActionResult> GetSchemeStatistics(CancellationToken ct)
    {
        var stats = await _svc.GetSchemeStatisticsAsync(ct);
        return Ok(stats);
    }
}
