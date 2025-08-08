using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateClientClaimDto
    {
        [Required]
        public DateTime ClaimDate { get; set; }

        [Required]
        [StringLength(200)]
        public string ClaimType { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Claim amount must be greater than 0")]
        public decimal ClaimAmount { get; set; }

        [StringLength(10)]
        public string? Currency { get; set; } = "PLN";

        [Required]
        [StringLength(100)]
        public string Status { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [StringLength(2000)]
        public string? ClaimNotes { get; set; }

        [StringLength(100)]
        public string? ClaimNumber { get; set; }

        public IFormFile? Document { get; set; }

        [StringLength(500)]
        public string? DocumentDescription { get; set; }
    }
}
