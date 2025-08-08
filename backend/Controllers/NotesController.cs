using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotesController> _logger;

        public NotesController(ApplicationDbContext context, ILogger<NotesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NoteDto>>> GetNotes([FromQuery] string? eventId = null, [FromQuery] string? category = null)
        {
            var query = _context.Notes.AsQueryable();

            if (!string.IsNullOrEmpty(eventId) && Guid.TryParse(eventId, out var eventGuid))
            {
                query = query.Where(n => n.EventId == eventGuid);
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(n => n.Category == category);
            }

            var notes = await query
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NoteDto
                {
                    Id = n.Id.ToString(),
                    EventId = n.EventId.ToString(),
                    Category = n.Category,
                    Title = n.Title,
                    Content = n.Content,
                    CreatedBy = n.CreatedBy,
                    UpdatedBy = n.UpdatedBy,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt,
                    IsPrivate = n.IsPrivate,
                    Priority = n.Priority,
                    Tags = string.IsNullOrEmpty(n.Tags) ? null : n.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                })
                .ToListAsync();

            return Ok(notes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NoteDto>> GetNote(Guid id)
        {
            var note = await _context.Notes.FindAsync(id);

            if (note == null)
            {
                return NotFound();
            }

            var noteDto = new NoteDto
            {
                Id = note.Id.ToString(),
                EventId = note.EventId.ToString(),
                Category = note.Category,
                Title = note.Title,
                Content = note.Content,
                CreatedBy = note.CreatedBy,
                UpdatedBy = note.UpdatedBy,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                IsPrivate = note.IsPrivate,
                Priority = note.Priority,
                Tags = string.IsNullOrEmpty(note.Tags) ? null : note.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
            };

            return Ok(noteDto);
        }

        [HttpPost]
        public async Task<ActionResult<NoteDto>> CreateNote(NoteUpsertDto noteDto)
        {
            if (!Guid.TryParse(noteDto.EventId, out var eventId))
            {
                return BadRequest("Invalid EventId format");
            }

            var eventExists = await _context.Events.AnyAsync(e => e.Id == eventId);
            if (!eventExists)
            {
                return BadRequest("Event not found");
            }

            var note = new Note
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Category = noteDto.Category,
                Title = noteDto.Title,
                Content = noteDto.Content,
                CreatedBy = noteDto.CreatedBy,
                UpdatedBy = noteDto.CreatedBy,
                IsPrivate = noteDto.IsPrivate,
                Priority = noteDto.Priority,
                Tags = noteDto.Tags != null ? string.Join(",", noteDto.Tags) : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            var createdNoteDto = new NoteDto
            {
                Id = note.Id.ToString(),
                EventId = note.EventId.ToString(),
                Category = note.Category,
                Title = note.Title,
                Content = note.Content,
                CreatedBy = note.CreatedBy,
                UpdatedBy = note.UpdatedBy,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                IsPrivate = note.IsPrivate,
                Priority = note.Priority,
                Tags = noteDto.Tags
            };

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, createdNoteDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(Guid id, NoteUpsertDto noteDto)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null)
            {
                return NotFound();
            }

            note.Category = noteDto.Category;
            note.Title = noteDto.Title;
            note.Content = noteDto.Content;
            note.UpdatedBy = noteDto.CreatedBy; // Using CreatedBy as UpdatedBy for simplicity
            note.IsPrivate = noteDto.IsPrivate;
            note.Priority = noteDto.Priority;
            note.Tags = noteDto.Tags != null ? string.Join(",", noteDto.Tags) : null;
            note.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(Guid id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null)
            {
                return NotFound();
            }

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("categories")]
        public ActionResult<IEnumerable<string>> GetNoteCategories()
        {
            var categories = new[]
            {
                "General",
                "Documents",
                "Internal",
                "Investigation",
                "Repair",
                "Settlement",
                "Legal",
                "Communication",
                "Follow-up"
            };

            return Ok(categories);
        }

        [HttpGet("event/{eventId}/categories/{category}")]
        public async Task<ActionResult<IEnumerable<NoteDto>>> GetNotesByEventAndCategory(Guid eventId, string category)
        {
            var notes = await _context.Notes
                .Where(n => n.EventId == eventId && n.Category == category)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NoteDto
                {
                    Id = n.Id.ToString(),
                    EventId = n.EventId.ToString(),
                    Category = n.Category,
                    Title = n.Title,
                    Content = n.Content,
                    CreatedBy = n.CreatedBy,
                    UpdatedBy = n.UpdatedBy,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt,
                    IsPrivate = n.IsPrivate,
                    Priority = n.Priority,
                    Tags = string.IsNullOrEmpty(n.Tags) ? null : n.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                })
                .ToListAsync();

            return Ok(notes);
        }
    }
}
