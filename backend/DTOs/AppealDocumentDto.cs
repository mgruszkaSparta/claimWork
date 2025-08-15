using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class AppealDocumentDto
    {
        public Guid Id { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

