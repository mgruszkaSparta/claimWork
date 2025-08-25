using AutomotiveClaimsApi.Models;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Storage.v1.Data;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Options;

namespace AutomotiveClaimsApi.Services
{
    public class GoogleCloudStorageService : IGoogleCloudStorageService
    {
        private readonly GoogleCloudStorageSettings _settings;
        private readonly ILogger<GoogleCloudStorageService> _logger;
        private readonly StorageClient _storageClient;

        public GoogleCloudStorageService(
            IOptions<GoogleCloudStorageSettings> settings,
            ILogger<GoogleCloudStorageService> logger,
            StorageClient? storageClient = null)
        {
            _settings = settings.Value;
            _logger = logger;
            _storageClient = storageClient ?? CreateStorageClient();
        }

        private async Task EnsureBucketExistsAsync()
        {
            try
            {
                await _storageClient.GetBucketAsync(_settings.BucketName);
            }
            catch (Google.GoogleApiException e) when (e.Error.Code == 404)
            {
                if (string.IsNullOrWhiteSpace(_settings.ProjectId))
                {
                    throw new InvalidOperationException("Google Cloud Storage ProjectId is not configured");
                }

                await _storageClient.CreateBucketAsync(_settings.ProjectId, new Bucket
                {
                    Name = _settings.BucketName
                });
            }
        }

        private StorageClient CreateStorageClient()
        {
            if (!string.IsNullOrEmpty(_settings.CredentialsPath))
            {
                var credential = GoogleCredential.FromFile(_settings.CredentialsPath);
                return StorageClient.Create(credential);
            }

            return StorageClient.Create();
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            try
            {
                if (!_settings.Enabled)
                {
                    throw new InvalidOperationException("Google Cloud Storage is not enabled");
                }

                await EnsureBucketExistsAsync();
                fileStream.Seek(0, SeekOrigin.Begin);

                await _storageClient.UploadObjectAsync(
                    _settings.BucketName,
                    fileName,
                    contentType,
                    fileStream);

                var cloudUrl = $"https://storage.googleapis.com/{_settings.BucketName}/{fileName}";
                _logger.LogInformation("File uploaded to cloud storage: {Url}", cloudUrl);

                return cloudUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to upload file {fileName} to cloud storage");
                throw;
            }
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            try
            {
                if (!_settings.Enabled)
                {
                    return;
                }

                var fileName = ExtractFileName(fileUrl);
                await EnsureBucketExistsAsync();
                await _storageClient.DeleteObjectAsync(_settings.BucketName, fileName);
                _logger.LogInformation("File deleted from cloud storage: {Url}", fileUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to delete file {fileUrl} from cloud storage");
                throw;
            }
        }

        public async Task<Stream> GetFileStreamAsync(string fileUrl)
        {
            try
            {
                if (!_settings.Enabled)
                {
                    throw new InvalidOperationException("Google Cloud Storage is not enabled");
                }

                var fileName = ExtractFileName(fileUrl);
                await EnsureBucketExistsAsync();
                var memoryStream = new MemoryStream();
                await _storageClient.DownloadObjectAsync(_settings.BucketName, fileName, memoryStream);
                memoryStream.Position = 0;
                return memoryStream;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get file stream for {fileUrl} from cloud storage");
                throw;
            }
        }

        private static string ExtractFileName(string fileUrl)
        {
            return Path.GetFileName(new Uri(fileUrl).AbsolutePath);
        }
    }
}
