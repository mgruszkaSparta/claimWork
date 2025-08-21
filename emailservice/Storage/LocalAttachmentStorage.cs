using System.IO;
using System.Threading.Tasks;

namespace EmailService.Storage;

public class LocalAttachmentStorage : IAttachmentStorage
{
    private readonly string _basePath;

    public LocalAttachmentStorage(string basePath)
    {
        _basePath = basePath;
    }

    public async Task<AttachmentStorageResult> SaveAsync(string fileName, string contentType, Stream content)
    {
        Directory.CreateDirectory(_basePath);
        var filePath = Path.Combine(_basePath, fileName);
        using var fileStream = File.Create(filePath);
        content.Position = 0;
        await content.CopyToAsync(fileStream);
        return new AttachmentStorageResult { FilePath = filePath };
    }
}
