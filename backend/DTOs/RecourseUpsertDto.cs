using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class RecourseUpsertDto
    {
        public Guid? EventId { get; set; }
        public string? Status { get; set; }
        public DateTime? InitiationDate { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public string? RecourseNumber { get; set; }
        public decimal? RecourseAmount { get; set; }
    }
}
