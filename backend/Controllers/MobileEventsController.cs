using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/mobile/events")]
    public class MobileEventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MobileEventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MobileEventDto>>> Get()
        {
            var events = await _context.Events
                .OrderByDescending(e => e.CreatedAt)
                .Take(50)
                .Select(e => new MobileEventDto
                {
                    Id = e.Id.ToString(),
                    ClaimNumber = e.ClaimNumber,
                    DamageType = e.DamageType,
                    DamageDate = e.DamageDate,
                    Status = e.Status,
                    TotalClaim = e.TotalClaim,
                    Currency = e.Currency,
                    EventLocation = e.EventLocation,
                    EventDescription = e.EventDescription,
                    Handler = e.Handler,
                    HandlerPhone = e.HandlerPhone,
                    HandlerEmail = e.HandlerEmail
                })
                .ToListAsync();

            return Ok(events);
        }
    }
}
