using System;
namespace AutomotiveClaimsApi.Models
{
    public class Decision
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public DateTime? DecisionDate { get; set; }
        public string? Status { get; set; }
        public decimal? Amount { get; set; }
        public string? Currency { get; set; }
        public string? CompensationTitle { get; set; }
        public string? DocumentDescription { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentPath { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual Event Event { get; set; } = null!;
    }
}
