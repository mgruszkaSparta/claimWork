using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class RiskTypeDto
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
    }
}
