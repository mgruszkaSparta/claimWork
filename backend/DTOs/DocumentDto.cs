using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class DocumentDto
    {
        public Guid Id { get; set; }
        public Guid? EventId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? OriginalFileName { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string? CloudUrl { get; set; }
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string UploadedBy { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? DownloadUrl { get; set; }
        public string? PreviewUrl { get; set; }
        public bool CanPreview { get; set; }
    }
}
