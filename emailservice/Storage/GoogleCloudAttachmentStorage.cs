using System.IO;
using System.Threading.Tasks;
using Google.Cloud.Storage.V1;

namespace EmailService.Storage;

public class GoogleCloudAttachmentStorage : IAttachmentStorage
{
    private readonly StorageClient _client;
    private readonly string _bucketName;

    public GoogleCloudAttachmentStorage(StorageClient client, string bucketName)
    {
        _client = client;
        _bucketName = bucketName;
    }

    public async Task<AttachmentStorageResult> SaveAsync(string fileName, string contentType, Stream content)
    {
        content.Position = 0;
        await _client.UploadObjectAsync(_bucketName, fileName, contentType, content);
        var url = $"https://storage.googleapis.com/{_bucketName}/{fileName}";
        return new AttachmentStorageResult { CloudUrl = url };
    }
}
