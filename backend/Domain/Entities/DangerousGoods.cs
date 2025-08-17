using System.ComponentModel.DataAnnotations;
using Backend.Domain.Enums;

namespace Backend.Domain.Entities;

public class DangerousGoods
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(10)]
    public string UNNumber { get; set; } = string.Empty; // UN1234
    
    [Required]
    [MaxLength(200)]
    public string ProperShippingName { get; set; } = string.Empty; // Proper shipping name
    
    [MaxLength(100)]
    public string? TechnicalName { get; set; } // Technical name if applicable
    
    [Required]
    public DangerousGoodsClass Class { get; set; }
    
    [MaxLength(10)]
    public string? SubsidiaryRisk { get; set; } // Subsidiary risk class
    
    [Required]
    public PackingGroup PackingGroup { get; set; }
    
    [MaxLength(50)]
    public string? Labels { get; set; } // Required labels
    
    [MaxLength(100)]
    public string? SpecialProvisions { get; set; } // Special provisions
    
    [MaxLength(200)]
    public string? LimitedQuantity { get; set; } // Limited quantity info
    
    [MaxLength(200)]
    public string? ExceptedQuantity { get; set; } // Excepted quantity info
    
    [MaxLength(500)]
    public string? Notes { get; set; } // Additional notes
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<DangerousGoodsIdentifier> Identifiers { get; set; } = new List<DangerousGoodsIdentifier>();
}
