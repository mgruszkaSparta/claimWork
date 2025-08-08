using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models
{
    public class Participant
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid EventId { get; set; }

        [ForeignKey("EventId")]
        public virtual Event Event { get; set; } = null!;

        [MaxLength(100)]
        public string? Role { get; set; }

        [MaxLength(200)]
        public string? Name { get; set; }

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(200)]
        public string? Email { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(200)]
        public string? InsuranceCompany { get; set; }

        [MaxLength(100)]
        public string? PolicyNumber { get; set; }

        [MaxLength(50)]
        public string? VehicleRegistration { get; set; }

        [MaxLength(100)]
        public string? VehicleVin { get; set; }

        [MaxLength(100)]
        public string? VehicleType { get; set; }

        [MaxLength(100)]
        public string? VehicleBrand { get; set; }

        [MaxLength(100)]
        public string? VehicleModel { get; set; }
        
        public int? VehicleYear { get; set; }

        [MaxLength(200)]
        public string? InspectionContactName { get; set; }

        [MaxLength(50)]
        public string? InspectionContactPhone { get; set; }

        [MaxLength(200)]
        public string? InspectionContactEmail { get; set; }

        public bool IsAtFault { get; set; } = false;
        public bool IsInjured { get; set; } = false;
        
        public string? InjuryDescription { get; set; }
        public string? LicenseNumber { get; set; }
        public string? LicenseClass { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ParticipantType { get; set; }
        public string? ContactInfo { get; set; }
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Driver> Drivers { get; set; } = new List<Driver>();
    }
}
