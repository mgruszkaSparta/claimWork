using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class ClientClaimUpsertDto
    {
        public Guid? Id { get; set; }
        public Guid? EventId { get; set; }
        public string? ClaimNumber { get; set; }
        public DateTime? ClaimDate { get; set; }
        public string? ClaimType { get; set; }
        public decimal? ClaimAmount { get; set; }
        public string? Currency { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public string? DocumentPath { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentDescription { get; set; }
        public string? ClaimNotes { get; set; }
    }
}
