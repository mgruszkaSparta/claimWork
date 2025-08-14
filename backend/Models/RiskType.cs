using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class RiskType
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(120, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }

        public int? ClaimObjectTypeId { get; set; }

        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual ICollection<DamageType> DamageTypes { get; set; } = new List<DamageType>();
    }
}
