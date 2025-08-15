using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models.Dictionary
{
    [Table("Currencies", Schema = "dict")]
    public class Currency
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(10)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(10)]
        public string? Symbol { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
