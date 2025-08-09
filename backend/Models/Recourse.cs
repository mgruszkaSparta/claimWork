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
        public string? Description { get; set; }
        public string? Notes { get; set; }

        // Existing properties
        public string? RecourseNumber { get; set; }
        public decimal? RecourseAmount { get; set; }

        // New properties for enhanced recourse handling
        public bool IsJustified { get; set; }

        [Required]
        public DateTime FilingDate { get; set; }

        [Required]
        public string InsuranceCompany { get; set; } = string.Empty;

        public DateTime? ObtainDate { get; set; }

        public decimal? Amount { get; set; }

        public string? CurrencyCode { get; set; }

        public string? DocumentPath { get; set; }

        public string? DocumentName { get; set; }

        public string? DocumentDescription { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
