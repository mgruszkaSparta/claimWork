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
    public class ClientClaimsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<ClientClaimsController> _logger;

        public ClientClaimsController(
            ApplicationDbContext context,
            IDocumentService documentService,
            ILogger<ClientClaimsController> logger)
        {
            _context = context;
            _documentService = documentService;
            _logger = logger;
        }

        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<ClientClaimDto>>> GetClientClaimsByEventId(Guid eventId)
        {
            try
            {
                var clientClaims = await _context.ClientClaims
                    .Where(c => c.EventId == eventId)
                    .OrderByDescending(c => c.ClaimDate)
                    .Select(c => MapToDto(c))
                    .ToListAsync();

                return Ok(clientClaims);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving client claims for event {EventId}", eventId);
                return StatusCode(500, new { error = "Failed to retrieve client claims" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientClaimDto>> GetClientClaim(Guid id)
        {
            try
            {
                var clientClaim = await _context.ClientClaims
                    .Where(c => c.Id == id)
                    .Select(c => MapToDto(c))
                    .FirstOrDefaultAsync();

                if (clientClaim == null)
                {
                    return NotFound();
                }

                return Ok(clientClaim);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving client claim {Id}", id);
                return StatusCode(500, new { error = "Failed to retrieve client claim" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ClientClaimDto>> CreateClientClaim([FromForm] CreateClientClaimDto createDto)
        {
            try
            {
                var clientClaim = new ClientClaim
                {
                    Id = Guid.NewGuid(),
                    EventId = createDto.EventId,
                    ClaimAmount = createDto.ClaimAmount,
                    ClaimDate = createDto.ClaimDate,
                    Status = createDto.Status,
                    Description = createDto.Description,
                    ClaimNotes = createDto.ClaimNotes,
                    ClaimNumber = createDto.ClaimNumber,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                if (createDto.Document != null)
                {
                    var documentResult = await _documentService.SaveDocumentAsync(
                        createDto.Document,
                        "client-claims",
                        createDto.DocumentDescription
                    );

                    clientClaim.DocumentPath = documentResult.FilePath;
                    clientClaim.DocumentName = documentResult.OriginalFileName;
                    clientClaim.DocumentDescription = createDto.DocumentDescription;
                }

                _context.ClientClaims.Add(clientClaim);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetClientClaim), new { id = clientClaim.Id }, MapToDto(clientClaim));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating client claim");
                return StatusCode(500, new { error = "Failed to create client claim" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ClientClaimDto>> UpdateClientClaim(Guid id, [FromForm] UpdateClientClaimDto updateDto)
        {
            try
            {
                var clientClaim = await _context.ClientClaims.FindAsync(id);
                if (clientClaim == null)
                {
                    return NotFound();
                }

                clientClaim.ClaimAmount = updateDto.ClaimAmount;
                clientClaim.ClaimDate = updateDto.ClaimDate;
                clientClaim.Status = updateDto.Status;
                clientClaim.Description = updateDto.Description;
                clientClaim.ClaimNotes = updateDto.ClaimNotes;
                clientClaim.ClaimNumber = updateDto.ClaimNumber;
                clientClaim.UpdatedAt = DateTime.UtcNow;

                if (updateDto.Document != null)
                {
                    if (!string.IsNullOrEmpty(clientClaim.DocumentPath))
                    {
                        await _documentService.DeleteDocumentAsync(clientClaim.Id);
                    }

                    var documentResult = await _documentService.SaveDocumentAsync(
                        updateDto.Document,
                        "client-claims",
                        updateDto.DocumentDescription
                    );

                    clientClaim.DocumentPath = documentResult.FilePath;
                    clientClaim.DocumentName = documentResult.OriginalFileName;
                    clientClaim.DocumentDescription = updateDto.DocumentDescription;
                }
                else if (!string.IsNullOrEmpty(updateDto.DocumentDescription))
                {
                    clientClaim.DocumentDescription = updateDto.DocumentDescription;
                }

                await _context.SaveChangesAsync();

                return Ok(MapToDto(clientClaim));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client claim {Id}", id);
                return StatusCode(500, new { error = "Failed to update client claim" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClientClaim(Guid id)
        {
            try
            {
                var clientClaim = await _context.ClientClaims.FindAsync(id);
                if (clientClaim == null)
                {
                    return NotFound();
                }

                if (!string.IsNullOrEmpty(clientClaim.DocumentPath))
                {
                    await _documentService.DeleteDocumentAsync(clientClaim.Id);
                }

                _context.ClientClaims.Remove(clientClaim);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting client claim {Id}", id);
                return StatusCode(500, new { error = "Failed to delete client claim" });
            }
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(Guid id)
        {
            try
            {
                var clientClaim = await _context.ClientClaims.FindAsync(id);
                if (clientClaim == null || string.IsNullOrEmpty(clientClaim.DocumentPath))
                {
                    return NotFound();
                }

                var fileStream = await _documentService.GetDocumentStreamAsync(clientClaim.DocumentPath);
                var contentType = GetContentType(clientClaim.DocumentName ?? "");

                return File(fileStream, contentType, clientClaim.DocumentName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading document for client claim {Id}", id);
                return StatusCode(500, new { error = "Failed to download document" });
            }
        }

        [HttpGet("{id}/preview")]
        public async Task<IActionResult> PreviewDocument(Guid id)
        {
            try
            {
                var clientClaim = await _context.ClientClaims.FindAsync(id);
                if (clientClaim == null || string.IsNullOrEmpty(clientClaim.DocumentPath))
                {
                    return NotFound();
                }

                var fileStream = await _documentService.GetDocumentStreamAsync(clientClaim.DocumentPath);
                var contentType = GetContentType(clientClaim.DocumentName ?? "");

                return File(fileStream, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing document for client claim {Id}", id);
                return StatusCode(500, new { error = "Failed to preview document" });
            }
        }

        private static ClientClaimDto MapToDto(ClientClaim c)
        {
            return new ClientClaimDto
            {
                Id = c.Id.ToString(),
                EventId = c.EventId.ToString(),
                ClaimAmount = c.ClaimAmount,
                ClaimDate = c.ClaimDate,
                Status = c.Status,
                Description = c.Description,
                ClaimNotes = c.ClaimNotes,
                ClaimNumber = c.ClaimNumber,
                DocumentPath = c.DocumentPath,
                DocumentName = c.DocumentName,
                DocumentDescription = c.DocumentDescription,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
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
