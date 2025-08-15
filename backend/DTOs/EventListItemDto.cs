namespace AutomotiveClaimsApi.DTOs
{
    public class EventListItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string? ClaimNumber { get; set; }
        public string? SpartaNumber { get; set; }
        public string? VehicleNumber { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Owner { get; set; }
        public string? Status { get; set; }
        public DateTime? DamageDate { get; set; }
        public decimal? TotalClaim { get; set; }
        public decimal? Payout { get; set; }
        public string? Currency { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? ClientId { get; set; }
        public string? Client { get; set; }
        public string? Liquidator { get; set; }
        public string? PolicyNumber { get; set; }
        public int? InsuranceCompanyId { get; set; }
        public string? InsuranceCompany { get; set; }
        public string? InsurerClaimNumber { get; set; }
        public DateTime? ReportDate { get; set; }
        public string? RiskType { get; set; }
        public string? DamageType { get; set; }
        public int? ObjectTypeId { get; set; }
        public int? HandlerId { get; set; }
        public string? Handler { get; set; }
        public int? LeasingCompanyId { get; set; }
        public string? LeasingCompany { get; set; }
        public string? Area { get; set; }
    }
}
