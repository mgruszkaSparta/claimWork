using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class AppealUpsertDto
    {
        public Guid? EventId { get; set; }
        public string? AppealNumber { get; set; }
        public DateTime? SubmissionDate { get; set; }
        public string? Reason { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public string? Description { get; set; }
        public decimal? AppealAmount { get; set; }
        public DateTime? DecisionDate { get; set; }
        public string? DecisionReason { get; set; }
        public string? DocumentPath { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentDescription { get; set; }
    }
}
