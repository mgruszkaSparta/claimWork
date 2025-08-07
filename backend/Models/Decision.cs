using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class Decision
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public DateTime? DecisionDate { get; set; }
        public string? DecisionType { get; set; }
        public string? DecisionDescription { get; set; }
        public decimal? DecisionAmount { get; set; }
        public string? DecisionStatus { get; set; }
        public string? DecisionNumber { get; set; }
        public string? Description { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual Event Event { get; set; } = null!;
    }
}
