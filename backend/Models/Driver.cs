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
