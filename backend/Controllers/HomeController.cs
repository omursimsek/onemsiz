using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class HomeController : Controller
{
    public IActionResult Index() => Content("Backend (DEV) is running.");
    
    [Authorize(Policy = "TenantOnly")]
    [HttpGet("/api/secure/ping")]
    public IActionResult SecurePing() => Ok(new { message = "pong (authorized)" });
}
