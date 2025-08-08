using Microsoft.AspNetCore.Http;
using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateDocumentDto
    {
        public IFormFile File { get; set; } = null!;
        public Guid? EventId { get; set; }
        public Guid? DamageId { get; set; }
        public Guid? RelatedEntityId { get; set; }
        public string? RelatedEntityType { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? UploadedBy { get; set; }
    }
}
