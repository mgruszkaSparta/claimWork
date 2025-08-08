using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<DocumentsController> _logger;

        public DocumentsController(
            ApplicationDbContext context,
            IDocumentService documentService,
            ILogger<DocumentsController> logger)
        {
            _context = context;
            _documentService = documentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments(
            [FromQuery] Guid? eventId,
            [FromQuery] Guid? damageId,
            [FromQuery] string? documentType,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.Documents.Where(d => !d.IsDeleted).AsQueryable();

            if (eventId.HasValue)
                query = query.Where(d => d.EventId == eventId.Value);
            if (damageId.HasValue)
                query = query.Where(d => d.DamageId == damageId.Value);
            if (!string.IsNullOrEmpty(documentType))
                query = query.Where(d => d.DocumentType == documentType);
            if (!string.IsNullOrEmpty(status))
                query = query.Where(d => d.Status == status);

            var totalCount = await query.CountAsync();
            var documents = await query
                .OrderByDescending(d => d.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => MapToDto(d))
                .ToListAsync();

            Response.Headers.Append("X-Total-Count", totalCount.ToString());
            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocument(Guid id)
        {
            var document = await _context.Documents
                .Where(d => d.Id == id && !d.IsDeleted)
                .Select(d => MapToDto(d))
                .FirstOrDefaultAsync();

            if (document == null)
                return NotFound();

            return Ok(document);
        }

        [HttpPost("upload")]
        public async Task<ActionResult<DocumentDto>> UploadDocument([FromForm] CreateDocumentDto createDto)
        {
            try
            {
                var documentDto = await _documentService.UploadAndCreateDocumentAsync(createDto.File, createDto);
                return CreatedAtAction(nameof(GetDocument), new { id = documentDto.Id }, documentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetDocumentsForEvent(Guid eventId)
        {
            var documents = await _documentService.GetDocumentsByEventIdAsync(eventId);
            return Ok(documents);
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(Guid id)
        {
            var result = await _documentService.DownloadDocumentAsync(id);
            if (result == null)
                return NotFound();

            // File() handles disposing the stream after the response is sent.
            return File(result.FileStream, result.ContentType, result.FileName);
        }

        [HttpGet("{id}/preview")]
        public async Task<IActionResult> PreviewDocument(Guid id)
        {
            var result = await _documentService.DownloadDocumentAsync(id);
            if (result == null)
                return NotFound();

            // File() handles disposing the stream after the response is sent.
            return File(result.FileStream, result.ContentType);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DocumentDto>> UpdateDocument(Guid id, [FromBody] UpdateDocumentDto updateDto)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null || document.IsDeleted)
                return NotFound();

            document.Description = updateDto.Description ?? document.Description;
            // Assuming DocumentStatusId maps to Status string. This might need a lookup table.
            // document.Status = updateDto.DocumentStatusId?.ToString() ?? document.Status;
            document.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(MapToDto(document));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(Guid id)
        {
            var success = await _documentService.DeleteDocumentAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
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
                Status = doc.Status,
                CreatedAt = doc.CreatedAt,
                UpdatedAt = doc.UpdatedAt,
                DownloadUrl = $"/api/documents/{doc.Id}/download",
                PreviewUrl = $"/api/documents/{doc.Id}/preview",
                CanPreview = true // Simplified
            };
        }
    }
}
