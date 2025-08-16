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
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettlementsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<SettlementsController> _logger;
        private readonly UserManager<ApplicationUser>? _userManager;
        private readonly INotificationService? _notificationService;

        public SettlementsController(ApplicationDbContext context, IDocumentService documentService, ILogger<SettlementsController> logger,
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
        public async Task<ActionResult<IEnumerable<SettlementDto>>> GetSettlementsByEventId(Guid eventId)
        {
            var settlements = await _context.Settlements
                .Where(s => s.EventId == eventId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => MapToDto(s))
                .ToListAsync();

            return Ok(settlements);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SettlementDto>> GetSettlement(Guid id)
        {
            var settlement = await _context.Settlements.FindAsync(id);

            if (settlement == null)
            {
                return NotFound();
            }

            return Ok(MapToDto(settlement));
        }

        [HttpPost]
        public async Task<ActionResult<SettlementDto>> CreateSettlement([FromForm] CreateSettlementDto createDto)
        {
            var settlement = new Settlement
            {
                Id = Guid.NewGuid(),
                EventId = createDto.EventId,
                ClaimId = createDto.ClaimId,
                SettlementNumber = createDto.SettlementNumber,
                SettlementType = createDto.SettlementType,
                ExternalEntity = createDto.ExternalEntity,
                CustomExternalEntity = createDto.CustomExternalEntity,
                TransferDate = createDto.TransferDate,
                Status = createDto.Status,
                SettlementDate = createDto.SettlementDate,
                Amount = createDto.Amount,
                SettlementAmount = createDto.SettlementAmount,
                Currency = createDto.Currency,
                PaymentMethod = createDto.PaymentMethod,
                Notes = createDto.Notes,
                Description = createDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Settlements.Add(settlement);
            await _context.SaveChangesAsync();

            if (createDto.Documents != null && createDto.Documents.Any())
            {
                foreach (var file in createDto.Documents)
                {
                    try
                    {
                        var docDto = await _documentService.UploadAndCreateDocumentAsync(file, new CreateDocumentDto
                        {
                            File = file,
                            Category = "settlements",
                            Description = createDto.DocumentDescription,
                            EventId = createDto.EventId,
                            RelatedEntityId = settlement.Id,
                            RelatedEntityType = "Settlement"
                        });

                        if (string.IsNullOrEmpty(settlement.DocumentPath))
                        {
                            settlement.DocumentPath = docDto.FilePath;
                            settlement.DocumentName = docDto.OriginalFileName;
                            settlement.DocumentDescription = createDto.DocumentDescription;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error saving document for settlement {SettlementId}", settlement.Id);
                        return StatusCode(500, new { error = "Failed to save document" });
                    }
                }
                await _context.SaveChangesAsync();
            }

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
                        await _notificationService.NotifyAsync(eventEntity, currentUser, ClaimNotificationEvent.SettlementAdded);
                    }
                }
            }

            return CreatedAtAction(nameof(GetSettlement), new { id = settlement.Id }, MapToDto(settlement));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSettlement(Guid id, [FromForm] UpdateSettlementDto updateDto)
        {
            var settlement = await _context.Settlements.FindAsync(id);
            if (settlement == null)
            {
                return NotFound();
            }

            settlement.ExternalEntity = updateDto.ExternalEntity;
            settlement.CustomExternalEntity = updateDto.CustomExternalEntity;
            settlement.TransferDate = updateDto.TransferDate;
            settlement.SettlementNumber = updateDto.SettlementNumber;
            settlement.SettlementType = updateDto.SettlementType;
            settlement.Status = updateDto.Status;
            settlement.SettlementDate = updateDto.SettlementDate;
            settlement.Amount = updateDto.Amount;
            settlement.SettlementAmount = updateDto.SettlementAmount;
            settlement.Currency = updateDto.Currency;
            settlement.PaymentMethod = updateDto.PaymentMethod;
            settlement.Notes = updateDto.Notes;
            settlement.Description = updateDto.Description;
            settlement.UpdatedAt = DateTime.UtcNow;

            if (updateDto.Documents != null && updateDto.Documents.Any())
            {
                foreach (var file in updateDto.Documents)
                {
                    try
                    {
                        var docDto = await _documentService.UploadAndCreateDocumentAsync(file, new CreateDocumentDto
                        {
                            File = file,
                            Category = "settlements",
                            Description = updateDto.DocumentDescription,
                            EventId = settlement.EventId,
                            RelatedEntityId = settlement.Id,
                            RelatedEntityType = "Settlement"
                        });

                        if (string.IsNullOrEmpty(settlement.DocumentPath))
                        {
                            settlement.DocumentPath = docDto.FilePath;
                            settlement.DocumentName = docDto.OriginalFileName;
                            settlement.DocumentDescription = updateDto.DocumentDescription;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error saving document for settlement {SettlementId}", id);
                        return StatusCode(500, new { error = "Failed to save document" });
                    }
                }
            }
            else if (updateDto.DocumentDescription != null)
            {
                settlement.DocumentDescription = updateDto.DocumentDescription;
            }

            await _context.SaveChangesAsync();

            return Ok(MapToDto(settlement));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSettlement(Guid id)
        {
            var settlement = await _context.Settlements.FindAsync(id);
            if (settlement == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(settlement.DocumentPath))
            {
                try
                {
                    await _documentService.DeleteDocumentAsync(settlement.DocumentPath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting document for settlement {SettlementId}", id);
                    return StatusCode(500, new { error = "Failed to delete document" });
                }
            }

            _context.Settlements.Remove(settlement);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(Guid id)
        {
            var settlement = await _context.Settlements.FindAsync(id);
            if (settlement == null || string.IsNullOrEmpty(settlement.DocumentPath))
            {
                return NotFound();
            }

            var fileStream = await _documentService.GetDocumentStreamAsync(settlement.DocumentPath);
            var contentType = GetContentType(settlement.DocumentName ?? "");

            return File(fileStream, contentType, settlement.DocumentName);
        }

        [HttpGet("{id}/preview")]
        public async Task<IActionResult> PreviewDocument(Guid id)
        {
            var settlement = await _context.Settlements.FindAsync(id);
            if (settlement == null || string.IsNullOrEmpty(settlement.DocumentPath))
            {
                return NotFound();
            }

            var fileStream = await _documentService.GetDocumentStreamAsync(settlement.DocumentPath);
            var contentType = GetContentType(settlement.DocumentName ?? "");

            return File(fileStream, contentType);
        }

        [HttpGet("event/{eventId}/summary")]
        public async Task<ActionResult<object>> GetSettlementsSummary(Guid eventId)
        {
            var settlements = await _context.Settlements
                .Where(s => s.EventId == eventId)
                .ToListAsync();

            var totalsByCurrency = settlements
                .GroupBy(s => (s.Currency ?? "PLN").ToUpperInvariant())
                .ToDictionary(g => g.Key, g => g.Sum(s => s.SettlementAmount ?? 0));

            var totalsByStatus = settlements
                .Where(s => s.Status != null)
                .GroupBy(s => s.Status!)
                .ToDictionary(g => g.Key, g => g.Count());

            return Ok(new
            {
                TotalsByCurrency = totalsByCurrency,
                TotalsByStatus = totalsByStatus,
                Count = settlements.Count
            });
        }

        private static SettlementDto MapToDto(Settlement s)
        {
            return new SettlementDto
            {
                Id = s.Id.ToString(),
                EventId = s.EventId.ToString(),
                ClaimId = s.ClaimId?.ToString(),
                ExternalEntity = s.ExternalEntity,
                CustomExternalEntity = s.CustomExternalEntity,
                TransferDate = s.TransferDate,
                Status = s.Status,
                SettlementDate = s.SettlementDate,
                Amount = s.Amount,
                Currency = s.Currency,
                PaymentMethod = s.PaymentMethod,
                Notes = s.Notes,
                Description = s.Description,
                DocumentPath = s.DocumentPath,
                DocumentName = s.DocumentName,
                DocumentDescription = s.DocumentDescription,
                SettlementNumber = s.SettlementNumber,
                SettlementType = s.SettlementType,
                SettlementAmount = s.SettlementAmount,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
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
