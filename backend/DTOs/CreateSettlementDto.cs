using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateSettlementDto
    {
        [Required]
        public Guid EventId { get; set; }

        public Guid? ClaimId { get; set; }

        [StringLength(200)]
        public string? ExternalEntity { get; set; }

        [StringLength(200)]
        public string? CustomExternalEntity { get; set; }

        public DateTime? TransferDate { get; set; }

        [Required]
        [StringLength(100)]
        public string Status { get; set; } = string.Empty;

        public DateTime? SettlementDate { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Settlement amount must be greater than 0")]
        public decimal? SettlementAmount { get; set; }

        [StringLength(10)]
        public string? Currency { get; set; } = "PLN";

        public IFormFile? Document { get; set; }

        [StringLength(500)]
        public string? DocumentDescription { get; set; }
    }
}
