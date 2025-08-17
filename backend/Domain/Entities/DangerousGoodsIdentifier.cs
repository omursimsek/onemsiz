using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Domain.Entities;

public class DangerousGoodsIdentifier
{
    public Guid Id { get; set; }
    
    public Guid DangerousGoodsId { get; set; }
    
    [Required]
    public DangerousGoodsScheme Scheme { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? ExtraJson { get; set; } // Additional data in JSON format
    
    // Navigation property
    public DangerousGoods DangerousGoods { get; set; } = null!;
}
