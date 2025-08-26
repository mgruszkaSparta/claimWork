using System.ComponentModel.DataAnnotations;


namespace AutomotiveClaimsApi.DTOs
{
    public class EventDto
    {
        public string Id { get; set; } = string.Empty;
        public string? ClaimNumber { get; set; }
        public string? SpartaNumber { get; set; }
        public string? InsurerClaimNumber { get; set; }
        public string? VehicleNumber { get; set; }
        public string? VictimRegistrationNumber { get; set; }
        public string? PerpetratorRegistrationNumber { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Owner { get; set; }
        public int? InsuranceCompanyId { get; set; }
        public string? InsuranceCompany { get; set; }
        public string? InsuranceCompanyPhone { get; set; }
        public string? InsuranceCompanyEmail { get; set; }
        public string? PolicyNumber { get; set; }
        public string? Status { get; set; }
        public int? ClaimStatusId { get; set; }
        public bool IsDraft { get; set; }
        public DateTime? DamageDate { get; set; }
        public DateTime? ReportDate { get; set; }
        public DateTime? ReportDateToInsurer { get; set; }
        public decimal? TotalClaim { get; set; }
        public decimal? Payout { get; set; }
        public string? Currency { get; set; }
        public string? RiskType { get; set; }
        public string? DamageType { get; set; }
        public int? ObjectTypeId { get; set; }
        public string? Liquidator { get; set; }
        public int? ClientId { get; set; }
        public string? Client { get; set; }
        public string? ReportingChannel { get; set; }
        public int? LeasingCompanyId { get; set; }
        public string? LeasingCompany { get; set; }
        public string? LeasingCompanyPhone { get; set; }
        public string? LeasingCompanyEmail { get; set; }
        public int? HandlerId { get; set; }
        public string? Handler { get; set; }
        public string? HandlerEmail { get; set; }
        public string? HandlerPhone { get; set; }
        public DateTime? EventTime { get; set; }
        public string? EventLocation { get; set; }
        public string? EventDescription { get; set; }
        public string? Comments { get; set; }
        public string? Area { get; set; }
        public bool WereInjured { get; set; }
        public bool StatementWithPerpetrator { get; set; }
        public bool PerpetratorFined { get; set; }
        public string[]? ServicesCalled { get; set; }
        public string? PoliceUnitDetails { get; set; }
        public string? PropertyDamageSubject { get; set; }
        public string? DamageListing { get; set; }
        public string? InspectionContact { get; set; }
        public string? PoliceDescription { get; set; }
        public string? AmbulanceDescription { get; set; }
        public string? FireDescription { get; set; }
        public string? TowDescription { get; set; }
        public string? InjuredData { get; set; }
        public string? PerpetratorData { get; set; }
        public string? VehicleType { get; set; }
        public string? SubcontractorName { get; set; }
        public string? SubcontractorPolicyNumber { get; set; }
        public string? SubcontractorInsurer { get; set; }
        public bool? ComplaintToSubcontractor { get; set; }
        public DateTime? ComplaintToSubcontractorDate { get; set; }
        public bool? ClaimFromSubcontractorPolicy { get; set; }
        public DateTime? ClaimFromSubcontractorPolicyDate { get; set; }
        public bool? ComplaintResponse { get; set; }
        public DateTime? ComplaintResponseDate { get; set; }
        public string? CargoDescription { get; set; }
        public string[]? Losses { get; set; }
        public string? Carrier { get; set; }
        public string? CarrierPolicyNumber { get; set; }
        public string? InspectionContactName { get; set; }
        public string? InspectionContactPhone { get; set; }
        public string? InspectionContactEmail { get; set; }
        public string? DamageDescription { get; set; }
        public string? Description { get; set; }
        public string? RegisteredById { get; set; }
        public string? RegisteredByName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        public List<ParticipantDto> Participants { get; set; } = new();
        public List<DocumentDto> Documents { get; set; } = new();
        public List<DamageDto> Damages { get; set; } = new();
        public List<AppealDto> Appeals { get; set; } = new();
        public List<ClientClaimDto> ClientClaims { get; set; } = new();
        public List<DecisionDto> Decisions { get; set; } = new();
        public List<RecourseDto> Recourses { get; set; } = new();
        public List<SettlementDto> Settlements { get; set; } = new();
        public List<NoteDto> Notes { get; set; } = new();
    }
}
