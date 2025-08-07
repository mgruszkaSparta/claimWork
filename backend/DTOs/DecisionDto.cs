namespace AutomotiveClaimsApi.DTOs
{
    public class DecisionDto
    {
        public string Id { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public DateTime? DecisionDate { get; set; }
        public string? DecisionType { get; set; }
        public string? DecisionDescription { get; set; }
        public decimal? DecisionAmount { get; set; }
        public string? DecisionStatus { get; set; }
        public string? DecisionNumber { get; set; }
        public string? Description { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
