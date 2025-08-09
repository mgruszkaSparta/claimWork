using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateAppealDto
    {
        [Required]
        public DateTime FilingDate { get; set; }

        public DateTime? ExtensionDate { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }

        [StringLength(100)]
        public string? Status { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        public IFormFile? Document { get; set; }

        [StringLength(500)]
        public string? DocumentDescription { get; set; }
    }
}
