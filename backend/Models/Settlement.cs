using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class Settlement
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid EventId { get; set; }
        
        public Guid? ClaimId { get; set; }
        
        public string? SettlementNumber { get; set; }
        
        public string? SettlementType { get; set; }
        
        public string? ExternalEntity { get; set; }
        
        public string? CustomExternalEntity { get; set; }
        
        public DateTime? TransferDate { get; set; }
        
        public string? Status { get; set; }
        
        public DateTime? SettlementDate { get; set; }
        
        public decimal? Amount { get; set; }
        
        public decimal? SettlementAmount { get; set; }
        
        public string? Currency { get; set; }
        
        public string? PaymentMethod { get; set; }
        
        public string? Notes { get; set; }
        
        public string? Description { get; set; }
        
        public string? DocumentPath { get; set; }
        
        public string? DocumentName { get; set; }
        
        public string? DocumentDescription { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        // Navigation property
        public virtual Event? Event { get; set; }
    }
}
