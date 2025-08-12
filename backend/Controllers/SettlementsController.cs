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

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettlementsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<SettlementsController> _logger;

        public SettlementsController(ApplicationDbContext context, IDocumentService documentService, ILogger<SettlementsController> logger)
        {
            _context = context;
            _documentService = documentService;
            _logger = logger;
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
                ExternalEntity = createDto.ExternalEntity,
                CustomExternalEntity = createDto.CustomExternalEntity,
                TransferDate = createDto.TransferDate,
                Status = createDto.Status,
                SettlementDate = createDto.SettlementDate,
                SettlementAmount = createDto.SettlementAmount,
                Currency = createDto.Currency,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (createDto.Document != null)
            {
                var docResult = await _documentService.SaveDocumentAsync(createDto.Document, "settlements", createDto.DocumentDescription);
                settlement.DocumentPath = docResult.FilePath;
                settlement.DocumentName = docResult.OriginalFileName;
                settlement.DocumentDescription = createDto.DocumentDescription;
            }

            _context.Settlements.Add(settlement);
            await _context.SaveChangesAsync();

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
            settlement.Status = updateDto.Status;
            settlement.SettlementDate = updateDto.SettlementDate;
            settlement.SettlementAmount = updateDto.SettlementAmount;
            settlement.Currency = updateDto.Currency;
            settlement.UpdatedAt = DateTime.UtcNow;

            if (updateDto.Document != null)
            {
                if (!string.IsNullOrEmpty(settlement.DocumentPath))
                {
                    await _documentService.DeleteDocumentAsync(settlement.Id);
                }
                var docResult = await _documentService.SaveDocumentAsync(updateDto.Document, "settlements", updateDto.DocumentDescription);
                settlement.DocumentPath = docResult.FilePath;
                settlement.DocumentName = docResult.OriginalFileName;
                settlement.DocumentDescription = updateDto.DocumentDescription;
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
                await _documentService.DeleteDocumentAsync(settlement.Id);
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
                .GroupBy(s => s.Currency ?? "PLN")
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
