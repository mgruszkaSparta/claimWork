using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class RecourseUpsertDto
    {
        public Guid? Id { get; set; }
        public Guid? EventId { get; set; }
        public string? Status { get; set; }
        public DateTime? InitiationDate { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public string? RecourseNumber { get; set; }
        public decimal? RecourseAmount { get; set; }

        // New fields
        public bool? IsJustified { get; set; }
        public DateTime? FilingDate { get; set; }
        public string? InsuranceCompany { get; set; }
        public DateTime? ObtainDate { get; set; }
        public decimal? Amount { get; set; }
        public string? CurrencyCode { get; set; }
        public string? DocumentPath { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentDescription { get; set; }
    }
}
