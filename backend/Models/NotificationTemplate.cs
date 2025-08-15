using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class NotificationTemplate
    {
        [Key]
        public Guid Id { get; set; }

        [MaxLength(200)]
        public string Name { get; set; } = null!;

        [MaxLength(200)]
        public string? Subject { get; set; }

        public string? Body { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

