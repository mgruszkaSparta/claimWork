using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeaveRequestsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaveRequestDto>>> GetAll()
        {
            var leaves = await _context.LeaveRequests
                .Select(l => ToDto(l))
                .ToListAsync();
            return Ok(leaves);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LeaveRequestDto>> Get(Guid id)
        {
            var leave = await _context.LeaveRequests.FindAsync(id);
            if (leave == null) return NotFound();
            return Ok(ToDto(leave));
        }

        [HttpPost]
        public async Task<ActionResult<LeaveRequestDto>> Create(CreateLeaveRequestDto dto)
        {
            var leave = new LeaveRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                EmployeeName = dto.EmployeeName,
                EmployeeEmail = dto.EmployeeEmail,

                CaseHandlerId = dto.CaseHandlerId,

                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                FirstDayDuration = dto.FirstDayDuration,
                LastDayDuration = dto.LastDayDuration,
                Type = dto.Type,
                Priority = dto.Priority,
                SubstituteId = dto.SubstituteId,
                SubstituteName = dto.SubstituteName,
                SubstituteAcceptanceStatus = dto.SubstituteAcceptanceStatus,
                TransferDescription = dto.TransferDescription,
                UrgentProjects = dto.UrgentProjects,
                ImportantContacts = dto.ImportantContacts,
                Status = "SUBMITTED",
                SubmittedAt = DateTime.UtcNow
            };

            _context.LeaveRequests.Add(leave);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = leave.Id }, ToDto(leave));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<LeaveRequestDto>> Update(Guid id, CreateLeaveRequestDto dto)
        {
            var leave = await _context.LeaveRequests.FindAsync(id);
            if (leave == null) return NotFound();

            leave.EmployeeId = dto.EmployeeId;
            leave.EmployeeName = dto.EmployeeName;
            leave.EmployeeEmail = dto.EmployeeEmail;

            leave.CaseHandlerId = dto.CaseHandlerId;

            leave.StartDate = dto.StartDate;
            leave.EndDate = dto.EndDate;
            leave.FirstDayDuration = dto.FirstDayDuration;
            leave.LastDayDuration = dto.LastDayDuration;
            leave.Type = dto.Type;
            leave.Priority = dto.Priority;
            leave.SubstituteId = dto.SubstituteId;
            leave.SubstituteName = dto.SubstituteName;
            leave.SubstituteAcceptanceStatus = dto.SubstituteAcceptanceStatus;
            leave.TransferDescription = dto.TransferDescription;
            leave.UrgentProjects = dto.UrgentProjects;
            leave.ImportantContacts = dto.ImportantContacts;

            await _context.SaveChangesAsync();

            return Ok(ToDto(leave));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var leave = await _context.LeaveRequests.FindAsync(id);
            if (leave == null) return NotFound();

            _context.LeaveRequests.Remove(leave);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static LeaveRequestDto ToDto(LeaveRequest leave) => new()
        {
            Id = leave.Id,
            EmployeeId = leave.EmployeeId,
            EmployeeName = leave.EmployeeName,
            EmployeeEmail = leave.EmployeeEmail,

            CaseHandlerId = leave.CaseHandlerId,

            StartDate = leave.StartDate,
            EndDate = leave.EndDate,
            FirstDayDuration = leave.FirstDayDuration,
            LastDayDuration = leave.LastDayDuration,
            Type = leave.Type,
            Priority = leave.Priority,
            SubstituteId = leave.SubstituteId,
            SubstituteName = leave.SubstituteName,
            SubstituteAcceptanceStatus = leave.SubstituteAcceptanceStatus,
            TransferDescription = leave.TransferDescription,
            UrgentProjects = leave.UrgentProjects,
            ImportantContacts = leave.ImportantContacts,
            Status = leave.Status,
            SubmittedAt = leave.SubmittedAt,
            ApprovedBy = leave.ApprovedBy,
            ApprovedAt = leave.ApprovedAt,
            RejectionReason = leave.RejectionReason
        };
    }
}
