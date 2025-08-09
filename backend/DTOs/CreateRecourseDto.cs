using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateRecourseDto
    {
        [Required]
        public Guid EventId { get; set; }

        [Required]
        public bool IsJustified { get; set; }

        [Required]
        public DateTime FilingDate { get; set; }

        [Required]
        [StringLength(200)]
        public string InsuranceCompany { get; set; } = string.Empty;

        public DateTime? ObtainDate { get; set; }

        public decimal? Amount { get; set; }

        [StringLength(3)]
        public string? CurrencyCode { get; set; }

        [StringLength(500)]
        public string? DocumentDescription { get; set; }

        public IFormFile? Document { get; set; }
    }
}
