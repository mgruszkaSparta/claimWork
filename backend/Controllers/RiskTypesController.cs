using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/risk-types")]
    public class RiskTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RiskTypesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "catalog.read")]
        public async Task<ActionResult<IEnumerable<RiskTypeDto>>> GetRiskTypes(
            [FromQuery] string sortBy = "name",
            [FromQuery] string order = "asc",
            [FromQuery] bool? active = true,
            [FromQuery] string? query = null)
        {
            try
            {
                var riskTypesQuery = _context.RiskTypes.AsQueryable();

                if (active.HasValue)
                    riskTypesQuery = riskTypesQuery.Where(rt => rt.IsActive == active.Value);

                if (!string.IsNullOrWhiteSpace(query))
                    riskTypesQuery = riskTypesQuery.Where(rt => rt.Name.Contains(query) || rt.Code.Contains(query));

                riskTypesQuery = (sortBy.ToLower(), order.ToLower()) switch
                {
                    ("code", "desc") => riskTypesQuery.OrderByDescending(rt => rt.Code),
                    ("code", _) => riskTypesQuery.OrderBy(rt => rt.Code),
                    ("name", "desc") => riskTypesQuery.OrderByDescending(rt => rt.Name),
                    ("createdat", "desc") => riskTypesQuery.OrderByDescending(rt => rt.CreatedAt),
                    ("createdat", _) => riskTypesQuery.OrderBy(rt => rt.CreatedAt),
                    ("updatedat", "desc") => riskTypesQuery.OrderByDescending(rt => rt.UpdatedAt),
                    ("updatedat", _) => riskTypesQuery.OrderBy(rt => rt.UpdatedAt),
                    (_, "desc") => riskTypesQuery.OrderByDescending(rt => rt.Name),
                    _ => riskTypesQuery.OrderBy(rt => rt.Name)
                };

                var riskTypes = await riskTypesQuery
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
        [Authorize(Roles = "catalog.read")]
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
        [Authorize(Roles = "catalog.create")]
        public async Task<ActionResult<RiskTypeDto>> CreateRiskType(RiskTypeDto riskTypeDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (await _context.RiskTypes.AnyAsync(rt => rt.Code == riskTypeDto.Code || rt.Name == riskTypeDto.Name))
                    return Conflict(new { message = "Risk type with the same code or name already exists" });

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
        [Authorize(Roles = "catalog.update")]
        public async Task<IActionResult> UpdateRiskType(Guid id, RiskTypeDto riskTypeDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var riskType = await _context.RiskTypes.FindAsync(id);
                if (riskType == null)
                {
                    return NotFound();
                }

                if (await _context.RiskTypes.AnyAsync(rt => rt.Id != id && (rt.Code == riskTypeDto.Code || rt.Name == riskTypeDto.Name)))
                    return Conflict(new { message = "Risk type with the same code or name already exists" });

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
        [Authorize(Roles = "catalog.delete")]
        public async Task<IActionResult> DeleteRiskType(Guid id)
        {
            try
            {
                var riskType = await _context.RiskTypes.FindAsync(id);
                if (riskType == null)
                {
                    return NotFound();
                }

                var hasDamageTypes = await _context.DamageTypes.AnyAsync(dt => dt.RiskTypeId == id && dt.IsActive);
                if (hasDamageTypes)
                {
                    return Conflict(new { message = "Cannot delete risk type with related damage types" });
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
