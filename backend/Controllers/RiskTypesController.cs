using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;

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
        public async Task<ActionResult<IEnumerable<RiskTypeDto>>> GetRiskTypes()
        {
            try
            {
                var riskTypes = await _context.RiskTypes
                    .Where(rt => rt.IsActive)
                    .OrderBy(rt => rt.Name)
                    .Select(rt => new RiskTypeDto
                    {
                        Id = rt.Id,
                        Code = rt.Code,
                        Name = rt.Name,
                        Description = rt.Description
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
                    .Where(rt => rt.Id == id && rt.IsActive)
                    .Select(rt => new RiskTypeDto
                    {
                        Id = rt.Id,
                        Code = rt.Code,
                        Name = rt.Name,
                        Description = rt.Description
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
                    IsActive = true,
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
                    Description = riskType.Description
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
