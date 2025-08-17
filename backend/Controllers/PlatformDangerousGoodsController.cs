using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.DTOs.DangerousGoods;
using Backend.Application.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/dangerous-goods")]
[Authorize(Policy = "PlatformOnly")] // SuperAdmin/Staff
public class PlatformDangerousGoodsController : ControllerBase
{
    private readonly IDangerousGoodsService _svc;
    public PlatformDangerousGoodsController(IDangerousGoodsService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? q, [FromQuery] string? unNumber,
        [FromQuery] string? dgClass, [FromQuery] string? scheme, [FromQuery] string? code, 
        [FromQuery] int take = 50, [FromQuery] int page = 1, CancellationToken ct = default)
    {
        var result = await _svc.SearchWithPaginationAsync(q, unNumber, dgClass, scheme, code, take, page, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var x = await _svc.GetAsync(id, ct);
        return x is null ? NotFound() : Ok(x);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DangerousGoodsCreateRequest req, CancellationToken ct)
    {
        var x = await _svc.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = x.Id }, x);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DangerousGoodsUpdateRequest req, CancellationToken ct)
    {
        var x = await _svc.UpdateAsync(id, req, ct);
        return x is null ? NotFound() : Ok(x);
    }

    [HttpPost("{id:guid}/identifiers")]
    public async Task<IActionResult> AddIdentifier(Guid id, [FromBody] DangerousGoodsIdentifierDto dto, CancellationToken ct)
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

    [HttpGet("statistics/classes")]
    public async Task<IActionResult> GetClassStatistics(CancellationToken ct)
    {
        var stats = await _svc.GetClassStatisticsAsync(ct);
        return Ok(stats);
    }

    [HttpGet("statistics/schemes")]
    public async Task<IActionResult> GetSchemeStatistics(CancellationToken ct)
    {
        var stats = await _svc.GetSchemeStatisticsAsync(ct);
        return Ok(stats);
    }
}
