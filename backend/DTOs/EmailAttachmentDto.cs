using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class EmailAttachmentDto
    {
        public Guid Id { get; set; }
        public Guid EmailId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string? CloudUrl { get; set; }
        public string? ContentId { get; set; }
        public bool IsInline { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
