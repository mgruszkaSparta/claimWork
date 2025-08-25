using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.Services;
using Google.Apis.Download;
using Google.Apis.Storage.v1.Data;
using Google.Apis.Upload;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace AutomotiveClaimsApi.Tests
{
    public class GoogleCloudStorageServiceTests
    {
        private class FakeStorageClient : StorageClient
        {
            private readonly Dictionary<string, byte[]> _storage = new();

            public override Task<Object> UploadObjectAsync(string bucket, string objectName, string contentType, Stream source, UploadObjectOptions options = null, IProgress<IUploadProgress> progress = null, CancellationToken cancellationToken = default)
            {
                using var ms = new MemoryStream();
                source.CopyTo(ms);
                _storage[objectName] = ms.ToArray();
                return Task.FromResult(new Object { Bucket = bucket, Name = objectName, ContentType = contentType });
            }

            public override Task DownloadObjectAsync(string bucket, string objectName, Stream destination, DownloadObjectOptions options = null, IProgress<IDownloadProgress> progress = null, CancellationToken cancellationToken = default)
            {
                if (!_storage.TryGetValue(objectName, out var data))
                {
                    throw new KeyNotFoundException();
                }
                destination.Write(data, 0, data.Length);
                destination.Position = 0;
                return Task.CompletedTask;
            }

            public override Task DeleteObjectAsync(string bucket, string objectName, DeleteObjectOptions options = null, CancellationToken cancellationToken = default)
            {
                _storage.Remove(objectName);
                return Task.CompletedTask;
            }

            public override Task<Bucket> GetBucketAsync(string bucket, GetBucketOptions options = null, CancellationToken cancellationToken = default)
            {
                return Task.FromResult(new Bucket { Name = bucket });
            }

            public override Task<Bucket> CreateBucketAsync(string projectId, Bucket bucket, CreateBucketOptions options = null, CancellationToken cancellationToken = default)
            {
                return Task.FromResult(bucket);
            }
        }

        [Fact]
        public async Task UploadDownloadDelete_Works()
        {
            var settings = Options.Create(new GoogleCloudStorageSettings
            {
                Enabled = true,
                BucketName = "test-bucket",
                ProjectId = "test-project"
            });
            var client = new FakeStorageClient();
            var service = new GoogleCloudStorageService(settings, NullLogger<GoogleCloudStorageService>.Instance, client);

            var content = "hello world";
            await using var uploadStream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            var url = await service.UploadFileAsync(uploadStream, "file.txt", "text/plain");
            Assert.Equal("https://storage.googleapis.com/test-bucket/file.txt", url);

            await using var downloadStream = await service.GetFileStreamAsync(url);
            using var reader = new StreamReader(downloadStream);
            var downloaded = await reader.ReadToEndAsync();
            Assert.Equal(content, downloaded);

            await service.DeleteFileAsync(url);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetFileStreamAsync(url));
        }
    }
}
