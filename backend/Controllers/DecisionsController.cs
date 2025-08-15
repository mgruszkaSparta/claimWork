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

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/claims/{claimId}/[controller]")]
    public class DecisionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<DecisionsController> _logger;
        private readonly UserManager<ApplicationUser>? _userManager;
        private readonly INotificationService? _notificationService;

        public DecisionsController(ApplicationDbContext context, IDocumentService documentService, ILogger<DecisionsController> logger,
            UserManager<ApplicationUser>? userManager = null,
            INotificationService? notificationService = null)
        {
            _context = context;
            _documentService = documentService;
            _logger = logger;
            _userManager = userManager;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DecisionDto>>> GetDecisions(Guid claimId)
        {
            try
            {
                var eventEntity = await _context.Events
                    .Include(e => e.Decisions)
                    .FirstOrDefaultAsync(e => e.Id == claimId);

                if (eventEntity == null)
                {
                    return NotFound(new { error = "Event not found" });
                }

                var decisions = eventEntity.Decisions
                    .OrderByDescending(d => d.DecisionDate)
                    .Select(d => MapToDto(d))
                    .ToList();

                return Ok(decisions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving decisions for claim {ClaimId}", claimId);
                return StatusCode(500, new { error = "Failed to retrieve decisions" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DecisionDto>> GetDecision(Guid claimId, Guid id)
        {
            try
            {
                var decision = await _context.Decisions
                    .FirstOrDefaultAsync(d => d.Id == id && d.EventId == claimId);

                if (decision == null)
                {
                    return NotFound(new { error = "Decision not found" });
                }

                return Ok(MapToDto(decision));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving decision {DecisionId} for claim {ClaimId}", id, claimId);
                return StatusCode(500, new { error = "Failed to retrieve decision" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DecisionDto>> CreateDecision(Guid claimId, [FromForm] CreateDecisionDto createDto)
        {
            DocumentDto? document = null;
            try
            {
                var eventEntity = await _context.Events.FindAsync(claimId);
                if (eventEntity == null)
                {
                    return NotFound(new { error = "Event not found" });
                }

                if (createDto.Document != null)
                {
                    var docCreate = new CreateDocumentDto
                    {
                        EventId = claimId,
                        File = createDto.Document,
                        Category = "decisions",
                        Description = createDto.DocumentDescription
                    };
                    document = await _documentService.UploadAndCreateDocumentAsync(createDto.Document, docCreate);
                }

                var decision = new Decision
                {
                    Id = Guid.NewGuid(),
                    EventId = claimId,
                    DecisionDate = createDto.DecisionDate,
                    Status = createDto.Status,
                    Amount = createDto.Amount,
                    Currency = createDto.Currency,
                    CompensationTitle = createDto.CompensationTitle,
                    DocumentDescription = createDto.DocumentDescription,
                    DocumentName = document?.OriginalFileName ?? document?.FileName,
                    DocumentPath = document?.FilePath,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Decisions.Add(decision);
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
                        await _notificationService.NotifyAsync(eventEntity, currentUser, ClaimNotificationEvent.DecisionAdded);
                    }
                }

                return CreatedAtAction(nameof(GetDecision), new { claimId, id = decision.Id }, MapToDto(decision));
            }
            catch (Exception ex)
            {
                if (document != null)
                {
                    await _documentService.DeleteDocumentAsync(document.Id);
                }
                _logger.LogError(ex, "Error creating decision for claim {ClaimId}", claimId);
                return StatusCode(500, new { error = "Failed to create decision" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DecisionDto>> UpdateDecision(Guid claimId, Guid id, [FromForm] UpdateDecisionDto updateDto)
        {
            DocumentDto? newDocument = null;
            try
            {
                var decision = await _context.Decisions.FirstOrDefaultAsync(d => d.Id == id && d.EventId == claimId);
                if (decision == null)
                {
                    return NotFound(new { error = "Decision not found" });
                }

                decision.DecisionDate = updateDto.DecisionDate;
                decision.Status = updateDto.Status ?? decision.Status;
                decision.Amount = updateDto.Amount;
                decision.Currency = updateDto.Currency ?? decision.Currency;
                decision.CompensationTitle = updateDto.CompensationTitle;
                decision.DocumentDescription = updateDto.DocumentDescription ?? decision.DocumentDescription;
                decision.UpdatedAt = DateTime.UtcNow;

                string? oldPath = decision.DocumentPath;

                if (updateDto.Document != null)
                {
                    var docCreate = new CreateDocumentDto
                    {
                        EventId = claimId,
                        File = updateDto.Document,
                        Category = "decisions",
                        Description = updateDto.DocumentDescription
                    };
                    newDocument = await _documentService.UploadAndCreateDocumentAsync(updateDto.Document, docCreate);
                    decision.DocumentPath = newDocument.FilePath;
                    decision.DocumentName = newDocument.OriginalFileName ?? newDocument.FileName;
                }

                await _context.SaveChangesAsync();

                if (newDocument != null && !string.IsNullOrEmpty(oldPath))
                {
                    await _documentService.DeleteDocumentAsync(oldPath);
                }

                return Ok(MapToDto(decision));
            }
            catch (Exception ex)
            {
                if (newDocument != null)
                {
                    await _documentService.DeleteDocumentAsync(newDocument.Id);
                }
                _logger.LogError(ex, "Error updating decision {DecisionId} for claim {ClaimId}", id, claimId);
                return StatusCode(500, new { error = "Failed to update decision" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDecision(Guid claimId, Guid id)
        {
            try
            {
                var decision = await _context.Decisions.FirstOrDefaultAsync(d => d.Id == id && d.EventId == claimId);
                if (decision == null)
                {
                    return NotFound(new { error = "Decision not found" });
                }

                if (!string.IsNullOrEmpty(decision.DocumentPath))
                {
                    await _documentService.DeleteDocumentAsync(decision.DocumentPath);
                }

                _context.Decisions.Remove(decision);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting decision {DecisionId} for claim {ClaimId}", id, claimId);
                return StatusCode(500, new { error = "Failed to delete decision" });
            }
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(Guid claimId, Guid id)
        {
            try
            {
                var decision = await _context.Decisions.FirstOrDefaultAsync(d => d.Id == id && d.EventId == claimId);
                if (decision == null || string.IsNullOrEmpty(decision.DocumentPath))
                {
                    return NotFound();
                }

                var fileStream = await _documentService.GetDocumentStreamAsync(decision.DocumentPath);
                var contentType = GetContentType(decision.DocumentName ?? "");
                return File(fileStream, contentType, decision.DocumentName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading document for decision {DecisionId} claim {ClaimId}", id, claimId);
                return StatusCode(500, new { error = "Failed to download document" });
            }
        }

        [HttpGet("{id}/preview")]
        public async Task<IActionResult> PreviewDocument(Guid claimId, Guid id)
        {
            try
            {
                var decision = await _context.Decisions.FirstOrDefaultAsync(d => d.Id == id && d.EventId == claimId);
                if (decision == null || string.IsNullOrEmpty(decision.DocumentPath))
                {
                    return NotFound();
                }

                var fileStream = await _documentService.GetDocumentStreamAsync(decision.DocumentPath);
                var contentType = GetContentType(decision.DocumentName ?? "");
                return File(fileStream, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing document for decision {DecisionId} claim {ClaimId}", id, claimId);
                return StatusCode(500, new { error = "Failed to preview document" });
            }
        }

        private static DecisionDto MapToDto(Decision d)
        {
            return new DecisionDto
            {
                Id = d.Id.ToString(),
                EventId = d.EventId.ToString(),
                DecisionDate = d.DecisionDate,
                Status = d.Status,
                Amount = d.Amount,
                Currency = d.Currency,
                CompensationTitle = d.CompensationTitle,
                DocumentDescription = d.DocumentDescription,
                DocumentName = d.DocumentName,
                DocumentPath = d.DocumentPath,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
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
