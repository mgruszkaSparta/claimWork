using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models
{
    public class Decision
    {
        [Key]
        public Guid Id { get; set; }

        public Guid EventId { get; set; }
        public virtual Event Event { get; set; }

        public DateTime? DecisionDate { get; set; }

        [MaxLength(100)]
        public string? DecisionType { get; set; }

        [MaxLength(1000)]
        public string? DecisionDescription { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DecisionAmount { get; set; }

        [MaxLength(50)]
        public string? DecisionStatus { get; set; }
        
        public string? Reason { get; set; }
        public string? DecisionNumber { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
