namespace AutomotiveClaimsApi.DTOs
{
    public class RecourseDto
    {
        public string Id { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public string? Status { get; set; }
        public DateTime? InitiationDate { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public string? RecourseNumber { get; set; }
        public decimal? RecourseAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
