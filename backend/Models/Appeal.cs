using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class Appeal
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid EventId { get; set; }
        
        public string? AppealNumber { get; set; }
        
        [Required]
        public DateTime SubmissionDate { get; set; }
        
        public string? Reason { get; set; }
        
        public string? Status { get; set; }
        
        public string? Notes { get; set; }
        
        public string? Description { get; set; }
        
        public decimal? AppealAmount { get; set; }
        
        public DateTime? DecisionDate { get; set; }
        
        public string? DecisionReason { get; set; }
        
        public string? DocumentPath { get; set; }
        
        public string? DocumentName { get; set; }
        
        public string? DocumentDescription { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        // Navigation property
        public virtual Event? Event { get; set; }
    }
}
