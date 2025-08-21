using System;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.DTOs
{
    public class DecisionDto
    {
        public string Id { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public DateTime? DecisionDate { get; set; }
        public string? Status { get; set; }
        public decimal? Amount { get; set; }
        public string? Currency { get; set; }
        public string? CompensationTitle { get; set; }
        public string? DocumentDescription { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentPath { get; set; }
        public List<DocumentDto>? Documents { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
