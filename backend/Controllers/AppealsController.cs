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
using Microsoft.AspNetCore.Http;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppealsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<AppealsController> _logger;
        private readonly UserManager<ApplicationUser>? _userManager;
        private readonly INotificationService? _notificationService;

        public AppealsController(
            ApplicationDbContext context,
            IDocumentService documentService,
            ILogger<AppealsController> logger,
            UserManager<ApplicationUser>? userManager = null,
            INotificationService? notificationService = null)
        {
            _context = context;
            _documentService = documentService;
            _logger = logger;
            _userManager = userManager;
            _notificationService = notificationService;
        }

        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<AppealDto>>> GetAppealsByEventId(Guid eventId)
        {
            try
            {
                var appeals = await _context.Appeals
                    .Where(a => a.EventId == eventId)
                    .Include(a => a.Documents)
                    .OrderByDescending(a => a.SubmissionDate)
                    .ToListAsync();

                return Ok(appeals.Select(a => MapToDto(a)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appeals for event {EventId}", eventId);
                return StatusCode(500, new { error = "Failed to retrieve appeals" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppealDto>> GetAppeal(Guid id)
        {
            try
            {
                var appeal = await _context.Appeals
                    .Include(a => a.Documents)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appeal == null)
                {
                    return NotFound();
                }

                return Ok(MapToDto(appeal));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appeal {Id}", id);
                return StatusCode(500, new { error = "Failed to retrieve appeal" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<AppealDto>> CreateAppeal([FromForm] CreateAppealDto createDto)
        {
            try
            {
                var appeal = new Appeal
                {
                    Id = Guid.NewGuid(),
                    EventId = createDto.EventId,
                    SubmissionDate = createDto.FilingDate,
                    ExtensionDate = createDto.ExtensionDate,
                    Reason = createDto.Reason,
                    Status = createDto.Status,
                    Description = createDto.Description,
                    DecisionDate = createDto.DecisionDate,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Appeals.Add(appeal);
                await _context.SaveChangesAsync();

                if (_notificationService != null)
                {
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

                    if (!isHandler)
                    {
                        var eventEntity = await _context.Events.FindAsync(createDto.EventId);
                        if (eventEntity != null)
                        {
                            await _notificationService.NotifyAsync(eventEntity, currentUser, ClaimNotificationEvent.SettlementAppealAdded);
                        }
                    }
                }

                return CreatedAtAction(nameof(GetAppeal), new { id = appeal.Id }, MapToDto(appeal));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appeal");
                return StatusCode(500, new { error = "Failed to create appeal" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AppealDto>> UpdateAppeal(Guid id, [FromForm] UpdateAppealDto updateDto)
        {
            try
            {
                var appeal = await _context.Appeals.FindAsync(id);
                if (appeal == null)
                {
                    return NotFound();
                }

                appeal.SubmissionDate = updateDto.FilingDate;
                appeal.ExtensionDate = updateDto.ExtensionDate;
                appeal.Reason = updateDto.Reason;
                appeal.Status = updateDto.Status;
                appeal.Description = updateDto.Description;
                appeal.DecisionDate = updateDto.DecisionDate;
                appeal.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(MapToDto(appeal));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating appeal {Id}", id);
                return StatusCode(500, new { error = "Failed to update appeal" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppeal(Guid id)
        {
            try
            {
                var appeal = await _context.Appeals
                    .Include(a => a.Documents)
                    .FirstOrDefaultAsync(a => a.Id == id);
                if (appeal == null)
                {
                    return NotFound();
                }

                foreach (var doc in appeal.Documents)
                {
                    await _documentService.DeleteDocumentAsync(doc.FilePath);
                }

                _context.Appeals.Remove(appeal);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting appeal {Id}", id);
                return StatusCode(500, new { error = "Failed to delete appeal" });
            }
        }

        [HttpGet("{id}/documents")]
        public async Task<ActionResult<IEnumerable<AppealDocumentDto>>> GetAppealDocuments(Guid id)
        {
            try
            {
                var docs = await _documentService.GetAppealDocumentsAsync(id);
                return Ok(docs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving documents for appeal {Id}", id);
                return StatusCode(500, new { error = "Failed to retrieve documents" });
            }
        }

        [HttpPost("{id}/documents")]
        public async Task<ActionResult<IEnumerable<AppealDocumentDto>>> UploadAppealDocuments(Guid id, [FromForm] IFormFile[] files, [FromForm] string[]? descriptions)
        {
            try
            {
                if (files == null || files.Length == 0)
                {
                    return BadRequest(new { error = "No files uploaded" });
                }

                var result = new List<AppealDocumentDto>();
                for (var i = 0; i < files.Length; i++)
                {
                    var description = descriptions != null && i < descriptions.Length ? descriptions[i] : null;
                    var doc = await _documentService.UploadAppealDocumentAsync(id, files[i], description);
                    result.Add(doc);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading documents for appeal {Id}", id);
                return StatusCode(500, new { error = "Failed to upload documents" });
            }
        }

        [HttpDelete("documents/{documentId}")]
        public async Task<IActionResult> DeleteAppealDocument(Guid documentId)
        {
            try
            {
                var deleted = await _documentService.DeleteAppealDocumentAsync(documentId);
                if (!deleted)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting appeal document {DocumentId}", documentId);
                return StatusCode(500, new { error = "Failed to delete document" });
            }
        }

        [HttpGet("documents/{documentId}/download")]
        public async Task<IActionResult> DownloadAppealDocument(Guid documentId)
        {
            try
            {
                var document = await _context.AppealDocuments.FindAsync(documentId);
                if (document == null)
                {
                    return NotFound();
                }

                var fileStream = await _documentService.GetDocumentStreamAsync(document.FilePath);
                var contentType = GetContentType(document.FileName);
                return File(fileStream, contentType, document.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading appeal document {DocumentId}", documentId);
                return StatusCode(500, new { error = "Failed to download document" });
            }
        }

        [HttpGet("documents/{documentId}/preview")]
        public async Task<IActionResult> PreviewAppealDocument(Guid documentId)
        {
            try
            {
                var document = await _context.AppealDocuments.FindAsync(documentId);
                if (document == null)
                {
                    return NotFound();
                }

                var fileStream = await _documentService.GetDocumentStreamAsync(document.FilePath);
                var contentType = GetContentType(document.FileName);
                return File(fileStream, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing appeal document {DocumentId}", documentId);
                return StatusCode(500, new { error = "Failed to preview document" });
            }
        }

        private static AppealDto MapToDto(Appeal a)
        {
            return new AppealDto
            {
                Id = a.Id.ToString(),
                EventId = a.EventId.ToString(),
                SubmissionDate = a.SubmissionDate,
                ExtensionDate = a.ExtensionDate,
                Reason = a.Reason,
                Status = a.Status,
                Notes = a.Notes,
                Description = a.Description,
                AppealNumber = a.AppealNumber,
                AppealAmount = a.AppealAmount,
                DecisionDate = a.DecisionDate,
                DecisionReason = a.DecisionReason,
                DaysSinceSubmission = (int?)(DateTime.UtcNow - a.SubmissionDate).TotalDays,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
                Documents = a.Documents.Select(d => new AppealDocumentDto
                {
                    Id = d.Id,
                    FilePath = d.FilePath,
                    FileName = d.FileName,
                    Description = d.Description,
                    CreatedAt = d.CreatedAt
                }).ToList()
            };
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream"
            };
        }
    }
}
