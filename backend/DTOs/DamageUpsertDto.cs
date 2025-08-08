using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class DamageUpsertDto
    {
        public Guid? Id { get; set; }
        public Guid? EventId { get; set; }

        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Detail { get; set; }

        [StringLength(200)]
        public string? Location { get; set; }

        [StringLength(50)]
        public string? Severity { get; set; }

        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }

        [StringLength(50)]
        public string? RepairStatus { get; set; }

        public DateTime? RepairDate { get; set; }

        [StringLength(200)]
        public string? RepairShop { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }
    }
}
