using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DamagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DamagesController> _logger;

        public DamagesController(ApplicationDbContext context, ILogger<DamagesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<DamageDto>>> GetDamagesByEventId(Guid eventId)
        {
            try
            {
                var damages = await _context.Damages
                    .Where(d => d.EventId == eventId)
                    .Select(d => MapDamageToDto(d))
                    .ToListAsync();
                return Ok(damages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving damages for event {EventId}", eventId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DamageDto>> GetDamage(Guid id)
        {
            try
            {
                var damage = await _context.Damages.FindAsync(id);
                if (damage == null) return NotFound();
                return Ok(MapDamageToDto(damage));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving damage with id {DamageId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("init")]
        public ActionResult InitDamage()
        {
            var id = Guid.NewGuid();
            return Ok(new { id });
        }

        [HttpPost]
        public async Task<ActionResult<DamageDto>> PostDamage(DamageUpsertDto upsertDto)
        {
            try
            {
                if (!upsertDto.Id.HasValue || upsertDto.Id == Guid.Empty)
                {
                    return BadRequest("Damage ID is required. Use the init endpoint to obtain one.");
                }
                if (!upsertDto.EventId.HasValue || upsertDto.EventId == Guid.Empty)
                {
                    return BadRequest("EventId is required.");
                }

                if (!await _context.Events.AnyAsync(e => e.Id == upsertDto.EventId.Value))
                {
                    return BadRequest($"Event with id {upsertDto.EventId.Value} not found");
                }

                var damage = new Damage
                {
                    Id = upsertDto.Id.Value,
                    EventId = upsertDto.EventId.Value,
                    Description = upsertDto.Description,
                    Detail = upsertDto.Detail,
                    Location = upsertDto.Location,
                    Severity = upsertDto.Severity,
                    EstimatedCost = upsertDto.EstimatedCost,
                    ActualCost = upsertDto.ActualCost,
                    RepairStatus = upsertDto.RepairStatus,
                    RepairDate = upsertDto.RepairDate,
                    RepairShop = upsertDto.RepairShop,
                    Notes = upsertDto.Notes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Damages.Add(damage);
                await _context.SaveChangesAsync();
                var damageDto = MapDamageToDto(damage);
                return CreatedAtAction(nameof(GetDamage), new { id = damage.Id }, damageDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating damage");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDamage(Guid id, DamageUpsertDto upsertDto)
        {
            try
            {
                var damage = await _context.Damages.FindAsync(id);
                if (damage == null) return NotFound();

                damage.Description = upsertDto.Description;
                damage.Detail = upsertDto.Detail;
                damage.Location = upsertDto.Location;
                damage.Severity = upsertDto.Severity;
                damage.EstimatedCost = upsertDto.EstimatedCost;
                damage.ActualCost = upsertDto.ActualCost;
                damage.RepairStatus = upsertDto.RepairStatus;
                damage.RepairDate = upsertDto.RepairDate;
                damage.RepairShop = upsertDto.RepairShop;
                damage.Notes = upsertDto.Notes;
                damage.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating damage with id {DamageId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDamage(Guid id)
        {
            try
            {
                var damage = await _context.Damages.FindAsync(id);
                if (damage == null) return NotFound();

                _context.Damages.Remove(damage);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting damage with id {DamageId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        private static DamageDto MapDamageToDto(Damage d) => new DamageDto
        {
            Id = d.Id.ToString(),
            EventId = d.EventId.ToString(),
            Description = d.Description,
            Detail = d.Detail,
            Location = d.Location,
            Severity = d.Severity,
            EstimatedCost = d.EstimatedCost,
            ActualCost = d.ActualCost,
            RepairStatus = d.RepairStatus,
            RepairDate = d.RepairDate,
            RepairShop = d.RepairShop,
            Notes = d.Notes,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        };
    }
}
