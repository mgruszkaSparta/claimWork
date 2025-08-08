using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateDamageDto
    {
        [Required]
        public Guid EventId { get; set; } // Zmieniono z int na Guid

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Detail { get; set; } = string.Empty;

        [StringLength(200)]
        public string Location { get; set; } = string.Empty;

        [StringLength(50)]
        public string Severity { get; set; } = string.Empty;

        public decimal EstimatedCost { get; set; }

        public decimal ActualCost { get; set; }

        [StringLength(100)]
        public string RepairStatus { get; set; } = string.Empty;

        public DateTime? RepairDate { get; set; }

        [StringLength(200)]
        public string RepairShop { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Notes { get; set; } = string.Empty;
    }
}
