using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models
{
    public class Note
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid EventId { get; set; }

        [MaxLength(100)]
        public string? Category { get; set; } // General, Documents, Internal, Investigation, Repair, Settlement

        [MaxLength(200)]
        public string? Title { get; set; }

        public string Content { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? CreatedBy { get; set; }

        [MaxLength(200)]
        public string? UpdatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsPrivate { get; set; } = false;

        [MaxLength(50)]
        public string? Priority { get; set; } // Low, Medium, High, Critical

        [MaxLength(1000)]
        public string? Tags { get; set; }

        // Navigation property
        public virtual Event Event { get; set; } = null!;
    }
}
