using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class AppealDocument
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid AppealId { get; set; }

        public Appeal? Appeal { get; set; }

        [Required]
        [MaxLength(1000)]
        public string FilePath { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

