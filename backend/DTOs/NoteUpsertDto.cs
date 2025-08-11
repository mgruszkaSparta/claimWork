using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class NoteUpsertDto
    {
        public string? Id { get; set; }
        public string? EventId { get; set; }

        [StringLength(100)]
        public string? Category { get; set; }

        [StringLength(200)]
        public string? Title { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        [StringLength(200)]
        public string? CreatedBy { get; set; }

        public bool IsPrivate { get; set; } = false;

        [StringLength(50)]
        public string? Priority { get; set; }

        public string[]? Tags { get; set; }
    }
}
