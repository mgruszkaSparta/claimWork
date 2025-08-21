using System.IO;
using System.Threading.Tasks;

namespace EmailService.Storage;

public class AttachmentStorageResult
{
    public string? FilePath { get; set; }
    public string? CloudUrl { get; set; }
}

public interface IAttachmentStorage
{
    Task<AttachmentStorageResult> SaveAsync(string fileName, string contentType, Stream content);
}
