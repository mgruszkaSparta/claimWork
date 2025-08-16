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
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<DocumentsController> _logger;
        private readonly UserManager<ApplicationUser>? _userManager;
        private readonly INotificationService? _notificationService;
        private readonly IConfiguration _config;

        public DocumentsController(
            ApplicationDbContext context,
            IDocumentService documentService,
            ILogger<DocumentsController> logger,
            IConfiguration config,
            UserManager<ApplicationUser>? userManager = null,
            INotificationService? notificationService = null)
        {
            _context = context;
            _documentService = documentService;
            _logger = logger;
            _config = config;
            _userManager = userManager;
            _notificationService = notificationService;
            _config = config;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments(
            [FromQuery] Guid? eventId,
            [FromQuery] Guid? damageId,
            [FromQuery] string? documentType,
            [FromQuery] string? status,
            [FromQuery] string? search,
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
            if (!string.IsNullOrEmpty(search))
                query = query.Where(d =>
                    d.FileName.Contains(search) ||
                    d.OriginalFileName.Contains(search) ||
                    (d.Description ?? "").Contains(search) ||
                    (d.DocumentType ?? "").Contains(search));

            var totalCount = await query.CountAsync();
            var documents = await query
                .OrderByDescending(d => d.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var baseUrl = _config["App:BaseUrl"];
            var documentDtos = documents.Select(d => MapToDto(d, baseUrl)).ToList();

            Response.Headers.Append("X-Total-Count", totalCount.ToString());
            return Ok(documentDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocument(Guid id)
        {
            var document = await _context.Documents
                .Where(d => d.Id == id && !d.IsDeleted)
                .FirstOrDefaultAsync();

            if (document == null)
                return NotFound();

            var baseUrl = _config["App:BaseUrl"];
            return Ok(MapToDto(document, baseUrl));
        }

        [HttpPost("upload")]
        public async Task<ActionResult<DocumentDto>> UploadDocument([FromForm] CreateDocumentDto createDto)
        {
            try
            {
                var documentDto = await _documentService.UploadAndCreateDocumentAsync(createDto.File, createDto);

                if (_notificationService != null)
                {
                    var eventEntity = await _context.Events.FindAsync(documentDto.EventId);
                    ApplicationUser? currentUser = null;
                    bool isHandler = false;
                    if (_userManager != null)
                    {
                        currentUser = await _userManager.GetUserAsync(User);
                        if (currentUser != null)
                        {
                            isHandler = await _userManager.IsInRoleAsync(currentUser, "Admin");
                        }
                    }

                    if (eventEntity != null && !isHandler)
                    {
                        await _notificationService.NotifyAsync(eventEntity, currentUser, ClaimNotificationEvent.DocumentAdded);
                    }
                }

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
                CanPreview = true // Simplified
            };
        }
    }
}
