using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class Document
    {
        [Key]
        public Guid Id { get; set; }

        public Guid? EventId { get; set; }
        public Event? Event { get; set; }

        public Guid? DamageId { get; set; }

        public Guid? RelatedEntityId { get; set; }
        public string? RelatedEntityType { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? OriginalFileName { get; set; }

        [Required]
        [MaxLength(1000)]
        public string FilePath { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? CloudUrl { get; set; }

        public long FileSize { get; set; }

        [MaxLength(100)]
        public string ContentType { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? DocumentType { get; set; } = "Other";

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(200)]
        public string UploadedBy { get; set; } = string.Empty;

        public bool IsDeleted { get; set; } = false;
        public string? Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
