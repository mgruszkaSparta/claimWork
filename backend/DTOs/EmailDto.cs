using System;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.DTOs
{
    public class EmailDto
    {
        public Guid Id { get; set; }
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public string? Cc { get; set; }
        public string? Bcc { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? BodyHtml { get; set; }
        public bool IsHtml { get; set; }
        public string? Priority { get; set; }
        public string Direction { get; set; } = string.Empty; // Inbound, Outbound
        public string Status { get; set; } = string.Empty; // Draft, Sent, Received, Failed
        public DateTime? SentAt { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public bool IsRead { get; set; }
        public bool IsImportant { get; set; }
        public bool IsStarred { get; set; }
        public bool IsArchived { get; set; }
        public string? Tags { get; set; }
        public string? Category { get; set; }
        public string? ErrorMessage { get; set; }
        public int RetryCount { get; set; }
        public bool NeedsSending { get; set; }
        public string? ClaimNumber { get; set; }
        public List<string> ClaimIds { get; set; } = new List<string>();
        public Guid? EventId { get; set; }
        public string? ThreadId { get; set; }
        public string? InReplyTo { get; set; }
        public string? MessageId { get; set; }
        public string? References { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<EmailAttachmentDto> Attachments { get; set; } = new List<EmailAttachmentDto>();
    }
}
