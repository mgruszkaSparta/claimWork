using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models.Dictionary
{
    public class Country
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(10)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
