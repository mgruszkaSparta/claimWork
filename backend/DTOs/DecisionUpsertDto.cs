using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class DecisionUpsertDto
    {
        public Guid? Id { get; set; }
        public Guid? EventId { get; set; }
        public DateTime? DecisionDate { get; set; }
        public string? DecisionType { get; set; }
        public string? DecisionDescription { get; set; }
        public decimal? DecisionAmount { get; set; }
        public string? DecisionStatus { get; set; }
        public string? DecisionNumber { get; set; }
        public string? Description { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
    }
}
