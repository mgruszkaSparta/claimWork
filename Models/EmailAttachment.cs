using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models
{
    public class EmailAttachment
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid EmailId { get; set; }

        [ForeignKey("EmailId")]
        public virtual Email Email { get; set; } = null!;

        public string? FileName { get; set; }
        public string? ContentType { get; set; }
        public long FileSize { get; set; }
        public string? FilePath { get; set; }
        public string? CloudUrl { get; set; }

        // Additional property referenced in ApplicationDbContext
        public string? FileType { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
