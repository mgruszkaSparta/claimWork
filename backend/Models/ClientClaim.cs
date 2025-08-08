using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models
{
    public class ClientClaim
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid EventId { get; set; }
        public virtual Event? Event { get; set; }

        public string? ClaimNumber { get; set; }
        public DateTime? ClaimDate { get; set; }
        public string? ClaimType { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal? ClaimAmount { get; set; }
        public string? Currency { get; set; }
        [MaxLength(50)]
        public string? Status { get; set; }
        [MaxLength(1000)]
        public string? Description { get; set; }
        public string? DocumentPath { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentDescription { get; set; }
        public string? ClaimNotes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
