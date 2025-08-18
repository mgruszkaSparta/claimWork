using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class Driver
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Guid ParticipantId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
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

        [MaxLength(100)]
        public string? PersonalId { get; set; }

        public string? LicenseNumber { get; set; }
        public string? LicenseState { get; set; }
        public DateTime? LicenseExpirationDate { get; set; }
        public bool IsMainDriver { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual Event? Event { get; set; }
        public virtual Participant? Participant { get; set; }
    }
}
