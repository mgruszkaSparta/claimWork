using AutomotiveClaimsApi.DTOs;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System;

namespace AutomotiveClaimsApi.Services
{
    public interface IDocumentService
    {
        Task<IEnumerable<DocumentDto>> GetDocumentsByEventIdAsync(Guid eventId);
        Task<DocumentDto?> GetDocumentByIdAsync(Guid id);
        Task<DocumentDto> UploadAndCreateDocumentAsync(IFormFile file, CreateDocumentDto createDto);
        Task<bool> DeleteDocumentAsync(Guid id);
        Task<DocumentDownloadResult?> DownloadDocumentAsync(Guid id);
        Task<(string FilePath, string OriginalFileName)> SaveDocumentAsync(IFormFile file, string category, string? description);
        Task<DocumentDownloadResult?> GetDocumentAsync(string filePath);
        Task<Stream> GetDocumentStreamAsync(string filePath);
        Task<DocumentDto> UploadDocumentAsync(IFormFile file, string category, string entityId);
    }

    public class DocumentDownloadResult
    {
        public Stream FileStream { get; set; } = Stream.Null;
        public string ContentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
    }
}
