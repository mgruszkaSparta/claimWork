using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    [Route("api/[controller]")]
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
        public async Task<ActionResult<IEnumerable<DamageTypeDto>>> GetDamageTypes([FromQuery] Guid? riskTypeId = null)
        {
            try
            {
                var query = _context.DamageTypes
                    .Include(dt => dt.RiskType)
                    .Where(dt => dt.IsActive);

                if (riskTypeId.HasValue)
                {
                    query = query.Where(dt => dt.RiskTypeId == riskTypeId.Value);
                }

                var damageTypes = await query
                    .OrderBy(dt => dt.Name)
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
        public async Task<ActionResult<DamageTypeDto>> CreateDamageType(DamageTypeDto damageTypeDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var riskTypeExists = await _context.RiskTypes
                    .AnyAsync(rt => rt.Id == damageTypeDto.RiskTypeId && rt.IsActive);

                if (!riskTypeExists)
                {
                    return BadRequest($"Risk type with ID {damageTypeDto.RiskTypeId} not found or inactive");
                }

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
        public async Task<IActionResult> UpdateDamageType(Guid id, DamageTypeDto damageTypeDto)
        {
            try
            {
                if (id != damageTypeDto.Id)
                {
                    return BadRequest("ID mismatch");
                }

                var damageType = await _context.DamageTypes.FindAsync(id);
                if (damageType == null)
                {
                    return NotFound($"Damage type with ID {id} not found");
                }

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
        public async Task<IActionResult> DeleteDamageType(Guid id)
        {
            try
            {
                var damageType = await _context.DamageTypes.FindAsync(id);
                if (damageType == null)
                {
                    return NotFound($"Damage type with ID {id} not found");
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
