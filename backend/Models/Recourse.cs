using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models
{
    public class Recourse
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid EventId { get; set; }

        [ForeignKey("EventId")]
        public virtual Event Event { get; set; } = null!;

        public string? Status { get; set; }
        public DateTime? InitiationDate { get; set; }
        public string? Description { get; set; } // Dodano
        public string? Notes { get; set; }

        // Additional properties referenced in ApplicationDbContext
        public string? RecourseNumber { get; set; }
        public decimal? RecourseAmount { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
