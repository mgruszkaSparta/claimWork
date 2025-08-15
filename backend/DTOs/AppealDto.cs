using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class AppealDto
    {
        public string Id { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public DateTime? SubmissionDate { get; set; }
        public DateTime? ExtensionDate { get; set; }
        public string? Reason { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public string? Description { get; set; }
        public string? AppealNumber { get; set; }
        public decimal? AppealAmount { get; set; }
        public DateTime? DecisionDate { get; set; }
        public string? DecisionReason { get; set; }
        public int? DaysSinceSubmission { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? DocumentPath { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentDescription { get; set; }
        public string? DocumentId { get; set; }
    }
}
