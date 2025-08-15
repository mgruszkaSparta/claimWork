using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;
        private readonly ILogger<RecoursesController> _logger;
        private readonly UserManager<ApplicationUser>? _userManager;
        private readonly INotificationService? _notificationService;

        public RecoursesController(ApplicationDbContext context, IDocumentService documentService, ILogger<RecoursesController> logger,
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
        public async Task<ActionResult<IEnumerable<RecourseDto>>> GetRecourses([FromQuery] Guid eventId)
        {
            try
            {
                var recourses = await _context.Recourses
                    .Where(r => r.EventId == eventId)
                    .OrderByDescending(r => r.FilingDate)
                    .Select(r => MapToDto(r))
                    .ToListAsync();

                return Ok(recourses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recourses for event {EventId}", eventId);
                return StatusCode(500, new { error = "Failed to retrieve recourses" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecourseDto>> GetRecourse(Guid id)
        {
            var recourse = await _context.Recourses.FindAsync(id);
            if (recourse == null)
            {
                return NotFound();
            }
            return MapToDto(recourse);
        }

        [HttpPost]
        public async Task<ActionResult<RecourseDto>> CreateRecourse([FromForm] CreateRecourseDto dto)
        {
            try
            {
                var recourse = new Recourse
                {
                    Id = Guid.NewGuid(),
                    EventId = dto.EventId,
                    IsJustified = dto.IsJustified,
                    FilingDate = dto.FilingDate,
                    InsuranceCompany = dto.InsuranceCompany,
                    ObtainDate = dto.ObtainDate,
                    Amount = dto.Amount,
                    CurrencyCode = dto.CurrencyCode,
                    DocumentDescription = dto.DocumentDescription,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                if (dto.Document != null)
                {
                    var doc = await _documentService.SaveDocumentAsync(dto.Document, "recourses", dto.DocumentDescription);
                    recourse.DocumentPath = doc.FilePath;
                    recourse.DocumentName = doc.OriginalFileName;
                }

                _context.Recourses.Add(recourse);
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
                        var eventEntity = await _context.Events.FindAsync(dto.EventId);
                        if (eventEntity != null)
                        {
                            await _notificationService.NotifyAsync(eventEntity, currentUser, ClaimNotificationEvent.RecourseAdded);
                        }
                    }
                }

                return CreatedAtAction(nameof(GetRecourse), new { id = recourse.Id }, MapToDto(recourse));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating recourse");
                return StatusCode(500, new { error = "Failed to create recourse" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RecourseDto>> UpdateRecourse(Guid id, [FromForm] UpdateRecourseDto dto)
        {
            try
            {
                var recourse = await _context.Recourses.FindAsync(id);
                if (recourse == null)
                {
                    return NotFound();
                }

                recourse.IsJustified = dto.IsJustified;
                recourse.FilingDate = dto.FilingDate;
                recourse.InsuranceCompany = dto.InsuranceCompany;
                recourse.ObtainDate = dto.ObtainDate;
                recourse.Amount = dto.Amount;
                recourse.CurrencyCode = dto.CurrencyCode;
                recourse.DocumentDescription = dto.DocumentDescription;
                recourse.UpdatedAt = DateTime.UtcNow;

                if (dto.Document != null)
                {
                    if (!string.IsNullOrEmpty(recourse.DocumentPath))
                    {
                        await _documentService.DeleteDocumentAsync(recourse.DocumentPath);
                    }
                    var doc = await _documentService.SaveDocumentAsync(dto.Document, "recourses", dto.DocumentDescription);
                    recourse.DocumentPath = doc.FilePath;
                    recourse.DocumentName = doc.OriginalFileName;
                }

                await _context.SaveChangesAsync();
                return Ok(MapToDto(recourse));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating recourse {RecourseId}", id);
                return StatusCode(500, new { error = "Failed to update recourse" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecourse(Guid id)
        {
            try
            {
                var recourse = await _context.Recourses.FindAsync(id);
                if (recourse == null)
                {
                    return NotFound();
                }

                if (!string.IsNullOrEmpty(recourse.DocumentPath))
                {
                    await _documentService.DeleteDocumentAsync(recourse.DocumentPath);
                }

                _context.Recourses.Remove(recourse);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting recourse {RecourseId}", id);
                return StatusCode(500, new { error = "Failed to delete recourse" });
            }
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(Guid id)
        {
            try
            {
                var recourse = await _context.Recourses.FindAsync(id);
                if (recourse == null || string.IsNullOrEmpty(recourse.DocumentPath))
                {
                    return NotFound();
                }

                var stream = await _documentService.GetDocumentStreamAsync(recourse.DocumentPath);
                var contentType = GetContentType(recourse.DocumentName ?? string.Empty);
                return File(stream, contentType, recourse.DocumentName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading recourse document {RecourseId}", id);
                return StatusCode(500, new { error = "Failed to download document" });
            }
        }

        [HttpGet("{id}/preview")]
        public async Task<IActionResult> PreviewDocument(Guid id)
        {
            try
            {
                var recourse = await _context.Recourses.FindAsync(id);
                if (recourse == null || string.IsNullOrEmpty(recourse.DocumentPath))
                {
                    return NotFound();
                }

                var stream = await _documentService.GetDocumentStreamAsync(recourse.DocumentPath);
                var contentType = GetContentType(recourse.DocumentName ?? string.Empty);
                return File(stream, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing recourse document {RecourseId}", id);
                return StatusCode(500, new { error = "Failed to preview document" });
            }
        }

        private static RecourseDto MapToDto(Recourse r) => new RecourseDto
        {
            Id = r.Id.ToString(),
            EventId = r.EventId.ToString(),
            Status = r.Status,
            InitiationDate = r.InitiationDate,
            Description = r.Description,
            Notes = r.Notes,
            RecourseNumber = r.RecourseNumber,
            RecourseAmount = r.RecourseAmount,
            IsJustified = r.IsJustified,
            FilingDate = r.FilingDate,
            InsuranceCompany = r.InsuranceCompany,
            ObtainDate = r.ObtainDate,
            Amount = r.Amount,
            CurrencyCode = r.CurrencyCode,
            DocumentPath = r.DocumentPath,
            DocumentName = r.DocumentName,
            DocumentDescription = r.DocumentDescription,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        };

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
