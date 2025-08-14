using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class DamageTypeDto
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
        
        [Required]
        public Guid RiskTypeId { get; set; }
        
        public string? RiskTypeName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
