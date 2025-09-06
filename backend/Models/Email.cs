using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.Models
{
    public class Email
    {
        [Key]
        public Guid Id { get; set; }

        public Guid? EventId { get; set; } // Changed to nullable Guid

        [Required]
        [StringLength(500)]
        public string Subject { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public string? BodyHtml { get; set; }

        [Required]
        public string From { get; set; } = string.Empty;

        [Required]
        public string To { get; set; } = string.Empty;

        public string? Cc { get; set; }

        public string? Bcc { get; set; }

        public bool IsRead { get; set; } = false;
        public bool IsImportant { get; set; } = false;
        public bool IsStarred { get; set; } = false;
        public bool IsArchived { get; set; } = false;
        public bool IsHtml { get; set; } = true;

        public DateTime? SentAt { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public DateTime? ReadAt { get; set; }

        public string? Priority { get; set; }
        public string Direction { get; set; } = string.Empty; // Inbound, Outbound
        public string Status { get; set; } = "Draft"; // Draft, Sent, Received, Failed
        public string? Tags { get; set; }
        public string? Category { get; set; }
        public string? ErrorMessage { get; set; }
        public int RetryCount { get; set; } = 0;
        public bool NeedsSending { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Additional properties referenced in ApplicationDbContext
        public string? FromAddress { get; set; }
        public string? ToAddresses { get; set; }
        public string? CcAddresses { get; set; }
        public string? BccAddresses { get; set; }

        // Navigation properties
        [ForeignKey("EventId")]
        public Event? Event { get; set; }

        public string? ClaimNumber { get; set; }
        public string? ThreadId { get; set; }
        public string? MessageId { get; set; }
        public string? InReplyTo { get; set; }
        public string? References { get; set; }

        public ICollection<EmailAttachment> Attachments { get; set; } = new List<EmailAttachment>();

        public ICollection<EmailClaim> EmailClaims { get; set; } = new List<EmailClaim>();
    }
}
