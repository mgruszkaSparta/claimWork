using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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

        public DocumentService(ApplicationDbContext context, ILogger<DocumentService> logger, IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _uploadsPath = Path.Combine(environment.ContentRootPath, "uploads");

            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        public async Task<IEnumerable<DocumentDto>> GetDocumentsByEventIdAsync(Guid eventId)
        {
            return await _context.Documents
                .Where(d => d.EventId == eventId && !d.IsDeleted)
                .Select(d => MapToDto(d))
                .ToListAsync();
        }

        public async Task<DocumentDto?> GetDocumentByIdAsync(Guid id)
        {
            var document = await _context.Documents.FindAsync(id);
            return document != null ? MapToDto(document) : null;
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

            var categoryPath = Path.Combine(_uploadsPath, createDto.Category ?? "other");
            if (!Directory.Exists(categoryPath))
            {
                Directory.CreateDirectory(categoryPath);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(categoryPath, uniqueFileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
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
            return MapToDto(document);
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
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Unexpected error deleting file for Document ID {DocumentId} at {FilePath}",
                    id, document.FilePath);
            }

            return true;
        }

        public Task<DocumentDownloadResult?> DownloadDocumentAsync(Guid id)
        {
            throw new NotImplementedException();
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
            var fullPath = Path.Combine(_uploadsPath, NormalizePath(filePath));
            try
            {
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

        private static DocumentDto MapToDto(Document doc)
        {
            return new DocumentDto
            {
                Id = doc.Id,
                EventId = doc.EventId,
                FileName = doc.FileName,
                OriginalFileName = doc.OriginalFileName,
                FilePath = doc.FilePath,
                FileSize = doc.FileSize,
                ContentType = doc.ContentType,
                Category = doc.DocumentType,
                Description = doc.Description,
                UploadedBy = doc.UploadedBy,
                IsActive = !doc.IsDeleted,
                CreatedAt = doc.CreatedAt,
                UpdatedAt = doc.UpdatedAt,
                DownloadUrl = $"/api/documents/{doc.Id}/download",
                PreviewUrl = $"/api/documents/{doc.Id}/preview",
                CanPreview = true
            };
        }
    }
}
