using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/damage-types")]
    public class DamageTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DamageTypesController> _logger;

        public DamageTypesController(ApplicationDbContext context, ILogger<DamageTypesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "catalog.read")]
        public async Task<ActionResult<IEnumerable<DamageTypeDto>>> GetDamageTypes(
            [FromQuery] string sortBy = "name",
            [FromQuery] string order = "asc",
            [FromQuery] bool? active = true,
            [FromQuery] string? query = null,
            [FromQuery] Guid? riskTypeId = null)
        {
            try
            {
                if (riskTypeId.HasValue && riskTypeId == Guid.Empty)
                    return BadRequest(new { message = "riskTypeId must be a valid GUID" });

                var damageTypesQuery = _context.DamageTypes
                    .Include(dt => dt.RiskType)
                    .AsQueryable();

                if (active.HasValue)
                    damageTypesQuery = damageTypesQuery.Where(dt => dt.IsActive == active.Value);

                if (riskTypeId.HasValue)
                    damageTypesQuery = damageTypesQuery.Where(dt => dt.RiskTypeId == riskTypeId.Value);

                if (!string.IsNullOrWhiteSpace(query))
                    damageTypesQuery = damageTypesQuery.Where(dt => dt.Name.Contains(query) || dt.Code.Contains(query));

                damageTypesQuery = (sortBy.ToLower(), order.ToLower()) switch
                {
                    ("code", "desc") => damageTypesQuery.OrderByDescending(dt => dt.Code),
                    ("code", _) => damageTypesQuery.OrderBy(dt => dt.Code),
                    ("name", "desc") => damageTypesQuery.OrderByDescending(dt => dt.Name),
                    ("createdat", "desc") => damageTypesQuery.OrderByDescending(dt => dt.CreatedAt),
                    ("createdat", _) => damageTypesQuery.OrderBy(dt => dt.CreatedAt),
                    ("updatedat", "desc") => damageTypesQuery.OrderByDescending(dt => dt.UpdatedAt),
                    ("updatedat", _) => damageTypesQuery.OrderBy(dt => dt.UpdatedAt),
                    (_, "desc") => damageTypesQuery.OrderByDescending(dt => dt.Name),
                    _ => damageTypesQuery.OrderBy(dt => dt.Name)
                };

                var damageTypes = await damageTypesQuery
                    .Select(dt => new DamageTypeDto
                    {
                        Id = dt.Id,
                        Name = dt.Name,
                        Code = dt.Code,
                        Description = dt.Description,
                        RiskTypeId = dt.RiskTypeId,
                        RiskTypeName = dt.RiskType != null ? dt.RiskType.Name : null,
                        IsActive = dt.IsActive,
                        CreatedAt = dt.CreatedAt,
                        UpdatedAt = dt.UpdatedAt
                    })
                    .ToListAsync();
                return Ok(damageTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving damage types");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "catalog.read")]
        public async Task<ActionResult<DamageTypeDto>> GetDamageType(Guid id)
        {
            try
            {
                var damageType = await _context.DamageTypes
                    .Include(dt => dt.RiskType)
                    .FirstOrDefaultAsync(dt => dt.Id == id);

                if (damageType == null)
                {
                    return NotFound($"Damage type with ID {id} not found");
                }

                var damageTypeDto = new DamageTypeDto
                {
                    Id = damageType.Id,
                    Name = damageType.Name,
                    Code = damageType.Code,
                    Description = damageType.Description,
                    RiskTypeId = damageType.RiskTypeId,
                    RiskTypeName = damageType.RiskType?.Name,
                    IsActive = damageType.IsActive,
                    CreatedAt = damageType.CreatedAt,
                    UpdatedAt = damageType.UpdatedAt
                };

                return Ok(damageTypeDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving damage type with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        [Authorize(Roles = "catalog.create")]
        public async Task<ActionResult<DamageTypeDto>> CreateDamageType(DamageTypeDto damageTypeDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (damageTypeDto.RiskTypeId == Guid.Empty)
                    return BadRequest(new { message = "riskTypeId must be a valid GUID" });

                var riskTypeExists = await _context.RiskTypes
                    .AnyAsync(rt => rt.Id == damageTypeDto.RiskTypeId && rt.IsActive);

                if (!riskTypeExists)
                {
                    return NotFound(new { message = $"Risk type with ID {damageTypeDto.RiskTypeId} not found" });
                }

                if (await _context.DamageTypes.AnyAsync(dt => dt.RiskTypeId == damageTypeDto.RiskTypeId && (dt.Code == damageTypeDto.Code || dt.Name == damageTypeDto.Name)))
                    return Conflict(new { message = "Damage type with the same code or name already exists for this risk type" });

                var damageType = new DamageType
                {
                    Id = Guid.NewGuid(),
                    Name = damageTypeDto.Name,
                    Code = damageTypeDto.Code,
                    Description = damageTypeDto.Description,
                    RiskTypeId = damageTypeDto.RiskTypeId,
                    IsActive = damageTypeDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.DamageTypes.Add(damageType);
                await _context.SaveChangesAsync();

                damageTypeDto.Id = damageType.Id;
                damageTypeDto.CreatedAt = damageType.CreatedAt;
                damageTypeDto.UpdatedAt = damageType.UpdatedAt;

                return CreatedAtAction(nameof(GetDamageType), new { id = damageType.Id }, damageTypeDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating damage type");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "catalog.update")]
        public async Task<IActionResult> UpdateDamageType(Guid id, DamageTypeDto damageTypeDto)
        {
            try
            {
                if (id != damageTypeDto.Id)
                    return BadRequest(new { message = "ID mismatch" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (damageTypeDto.RiskTypeId == Guid.Empty)
                    return BadRequest(new { message = "riskTypeId must be a valid GUID" });

                var damageType = await _context.DamageTypes.FindAsync(id);
                if (damageType == null)
                {
                    return NotFound(new { message = $"Damage type with ID {id} not found" });
                }

                if (await _context.DamageTypes.AnyAsync(dt => dt.Id != id && dt.RiskTypeId == damageTypeDto.RiskTypeId && (dt.Code == damageTypeDto.Code || dt.Name == damageTypeDto.Name)))
                    return Conflict(new { message = "Damage type with the same code or name already exists for this risk type" });

                damageType.Name = damageTypeDto.Name;
                damageType.Code = damageTypeDto.Code;
                damageType.Description = damageTypeDto.Description;
                damageType.RiskTypeId = damageTypeDto.RiskTypeId;
                damageType.IsActive = damageTypeDto.IsActive;
                damageType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating damage type with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "catalog.delete")]
        public async Task<IActionResult> DeleteDamageType(Guid id)
        {
            try
            {
                var damageType = await _context.DamageTypes.FindAsync(id);
                if (damageType == null)
                {
                    return NotFound(new { message = $"Damage type with ID {id} not found" });
                }

                var hasEvents = await _context.Events.AnyAsync(e => e.DamageType == damageType.Name);
                if (hasEvents)
                {
                    return Conflict(new { message = "Cannot delete damage type with related events" });
                }

                damageType.IsActive = false;
                damageType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting damage type with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
