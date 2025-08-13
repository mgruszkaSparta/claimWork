using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace AutomotiveClaimsApi.Models
{
    public class Event
    {
        [Key]
        public Guid Id { get; set; }

        [MaxLength(100)]
        public string? ClaimNumber { get; set; }

        [MaxLength(100)]
        public string? SpartaNumber { get; set; }

        [MaxLength(100)]
        public string? InsurerClaimNumber { get; set; }

        [MaxLength(100)]
        public string? VehicleNumber { get; set; }

        [MaxLength(100)]
        public string? Brand { get; set; }

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(200)]
        public string? Owner { get; set; }

        public int? InsuranceCompanyId { get; set; }

        [MaxLength(200)]
        public string? InsuranceCompany { get; set; }

        [MaxLength(50)]
        public string? InsuranceCompanyPhone { get; set; }

        [MaxLength(200)]
        public string? InsuranceCompanyEmail { get; set; }

        [MaxLength(100)]
        public string? PolicyNumber { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }

        public DateTime? DamageDate { get; set; }

        public DateTime? ReportDate { get; set; }

        public DateTime? ReportDateToInsurer { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalClaim { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Payout { get; set; }

        [MaxLength(10)]
        public string? Currency { get; set; }

        [MaxLength(100)]
        public string? RiskType { get; set; }

        [MaxLength(100)]
        public string? DamageType { get; set; }

        [MaxLength(200)]
        public string? Liquidator { get; set; }

        public int? ClientId { get; set; }

        [MaxLength(200)]
        public string? Client { get; set; }

        [MaxLength(100)]
        public string? ReportingChannel { get; set; }

        public int? LeasingCompanyId { get; set; }

        [MaxLength(200)]
        public string? LeasingCompany { get; set; }

        [MaxLength(50)]
        public string? LeasingCompanyPhone { get; set; }

        [MaxLength(200)]
        public string? LeasingCompanyEmail { get; set; }

        public int? HandlerId { get; set; }

        [MaxLength(200)]
        public string? Handler { get; set; }

        [MaxLength(200)]
        public string? HandlerEmail { get; set; }

        [MaxLength(50)]
        public string? HandlerPhone { get; set; }

        public string? RegisteredByUserId { get; set; }
        public ApplicationUser? RegisteredByUser { get; set; }

        public DateTime? EventTime { get; set; }

        [MaxLength(500)]
        public string? EventLocation { get; set; }

        public string? EventDescription { get; set; }

        public string? Comments { get; set; }

        [MaxLength(100)]
        public string? Area { get; set; }

        public bool? WereInjured { get; set; }

        public bool? StatementWithPerpetrator { get; set; }

        public bool? PerpetratorFined { get; set; }

        [MaxLength(500)]
        public string? ServicesCalled { get; set; }

        [MaxLength(500)]
        public string? PoliceUnitDetails { get; set; }

        [MaxLength(100)]
        public string? VehicleType { get; set; }

        public string? DamageDescription { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Participant> Participants { get; set; } = new List<Participant>();
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
        public virtual ICollection<Damage> Damages { get; set; } = new List<Damage>();
        public virtual ICollection<Appeal> Appeals { get; set; } = new List<Appeal>();
        public virtual ICollection<ClientClaim> ClientClaims { get; set; } = new List<ClientClaim>();
        public virtual ICollection<Decision> Decisions { get; set; } = new List<Decision>();
        public virtual ICollection<Recourse> Recourses { get; set; } = new List<Recourse>();
        public virtual ICollection<Settlement> Settlements { get; set; } = new List<Settlement>();
        public virtual ICollection<Email> Emails { get; set; } = new List<Email>();
        public virtual ICollection<Note> Notes { get; set; } = new List<Note>();
    }
}
