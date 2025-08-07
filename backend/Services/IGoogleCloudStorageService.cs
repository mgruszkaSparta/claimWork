namespace AutomotiveClaimsApi.Services
{
    public interface IGoogleCloudStorageService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
        Task DeleteFileAsync(string fileUrl);
        Task<Stream> GetFileStreamAsync(string fileUrl);
    }
}
