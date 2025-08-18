using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,User")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DashboardController> _logger;
        private readonly UserManager<ApplicationUser> _userManager;

        public DashboardController(ApplicationDbContext context, ILogger<DashboardController> logger, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
        }

        [HttpGet("user")]
        public async Task<ActionResult<UserDashboardDto>> GetUserDashboard()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { error = "User not authenticated" });
                }

                var query = _context.Events.Where(e => e.RegisteredById == userId);

                var total = await query.CountAsync();
                var closed = await query.CountAsync(e => e.Status == "Closed");
                var active = await query.CountAsync(e => e.Status != "Closed");

                var result = new UserDashboardDto
                {
                    TotalClaims = total,
                    ActiveClaims = active,
                    ClosedClaims = closed
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve user dashboard stats");
                return StatusCode(500, new { error = "Failed to retrieve dashboard stats" });
            }
        }

        [HttpGet("client")]
        public async Task<ActionResult<ClientDashboardDto>> GetClientDashboard()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { error = "User not authenticated" });
                }

                var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null || user.ClientId == null)
                {
                    return NotFound(new { error = "User not assigned to a client" });
                }

                var query = _context.Events.Where(e => e.ClientId == user.ClientId);

                var total = await query.CountAsync();
                var closed = await query.CountAsync(e => e.Status == "Closed");
                var active = await query.CountAsync(e => e.Status != "Closed");

                var result = new ClientDashboardDto
                {
                    TotalClaims = total,
                    ActiveClaims = active,
                    ClosedClaims = closed
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve client dashboard stats");
                return StatusCode(500, new { error = "Failed to retrieve dashboard stats" });
            }
        }
    }
}
