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
        Task<bool> DeleteDocumentAsync(string filePath);
        /// <summary>
        /// Retrieves a document for download by its identifier.
        /// </summary>
        /// <remarks>
        /// Callers are responsible for disposing the <see cref="DocumentDownloadResult.FileStream"/> returned in the result.
        /// </remarks>
        Task<DocumentDownloadResult?> DownloadDocumentAsync(Guid id);
        Task<(string FilePath, string OriginalFileName)> SaveDocumentAsync(IFormFile file, string category, string? description);
        /// <summary>
        /// Retrieves a document based on its file path.
        /// </summary>
        /// <remarks>
        /// Callers are responsible for disposing the <see cref="DocumentDownloadResult.FileStream"/> returned in the result.
        /// </remarks>
        Task<DocumentDownloadResult?> GetDocumentAsync(string filePath);
        Task<Stream> GetDocumentStreamAsync(string filePath);
        Task<DocumentDto> UploadDocumentAsync(IFormFile file, string category, string entityId);
        Task<DocumentDto> CreateDocumentFromEmailAttachmentAsync(Guid attachmentId, CreateDocumentFromAttachmentDto createDto);
    }

    public class DocumentDownloadResult
    {
        public Stream FileStream { get; set; } = Stream.Null;
        public string ContentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
    }
}
