using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class SettlementUpsertDto
    {
        public Guid? EventId { get; set; }
        public string? SettlementNumber { get; set; }
        public string? SettlementType { get; set; }
        public string? ExternalEntity { get; set; }
        public string? CustomExternalEntity { get; set; }
        public DateTime? TransferDate { get; set; }
        public string? Status { get; set; }
        public DateTime? SettlementDate { get; set; }
        public decimal? Amount { get; set; }
        public decimal? SettlementAmount { get; set; }
        public string? Currency { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
        public string? Description { get; set; }
        public string? DocumentPath { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentDescription { get; set; }
    }
}
