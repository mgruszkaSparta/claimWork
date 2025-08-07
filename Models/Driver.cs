using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models
{
    public class Driver
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ParticipantId { get; set; }

        [ForeignKey("ParticipantId")]
        public virtual Participant Participant { get; set; } = null!;

        [MaxLength(200)]
        public string? Name { get; set; }

        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? LastName { get; set; }

        [MaxLength(50)]
        public string? LicenseNumber { get; set; }

        public DateTime? LicenseIssueDate { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public DateTime? DateOfBirth { get; set; }

        public bool IsMainDriver { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
