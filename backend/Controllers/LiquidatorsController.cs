using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LiquidatorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LiquidatorsController> _logger;

        public LiquidatorsController(ApplicationDbContext context, ILogger<LiquidatorsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LiquidatorDto>>> GetLiquidators()
        {
            try
            {
                var liquidators = await _context.Liquidators
                    .Where(l => l.IsActive)
                    .OrderBy(l => l.Name)
                    .Select(l => new LiquidatorDto
                    {
                        Id = l.Id,
                        Name = l.Name,
                        Email = l.Email,
                        Phone = l.Phone,
                        Address = l.Address
                    })
                    .ToListAsync();

                return Ok(liquidators);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving liquidators");
                return StatusCode(500, new { error = "Failed to retrieve liquidators" });
            }
        }
    }
}
