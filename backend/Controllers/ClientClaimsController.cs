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
                    ClaimType = createDto.ClaimType,
                    Currency = createDto.Currency,
                    Status = createDto.Status,
                    Description = createDto.Description,
                    ClaimNotes = createDto.ClaimNotes,
                    ClaimNumber = createDto.ClaimNumber,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ClientClaims.Add(clientClaim);
                await _context.SaveChangesAsync();

                if (createDto.Documents != null && createDto.Documents.Any())
                {
                    foreach (var doc in createDto.Documents)
                    {
                        if (doc.Length > 0)
                        {
                            var documentResult = await _documentService.UploadAndCreateDocumentAsync(doc, new CreateDocumentDto
                            {
                                File = doc,
                                Category = "client-claims",
                                Description = createDto.DocumentDescription,
                                EventId = createDto.EventId,
                                RelatedEntityId = clientClaim.Id,
                                RelatedEntityType = "ClientClaim"
                            });

                            if (string.IsNullOrEmpty(clientClaim.DocumentPath))
                            {
                                clientClaim.DocumentPath = documentResult.FilePath;
                                clientClaim.DocumentName = documentResult.OriginalFileName;
                                clientClaim.DocumentDescription = createDto.DocumentDescription;
                            }
                        }
                        else
                        {
                            return BadRequest(new { error = "Document file is empty" });
                        }
                    }

                    await _context.SaveChangesAsync();
                }
                else if (createDto.Documents != null)
                {
                    return BadRequest(new { error = "Document file is empty" });
                }

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
                clientClaim.ClaimType = updateDto.ClaimType;
                clientClaim.Currency = updateDto.Currency;
                clientClaim.Status = updateDto.Status;
                clientClaim.Description = updateDto.Description;
                clientClaim.ClaimNotes = updateDto.ClaimNotes;
                clientClaim.ClaimNumber = updateDto.ClaimNumber;
                clientClaim.UpdatedAt = DateTime.UtcNow;

                if (updateDto.Documents != null && updateDto.Documents.Any())
                {
                    foreach (var doc in updateDto.Documents)
                    {
                        if (doc.Length > 0)
                        {
                            var documentResult = await _documentService.UploadAndCreateDocumentAsync(doc, new CreateDocumentDto
                            {
                                File = doc,
                                Category = "client-claims",
                                Description = updateDto.DocumentDescription,
                                EventId = clientClaim.EventId,
                                RelatedEntityId = clientClaim.Id,
                                RelatedEntityType = "ClientClaim"
                            });

                            if (string.IsNullOrEmpty(clientClaim.DocumentPath))
                            {
                                clientClaim.DocumentPath = documentResult.FilePath;
                                clientClaim.DocumentName = documentResult.OriginalFileName;
                                clientClaim.DocumentDescription = updateDto.DocumentDescription;
                            }
                        }
                        else
                        {
                            return BadRequest(new { error = "Document file is empty" });
                        }
                    }
                }
                else if (updateDto.Documents != null)
                {
                    return BadRequest(new { error = "Document file is empty" });
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
                    await _documentService.DeleteDocumentAsync(clientClaim.DocumentPath);
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

        [HttpGet("{claimId}/documents/{docId}/download")]
        public async Task<IActionResult> DownloadClaimDocument(Guid claimId, Guid docId)
        {
            try
            {
                var document = await _context.Documents
                    .Where(d => d.Id == docId && d.RelatedEntityType == "ClientClaim" && d.RelatedEntityId == claimId && !d.IsDeleted)
                    .FirstOrDefaultAsync();

                if (document == null)
                {
                    return NotFound();
                }

                var result = await _documentService.DownloadDocumentAsync(docId);
                if (result == null)
                {
                    return NotFound();
                }

                return File(result.FileStream, result.ContentType, result.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading document {DocId} for client claim {ClaimId}", docId, claimId);
                return StatusCode(500, new { error = "Failed to download document" });
            }
        }

        [HttpGet("{claimId}/documents/{docId}/preview")]
        public async Task<IActionResult> PreviewClaimDocument(Guid claimId, Guid docId)
        {
            try
            {
                var document = await _context.Documents
                    .Where(d => d.Id == docId && d.RelatedEntityType == "ClientClaim" && d.RelatedEntityId == claimId && !d.IsDeleted)
                    .FirstOrDefaultAsync();

                if (document == null)
                {
                    return NotFound();
                }

                var result = await _documentService.DownloadDocumentAsync(docId);
                if (result == null)
                {
                    return NotFound();
                }

                return File(result.FileStream, result.ContentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing document {DocId} for client claim {ClaimId}", docId, claimId);
                return StatusCode(500, new { error = "Failed to preview document" });
            }
        }

        private ClientClaimDto MapToDto(ClientClaim c)
        {
            var documents = _context.Documents
                .Where(d => d.RelatedEntityType == "ClientClaim" && d.RelatedEntityId == c.Id && !d.IsDeleted)
                .Select(d => new DocumentDto
                {
                    Id = d.Id,
                    EventId = d.EventId,
                    FileName = d.FileName,
                    OriginalFileName = d.OriginalFileName,
                    FilePath = d.FilePath,
                    FileSize = d.FileSize,
                    ContentType = d.ContentType,
                    Category = d.DocumentType,
                    Description = d.Description,
                    UploadedBy = d.UploadedBy,
                    IsActive = !d.IsDeleted,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    DownloadUrl = $"/api/clientclaims/{c.Id}/documents/{d.Id}/download",
                    PreviewUrl = $"/api/clientclaims/{c.Id}/documents/{d.Id}/preview",
                    CanPreview = true
                })
                .ToList();

            var documentId = documents.FirstOrDefault()?.Id.ToString();

            return new ClientClaimDto
            {
                Id = c.Id.ToString(),
                EventId = c.EventId.ToString(),
                ClaimNumber = c.ClaimNumber,
                ClaimDate = c.ClaimDate,
                ClaimType = c.ClaimType,
                ClaimAmount = c.ClaimAmount,
                Currency = c.Currency,
                Status = c.Status,
                Description = c.Description,
                DocumentPath = c.DocumentPath,
                DocumentName = c.DocumentName,
                DocumentDescription = c.DocumentDescription,
                DocumentId = documentId,
                Documents = documents,
                ClaimNotes = c.ClaimNotes,
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
