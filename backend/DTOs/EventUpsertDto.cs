using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class EventUpsertDto
    {
        [StringLength(100)]
        public string? ClaimNumber { get; set; }

        [StringLength(100)]
        public string? SpartaNumber { get; set; }

        [StringLength(100)]
        public string? InsurerClaimNumber { get; set; }

        [StringLength(50)]
        public string? VehicleNumber { get; set; }

        [StringLength(100)]
        public string? Brand { get; set; }

        [StringLength(100)]
        public string? Model { get; set; }

        [StringLength(200)]
        public string? Owner { get; set; }

        public int? InsuranceCompanyId { get; set; }

        [StringLength(200)]
        public string? InsuranceCompany { get; set; }

        [StringLength(50)]
        public string? InsuranceCompanyPhone { get; set; }

        [StringLength(200)]
        public string? InsuranceCompanyEmail { get; set; }

        [StringLength(100)]
        public string? PolicyNumber { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        public DateTime? DamageDate { get; set; }

        public DateTime? ReportDate { get; set; }

        public DateTime? ReportDateToInsurer { get; set; }

        public decimal? TotalClaim { get; set; }

        public decimal? Payout { get; set; }

        [StringLength(10)]
        public string? Currency { get; set; }

        [StringLength(100)]
        public string? RiskType { get; set; }

        [StringLength(100)]
        public string? DamageType { get; set; }

        [StringLength(200)]
        public string? Liquidator { get; set; }

        public int? ClientId { get; set; }

        [StringLength(200)]
        public string? Client { get; set; }

        [StringLength(100)]
        public string? ReportingChannel { get; set; }

        public int? LeasingCompanyId { get; set; }

        [StringLength(200)]
        public string? LeasingCompany { get; set; }

        [StringLength(50)]
        public string? LeasingCompanyPhone { get; set; }

        [StringLength(200)]
        public string? LeasingCompanyEmail { get; set; }

        public int? HandlerId { get; set; }

        [StringLength(200)]
        public string? Handler { get; set; }

        [StringLength(200)]
        public string? HandlerEmail { get; set; }

        [StringLength(50)]
        public string? HandlerPhone { get; set; }

        public string? EventTime { get; set; }

        [StringLength(500)]
        public string? EventLocation { get; set; }

        [StringLength(2000)]
        public string? EventDescription { get; set; }

        [StringLength(2000)]
        public string? Comments { get; set; }

        [StringLength(100)]
        public string? Area { get; set; }

        public bool? WereInjured { get; set; }

        public bool? StatementWithPerpetrator { get; set; }

        public bool? PerpetratorFined { get; set; }

        [StringLength(500)]
        public string? ServicesCalled { get; set; }

        [StringLength(500)]
        public string? PoliceUnitDetails { get; set; }

        [StringLength(100)]
        public string? VehicleType { get; set; }

        [StringLength(2000)]
        public string? DamageDescription { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        public ICollection<ParticipantUpsertDto>? Participants { get; set; }

        public ICollection<DocumentDto>? Documents { get; set; }


        public ICollection<DamageUpsertDto>? Damages { get; set; }


        public ICollection<DamageDto>? Damages { get; set; }

        public ICollection<DecisionDto>? Decisions { get; set; }
        public ICollection<AppealDto>? Appeals { get; set; }
        public ICollection<ClientClaimDto>? ClientClaims { get; set; }
        public ICollection<RecourseDto>? Recourses { get; set; }
        public ICollection<SettlementDto>? Settlements { get; set; }


        public ICollection<DamageUpsertDto>? Damages { get; set; }
        public ICollection<DecisionUpsertDto>? Decisions { get; set; }
        public ICollection<AppealUpsertDto>? Appeals { get; set; }
        public ICollection<ClientClaimUpsertDto>? ClientClaims { get; set; }
        public ICollection<RecourseUpsertDto>? Recourses { get; set; }
        public ICollection<SettlementUpsertDto>? Settlements { get; set; }


    }
}
