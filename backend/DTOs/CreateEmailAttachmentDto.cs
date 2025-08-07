using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
public class CreateEmailAttachmentDto
{
   [Required]
   public string FileName { get; set; } = string.Empty;
   
   public string? ContentType { get; set; }
   
   public long? FileSize { get; set; }
   
   [Required]
   public string FilePath { get; set; } = string.Empty;
   
   public string? ContentId { get; set; }
   
   public bool IsInline { get; set; } = false;
}
}
