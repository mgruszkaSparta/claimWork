using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class MobileEventDto
    {
        public string Id { get; set; } = string.Empty;
        public string? ClaimNumber { get; set; }
        public string? DamageType { get; set; }
        public DateTime? DamageDate { get; set; }
        public string? Status { get; set; }
        public decimal? TotalClaim { get; set; }
        public string? Currency { get; set; }
        public string? EventLocation { get; set; }
        public string? EventDescription { get; set; }
        public string? Handler { get; set; }
        public string? HandlerPhone { get; set; }
        public string? HandlerEmail { get; set; }
    }
}
