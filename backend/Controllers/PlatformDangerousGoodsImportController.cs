using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.DTOs.Locations;
using Backend.Application.Interfaces;
using Backend.Application.Services.LocationImporting;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/dangerous-goods-import")]
[Authorize(Policy = "PlatformOnly")] // SuperAdmin/Staff
public class PlatformDangerousGoodsImportController : ControllerBase
{
    private readonly IDangerousGoodsImportService _svc;
    public PlatformDangerousGoodsImportController(IDangerousGoodsImportService svc) => _svc = svc;

    [HttpPost("import/un-numbers")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportUnNumbers([FromForm] FileUploadDto dto, CancellationToken ct)
    {
        if (dto.File is null || dto.File.Length == 0) return BadRequest(new { message = "File is empty" });
        using var s = dto.File.OpenReadStream();
        var result = await _svc.ImportUnNumbersAsync(s, ct);
        return Ok(result);
    }

    [HttpPost("import/iata-dgr")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportIataDgr([FromForm] FileUploadDto dto, CancellationToken ct)
    {
        if (dto.File is null || dto.File.Length == 0) return BadRequest(new { message = "File is empty" });
        using var s = dto.File.OpenReadStream();
        var result = await _svc.ImportIataDgrAsync(s, ct);
        return Ok(result);
    }

    [HttpPost("import/imdg-code")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportImdgCode([FromForm] FileUploadDto dto, CancellationToken ct)
    {
        if (dto.File is null || dto.File.Length == 0) return BadRequest(new { message = "File is empty" });
        using var s = dto.File.OpenReadStream();
        var result = await _svc.ImportImdgCodeAsync(s, ct);
        return Ok(result);
    }

    [HttpPost("import/adr-agreement")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportAdrAgreement([FromForm] FileUploadDto dto, CancellationToken ct)
    {
        if (dto.File is null || dto.File.Length == 0) return BadRequest(new { message = "File is empty" });
        using var s = dto.File.OpenReadStream();
        var result = await _svc.ImportAdrAgreementAsync(s, ct);
        return Ok(result);
    }

    [HttpPost("import/rid-regulations")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportRidRegulations([FromForm] FileUploadDto dto, CancellationToken ct)
    {
        if (dto.File is null || dto.File.Length == 0) return BadRequest(new { message = "File is empty" });
        using var s = dto.File.OpenReadStream();
        var result = await _svc.ImportRidRegulationsAsync(s, ct);
        return Ok(result);
    }
}
