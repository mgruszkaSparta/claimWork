using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateDocumentFromAttachmentDto
    {
        public Guid? EventId { get; set; }
        public Guid? DamageId { get; set; }
        public Guid? RelatedEntityId { get; set; }
        public string? RelatedEntityType { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? UploadedBy { get; set; }
        /// <summary>
        /// When true the original email attachment will be deleted after creating the document.
        /// </summary>
        public bool Move { get; set; }
    }
}
