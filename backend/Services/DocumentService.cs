using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Microsoft.Extensions.Configuration;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AutomotiveClaimsApi.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DocumentService> _logger;
        private readonly string _uploadsPath;

        private readonly IGoogleCloudStorageService? _cloudStorage;
        private readonly bool _cloudEnabled;

        private readonly IConfiguration _config;


        public DocumentService(
            ApplicationDbContext context,
            ILogger<DocumentService> logger,
            IWebHostEnvironment environment,
            IConfiguration config,

            IGoogleCloudStorageService? cloudStorage = null,
            IOptions<GoogleCloudStorageSettings>? cloudSettings = null)

        {
            _context = context;
            _logger = logger;
            _uploadsPath = Path.Combine(environment.ContentRootPath, "uploads");

            _cloudStorage = cloudStorage;
            _cloudEnabled = cloudSettings?.Value.Enabled ?? false;

            _config = config;



            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        public async Task<IEnumerable<DocumentDto>> GetDocumentsByEventIdAsync(Guid eventId)
        {
            var documents = await _context.Documents
                .Where(d => d.EventId == eventId && !d.IsDeleted)
                .ToListAsync();

            var baseUrl = _config["App:BaseUrl"];
            return documents.Select(d => MapToDto(d, baseUrl));
        }

        public async Task<DocumentDto?> GetDocumentByIdAsync(Guid id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return null;
            var baseUrl = _config["App:BaseUrl"];
            return MapToDto(document, baseUrl);
        }

        public async Task<DocumentDto> UploadDocumentAsync(IFormFile file, string category, string entityId)
        {
            var createDto = new CreateDocumentDto
            {
                File = file,
                Category = category,
                RelatedEntityId = Guid.Parse(entityId)
            };
            return await UploadAndCreateDocumentAsync(file, createDto);
        }

        public async Task<DocumentDto> UploadAndCreateDocumentAsync(IFormFile file, CreateDocumentDto createDto)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required.", nameof(file));

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            string filePath;

            if (_cloudStorageService != null)
            {
                await using var stream = file.OpenReadStream();
                filePath = await _cloudStorageService.UploadFileAsync(stream, uniqueFileName, file.ContentType);
            }
            else
            {
                var categoryPath = Path.Combine(_uploadsPath, createDto.Category ?? "other");
                if (!Directory.Exists(categoryPath))
                {
                    Directory.CreateDirectory(categoryPath);
                }

                var localPath = Path.Combine(categoryPath, uniqueFileName);

                await using (var stream = new FileStream(localPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                filePath = Path.Combine("uploads", createDto.Category ?? "other", uniqueFileName)
                    .Replace("\\", "/");
            }

            string? cloudUrl = null;
            if (_cloudEnabled && _cloudStorage != null)
            {
                await using var uploadStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                cloudUrl = await _cloudStorage.UploadFileAsync(uploadStream, uniqueFileName, file.ContentType);
            }

            var document = new Document
            {
                Id = Guid.NewGuid(),
                EventId = createDto.EventId,
                DamageId = createDto.DamageId,
                RelatedEntityId = createDto.RelatedEntityId,
                RelatedEntityType = createDto.RelatedEntityType,
                FileName = uniqueFileName,
                OriginalFileName = file.FileName,

                FilePath = Path.Combine("uploads", createDto.Category ?? "other", uniqueFileName)
                    .Replace("\\", "/"),
                CloudUrl = cloudUrl,
                FileSize = file.Length,
                ContentType = file.ContentType,
                DocumentType = createDto.Category ?? "other",
                Description = createDto.Description,
                UploadedBy = createDto.UploadedBy ?? "System",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Document uploaded and created with ID {DocumentId}", document.Id);
            var baseUrl = _config["App:BaseUrl"];
            return MapToDto(document, baseUrl);
        }

        public async Task<bool> DeleteDocumentAsync(Guid id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
            {
                _logger.LogWarning("Delete failed: Document with ID {DocumentId} not found.", id);
                return false;
            }

            document.IsDeleted = true;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Document with ID {DocumentId} soft-deleted.", id);

            try
            {
                var deleted = await DeleteDocumentAsync(document.FilePath);
                if (!deleted)
                {
                    _logger.LogWarning(
                        "File deletion failed for Document ID {DocumentId} at {FilePath}",
                        id, document.FilePath);
                }

                if (_cloudEnabled && _cloudStorage != null && !string.IsNullOrEmpty(document.CloudUrl))
                {
                    await _cloudStorage.DeleteFileAsync(document.CloudUrl);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Unexpected error deleting file for Document ID {DocumentId} at {FilePath}",
                    id, document.FilePath);
            }

            return true;
        }

        public async Task<DocumentDownloadResult?> DownloadDocumentAsync(Guid id)
        {
            var document = await _context.Documents
                .Where(d => d.Id == id && !d.IsDeleted)
                .FirstOrDefaultAsync();

            if (document == null)
            {
                return null;
            }

            var cloudPath = !string.IsNullOrEmpty(document.CloudUrl) ? document.CloudUrl : document.FilePath;
            if (_cloudStorage != null && !string.IsNullOrEmpty(cloudPath) &&
                Uri.TryCreate(cloudPath, UriKind.Absolute, out var uri) &&
                (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            {
                var stream = await _cloudStorage.GetFileStreamAsync(cloudPath);
                var fileName = document.OriginalFileName ?? Path.GetFileName(uri.LocalPath);
                return new DocumentDownloadResult
                {
                    FileStream = stream,
                    ContentType = GetContentType(fileName),
                    FileName = fileName
                };
            }

            var fullPath = Path.Combine(_uploadsPath, document.FilePath.Replace("uploads/", ""));
            if (!File.Exists(fullPath))
            {
                return null;
            }

            var memoryStream = new MemoryStream(await File.ReadAllBytesAsync(fullPath));
            memoryStream.Position = 0;

            return new DocumentDownloadResult
            {
                FileStream = memoryStream,
                ContentType = GetContentType(fullPath),
                FileName = document.OriginalFileName ?? document.FileName
            };
        }

        private static string NormalizePath(string filePath)
        {
            var normalized = filePath
                .Replace("/", Path.DirectorySeparatorChar.ToString())
                .Replace("\\", Path.DirectorySeparatorChar.ToString());
            normalized = normalized.Replace("uploads" + Path.DirectorySeparatorChar, "");
            return normalized.TrimStart(Path.DirectorySeparatorChar);
        }

        public async Task<bool> DeleteDocumentAsync(string filePath)
        {

            try
            {
                if (_cloudEnabled && _cloudStorage != null && Uri.IsWellFormedUriString(filePath, UriKind.Absolute))
                {
                    await _cloudStorage.DeleteFileAsync(filePath);
                    return true;
                }

                var fullPath = Path.Combine(_uploadsPath, NormalizePath(filePath));
                if (File.Exists(fullPath))
                {
                    await Task.Run(() => File.Delete(fullPath));
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file at {FilePath}", filePath);
                return false;
            }
        }

        public async Task<DocumentDownloadResult?> GetDocumentAsync(string filePath)
        {

            if (_cloudEnabled && _cloudStorage != null && Uri.IsWellFormedUriString(filePath, UriKind.Absolute))
            {
                var stream = await _cloudStorage.GetFileStreamAsync(filePath);

                return new DocumentDownloadResult
                {
                    FileStream = stream,
                    ContentType = GetContentType(filePath),
                    FileName = Path.GetFileName(filePath)
                };
            }

            var fullPath = Path.Combine(_uploadsPath, NormalizePath(filePath));
            if (!File.Exists(fullPath)) return null;

            var memoryStream = new MemoryStream(await File.ReadAllBytesAsync(fullPath));
            return new DocumentDownloadResult
            {
                FileStream = memoryStream,
                ContentType = GetContentType(fullPath),
                FileName = Path.GetFileName(filePath)
            };
        }

        public async Task<Stream> GetDocumentStreamAsync(string filePath)
        {
        return await _cloudStorageService.GetFileStreamAsync(filePath);

            if (_cloudEnabled && _cloudStorage != null && Uri.IsWellFormedUriString(filePath, UriKind.Absolute))
            {
                return await _cloudStorage.GetFileStreamAsync(filePath);

            }

            var fullPath = Path.Combine(_uploadsPath, NormalizePath(filePath));
            if (!File.Exists(fullPath)) throw new FileNotFoundException("Document not found", filePath);
            return new MemoryStream(await File.ReadAllBytesAsync(fullPath));
        }

        public async Task<(string FilePath, string OriginalFileName)> SaveDocumentAsync(IFormFile file, string category, string? description)
        {
            var createDto = new CreateDocumentDto { File = file, Category = category, Description = description };
            var doc = await UploadAndCreateDocumentAsync(file, createDto);
            return (doc.FilePath, doc.OriginalFileName ?? doc.FileName);
        }

        private string GetContentType(string path)
        {
            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(path, out var contentType))
            {
                contentType = "application/octet-stream";
            }
            return contentType;
        }


        private DocumentDto MapToDto(Document doc)

        {
            var baseUrl = _config["App:BaseUrl"] ?? string.Empty;
            return new DocumentDto
            {
                Id = doc.Id,
                EventId = doc.EventId,
                FileName = doc.FileName,
                OriginalFileName = doc.OriginalFileName,
                FilePath = doc.FilePath,
                CloudUrl = doc.CloudUrl,
                FileSize = doc.FileSize,
                ContentType = doc.ContentType,
                Category = doc.DocumentType,
                Description = doc.Description,
                UploadedBy = doc.UploadedBy,
                IsActive = !doc.IsDeleted,
                Status = doc.Status,
                CreatedAt = doc.CreatedAt,
                UpdatedAt = doc.UpdatedAt,
                DownloadUrl = $"{baseUrl}/api/documents/{doc.Id}/download",
                PreviewUrl = $"{baseUrl}/api/documents/{doc.Id}/preview",
                CanPreview = true
            };
        }
    }
}
