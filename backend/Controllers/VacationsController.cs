using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VacationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VacationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<VacationRequestDto>> Create(CreateVacationRequestDto dto)
        {
            var request = new VacationRequest
            {
                Id = Guid.NewGuid(),
                ClaimHandlerId = dto.ClaimHandlerId,
                SubstituteId = dto.SubstituteId,
                ManagerIds = dto.ManagerIds,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = VacationRequestStatus.Pending
            };

            _context.VacationRequests.Add(request);
            await _context.SaveChangesAsync();

            await NotifyManagers(request.ManagerIds, request);

            return CreatedAtAction(nameof(GetById), new { id = request.Id }, ToDto(request));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VacationRequestDto>> GetById(Guid id)
        {
            var request = await _context.VacationRequests.FindAsync(id);
            if (request == null) return NotFound();
            return Ok(ToDto(request));
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<VacationRequestDto>>> GetPending()
        {
            var requests = await _context.VacationRequests
                .Where(v => v.Status == VacationRequestStatus.Pending)
                .Select(v => ToDto(v))
                .ToListAsync();
            return Ok(requests);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(Guid id)
        {
            var request = await _context.VacationRequests.FindAsync(id);
            if (request == null) return NotFound();

            request.Status = VacationRequestStatus.Approved;
            // TODO: reassign claims to substitute
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(Guid id)
        {
            var request = await _context.VacationRequests.FindAsync(id);
            if (request == null) return NotFound();

            request.Status = VacationRequestStatus.Rejected;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static VacationRequestDto ToDto(VacationRequest request) => new()
        {
            Id = request.Id,
            ClaimHandlerId = request.ClaimHandlerId,
            SubstituteId = request.SubstituteId,
            ManagerIds = request.ManagerIds,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = request.Status.ToString()
        };

        private Task NotifyManagers(IEnumerable<string> managerIds, VacationRequest request)
        {
            foreach (var managerId in managerIds)
            {
                // TODO: replace with real high-priority notification logic
                Console.WriteLine($"Notify manager {managerId} about vacation request {request.Id}");
            }
            return Task.CompletedTask;
        }
    }
}
