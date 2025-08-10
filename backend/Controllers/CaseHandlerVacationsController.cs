using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models.Dictionary;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CaseHandlerVacationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CaseHandlerVacationsController> _logger;

        public CaseHandlerVacationsController(ApplicationDbContext context, ILogger<CaseHandlerVacationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CaseHandlerVacation>>> GetVacations()
        {
            return await _context.CaseHandlerVacations
                .Include(v => v.CaseHandler)
                .Include(v => v.SubstituteHandler)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CaseHandlerVacation>> GetVacation(int id)
        {
            var vacation = await _context.CaseHandlerVacations
                .Include(v => v.CaseHandler)
                .Include(v => v.SubstituteHandler)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vacation == null)
            {
                return NotFound();
            }

            return vacation;
        }

        [HttpPost]
        public async Task<ActionResult<CaseHandlerVacation>> CreateVacation(CaseHandlerVacation vacation)
        {
            if (vacation.StartDate >= vacation.EndDate)
            {
                return BadRequest("Start date must be before end date");
            }

            var overlap = await _context.CaseHandlerVacations
                .AnyAsync(v => v.CaseHandlerId == vacation.CaseHandlerId &&
                               v.StartDate < vacation.EndDate &&
                               vacation.StartDate < v.EndDate);

            if (overlap)
            {
                return BadRequest("Vacation period overlaps with existing vacation");
            }

            vacation.CreatedAt = DateTime.UtcNow;
            vacation.UpdatedAt = DateTime.UtcNow;

            _context.CaseHandlerVacations.Add(vacation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVacation), new { id = vacation.Id }, vacation);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVacation(int id, CaseHandlerVacation vacation)
        {
            if (id != vacation.Id)
            {
                return BadRequest();
            }

            if (vacation.StartDate >= vacation.EndDate)
            {
                return BadRequest("Start date must be before end date");
            }

            var overlap = await _context.CaseHandlerVacations
                .AnyAsync(v => v.CaseHandlerId == vacation.CaseHandlerId &&
                               v.Id != id &&
                               v.StartDate < vacation.EndDate &&
                               vacation.StartDate < v.EndDate);

            if (overlap)
            {
                return BadRequest("Vacation period overlaps with existing vacation");
            }

            var existing = await _context.CaseHandlerVacations.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.CaseHandlerId = vacation.CaseHandlerId;
            existing.StartDate = vacation.StartDate;
            existing.EndDate = vacation.EndDate;
            existing.SubstituteHandlerId = vacation.SubstituteHandlerId;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVacation(int id)
        {
            var vacation = await _context.CaseHandlerVacations.FindAsync(id);
            if (vacation == null)
            {
                return NotFound();
            }

            _context.CaseHandlerVacations.Remove(vacation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
