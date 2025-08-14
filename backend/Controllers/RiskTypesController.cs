using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RiskTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RiskTypesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RiskTypeDto>>> GetRiskTypes([FromQuery] int? claimObjectTypeId, [FromQuery] bool? isActive)
        {
            try
            {
                var query = _context.RiskTypes.AsQueryable();

                if (isActive.HasValue)
                {
                    query = query.Where(rt => rt.IsActive == isActive.Value);
                }

                if (claimObjectTypeId.HasValue)
                {
                    query = query.Where(rt => rt.ClaimObjectTypeId == claimObjectTypeId);
                }

                var riskTypes = await query
                    .OrderBy(rt => rt.Name)
                    .Select(rt => new RiskTypeDto
                    {
                        Id = rt.Id,
                        Code = rt.Code,
                        Name = rt.Name,
                        Description = rt.Description,
                        IsActive = rt.IsActive
                    })
                    .ToListAsync();

                return Ok(riskTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch risk types", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RiskTypeDto>> GetRiskType(Guid id)
        {
            try
            {
                var riskType = await _context.RiskTypes
                    .Where(rt => rt.Id == id)
                    .Select(rt => new RiskTypeDto
                    {
                        Id = rt.Id,
                        Code = rt.Code,
                        Name = rt.Name,
                        Description = rt.Description,
                        IsActive = rt.IsActive
                    })
                    .FirstOrDefaultAsync();

                if (riskType == null)
                {
                    return NotFound();
                }

                return Ok(riskType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch risk type", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<RiskTypeDto>> CreateRiskType(RiskTypeDto riskTypeDto)
        {
            try
            {
                var riskType = new Models.RiskType
                {
                    Id = Guid.NewGuid(),
                    Code = riskTypeDto.Code,
                    Name = riskTypeDto.Name,
                    Description = riskTypeDto.Description,
                    IsActive = riskTypeDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.RiskTypes.Add(riskType);
                await _context.SaveChangesAsync();

                var result = new RiskTypeDto
                {
                    Id = riskType.Id,
                    Code = riskType.Code,
                    Name = riskType.Name,
                    Description = riskType.Description,
                    IsActive = riskType.IsActive
                };

                return CreatedAtAction(nameof(GetRiskType), new { id = riskType.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create risk type", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRiskType(Guid id, RiskTypeDto riskTypeDto)
        {
            try
            {
                var riskType = await _context.RiskTypes.FindAsync(id);
                if (riskType == null)
                {
                    return NotFound();
                }

                riskType.Code = riskTypeDto.Code;
                riskType.Name = riskTypeDto.Name;
                riskType.Description = riskTypeDto.Description;
                riskType.IsActive = riskTypeDto.IsActive;
                riskType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update risk type", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRiskType(Guid id)
        {
            try
            {
                var riskType = await _context.RiskTypes.FindAsync(id);
                if (riskType == null)
                {
                    return NotFound();
                }

                var hasDamageTypes = await _context.DamageTypes
                    .AnyAsync(dt => dt.RiskTypeId == id && dt.IsActive);
                if (hasDamageTypes)
                {
                    return Conflict(new { error = "Cannot delete risk type with associated damage types" });
                }

                riskType.IsActive = false;
                riskType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to delete risk type", details = ex.Message });
            }
        }
    }
}
