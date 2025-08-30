using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeRolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeeRolesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeRole>>> GetAll()
        {
            return Ok(await _context.EmployeeRoles.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeRole>> Get(int id)
        {
            var role = await _context.EmployeeRoles.FindAsync(id);
            if (role == null) return NotFound();
            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeRole>> Create(EmployeeRole role)
        {
            _context.EmployeeRoles.Add(role);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = role.Id }, role);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, EmployeeRole role)
        {
            if (id != role.Id) return BadRequest();
            _context.Entry(role).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _context.EmployeeRoles.FindAsync(id);
            if (role == null) return NotFound();
            _context.EmployeeRoles.Remove(role);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
