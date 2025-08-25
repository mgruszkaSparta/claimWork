using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models.Dictionary
{
    public class VehicleType
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;

        public int? SortOrder { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
