using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DataRangesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DataRangesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DataRangeDto>>> GetDataRanges()
        {
            var ranges = await _context.DataRanges
                .Select(dr => new DataRangeDto
                {
                    Id = dr.Id,
                    UserId = dr.UserId,
                    ClientId = dr.ClientId
                }).ToListAsync();

            return Ok(ranges);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DataRangeDto>> GetDataRange(int id)
        {
            var dr = await _context.DataRanges.FindAsync(id);
            if (dr == null) return NotFound();
            return new DataRangeDto { Id = dr.Id, UserId = dr.UserId, ClientId = dr.ClientId };
        }

        [HttpPost]
        public async Task<ActionResult<DataRangeDto>> CreateDataRange(CreateDataRangeDto dto)
        {
            var entity = new DataRange
            {
                UserId = dto.UserId,
                ClientId = dto.ClientId
            };

            _context.DataRanges.Add(entity);
            await _context.SaveChangesAsync();

            var result = new DataRangeDto
            {
                Id = entity.Id,
                UserId = entity.UserId,
                ClientId = entity.ClientId
            };

            return CreatedAtAction(nameof(GetDataRange), new { id = entity.Id }, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDataRange(int id)
        {
            var entity = await _context.DataRanges.FindAsync(id);
            if (entity == null) return NotFound();
            _context.DataRanges.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
