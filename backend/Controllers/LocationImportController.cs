using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Application.Interfaces;
using Backend.Application.DTOs.Locations;

namespace Backend.Controllers;

[ApiController]
[Route("api/platform/location-import")]
[Authorize(Policy = "PlatformOnly")]
public class LocationImportController : ControllerBase
{
    private readonly ILocationImportService _svc;
    public LocationImportController(ILocationImportService svc) => _svc = svc;

    [HttpPost("import/unlocode")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportUnlocode([FromForm] FileUploadDto dto, CancellationToken ct)
    {
        if (dto.File is null || dto.File.Length == 0) return BadRequest(new { message = "File is empty" });
        using var s = dto.File.OpenReadStream();
        var result = await _svc.ImportUnlocodeAsync(s, ct);
        return Ok(result);
    }
}
