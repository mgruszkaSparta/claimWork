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
    public class AppealsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<AppealsController> _logger;

        public AppealsController(
            ApplicationDbContext context,
            IDocumentService documentService,
            ILogger<AppealsController> logger)
        {
            _context = context;
            _documentService = documentService;
            _logger = logger;
        }

        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<AppealDto>>> GetAppealsByEventId(Guid eventId)
        {
            try
            {
                var appeals = await _context.Appeals
                    .Where(a => a.EventId == eventId)
                    .OrderByDescending(a => a.SubmissionDate)
                    .Select(a => MapToDto(a))
                    .ToListAsync();

                return Ok(appeals);
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
                    .Where(a => a.Id == id)
                    .Select(a => MapToDto(a))
                    .FirstOrDefaultAsync();

                if (appeal == null)
                {
                    return NotFound();
                }

                return Ok(appeal);
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

                if (createDto.Document != null && createDto.Document.Length > 0)
                {
                    var documentResult = await _documentService.SaveDocumentAsync(
                        createDto.Document,
                        "appeals",
                        createDto.DocumentDescription
                    );

                    appeal.DocumentPath = documentResult.FilePath;
                    appeal.DocumentName = documentResult.OriginalFileName;
                    appeal.DocumentDescription = createDto.DocumentDescription;
                }
                else if (createDto.Document != null)
                {
                    return BadRequest(new { error = "Document file is empty" });
                }

                _context.Appeals.Add(appeal);
                await _context.SaveChangesAsync();

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

                if (updateDto.Document != null && updateDto.Document.Length > 0)
                {
                    if (!string.IsNullOrEmpty(appeal.DocumentPath))
                    {
                        await _documentService.DeleteDocumentAsync(appeal.DocumentPath);
                    }

                    var documentResult = await _documentService.SaveDocumentAsync(
                        updateDto.Document,
                        "appeals",
                        updateDto.DocumentDescription
                    );

                    appeal.DocumentPath = documentResult.FilePath;
                    appeal.DocumentName = documentResult.OriginalFileName;
                    appeal.DocumentDescription = updateDto.DocumentDescription;
                }
                else if (updateDto.Document != null)
                {
                    return BadRequest(new { error = "Document file is empty" });
                }
                else if (!string.IsNullOrEmpty(updateDto.DocumentDescription))
                {
                    appeal.DocumentDescription = updateDto.DocumentDescription;
                }

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
                var appeal = await _context.Appeals.FindAsync(id);
                if (appeal == null)
                {
                    return NotFound();
                }

                if (!string.IsNullOrEmpty(appeal.DocumentPath))
                {
                    await _documentService.DeleteDocumentAsync(appeal.DocumentPath);
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

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(Guid id)
        {
            try
            {
                var appeal = await _context.Appeals.FindAsync(id);
                if (appeal == null || string.IsNullOrEmpty(appeal.DocumentPath))
                {
                    return NotFound();
                }

                var fileStream = await _documentService.GetDocumentStreamAsync(appeal.DocumentPath);
                var contentType = GetContentType(appeal.DocumentName ?? "");

                return File(fileStream, contentType, appeal.DocumentName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading document for appeal {Id}", id);
                return StatusCode(500, new { error = "Failed to download document" });
            }
        }

        [HttpGet("{id}/preview")]
        public async Task<IActionResult> PreviewDocument(Guid id)
        {
            try
            {
                var appeal = await _context.Appeals.FindAsync(id);
                if (appeal == null || string.IsNullOrEmpty(appeal.DocumentPath))
                {
                    return NotFound();
                }

                var fileStream = await _documentService.GetDocumentStreamAsync(appeal.DocumentPath);
                var contentType = GetContentType(appeal.DocumentName ?? "");

                return File(fileStream, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing document for appeal {Id}", id);
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
                DocumentPath = a.DocumentPath,
                DocumentName = a.DocumentName,
                DocumentDescription = a.DocumentDescription,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
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
