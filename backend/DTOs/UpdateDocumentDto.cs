namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateDocumentDto
    {
        public string? Description { get; set; }
        public int? DocumentStatusId { get; set; }
        public string? DocumentType { get; set; }
        public string? OriginalFileName { get; set; }
    }
}
