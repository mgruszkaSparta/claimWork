using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class DamageDto
    {
        public string Id { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Detail { get; set; }
        public string? Location { get; set; }
        public string? Severity { get; set; }
        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
        public string? RepairStatus { get; set; }
        public DateTime? RepairDate { get; set; }
        public string? RepairShop { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
