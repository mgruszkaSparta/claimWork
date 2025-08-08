namespace AutomotiveClaimsApi.DTOs
{
    public class SettlementDto
    {
        public string Id { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public string? Status { get; set; }
        public DateTime? SettlementDate { get; set; }
        public decimal? Amount { get; set; }
        public string? Currency { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
        public string? Description { get; set; }
        public string? DocumentPath { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentDescription { get; set; }
        public string? SettlementNumber { get; set; }
        public string? SettlementType { get; set; }
        public decimal? SettlementAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
