using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Backend.Application.DTOs.Locations;

public class FileUploadDto
{
    [Required]
    public IFormFile File { get; set; } = default!;
}
