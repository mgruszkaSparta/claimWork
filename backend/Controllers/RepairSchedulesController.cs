using Microsoft.AspNetCore.Mvc;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RepairSchedulesController : ControllerBase
    {
        private static readonly List<RepairSchedule> _schedules = new();

        [HttpGet]
        public ActionResult<IEnumerable<RepairScheduleDto>> GetSchedules([FromQuery] Guid? eventId)
        {
            var query = _schedules.AsEnumerable();
            if (eventId.HasValue)
            {
                query = query.Where(s => s.EventId == eventId.Value);
            }

            return Ok(query.Select(RepairScheduleDto.FromModel));
        }

        [HttpGet("{id}")]
        public ActionResult<RepairScheduleDto> GetSchedule(Guid id)
        {
            var schedule = _schedules.FirstOrDefault(s => s.Id == id);
            if (schedule == null)
                return NotFound();
            return Ok(RepairScheduleDto.FromModel(schedule));
        }

        [HttpPost]
        public ActionResult<RepairScheduleDto> CreateSchedule([FromBody] CreateRepairScheduleDto createDto)
        {
            if (string.IsNullOrWhiteSpace(createDto.VehicleFleetNumber))
            {
                return BadRequest("VehicleFleetNumber is required.");
            }

            var schedule = new RepairSchedule
            {
                Id = Guid.NewGuid(),
                EventId = createDto.EventId,
                BranchId = createDto.BranchId,
                CompanyName = createDto.CompanyName,
                VehicleFleetNumber = createDto.VehicleFleetNumber,
                VehicleRegistration = createDto.VehicleRegistration,
                ExpertWaitingDate = createDto.ExpertWaitingDate,
                AdditionalInspections = createDto.AdditionalInspections,
                RepairStartDate = createDto.RepairStartDate,
                RepairEndDate = createDto.RepairEndDate,
                WhyNotOperational = createDto.WhyNotOperational,
                AlternativeVehiclesAvailable = createDto.AlternativeVehiclesAvailable,
                AlternativeVehiclesDescription = createDto.AlternativeVehiclesDescription,
                ContactDispatcher = createDto.ContactDispatcher,
                ContactManager = createDto.ContactManager,
                Status = createDto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _schedules.Add(schedule);
            return CreatedAtAction(nameof(GetSchedule), new { id = schedule.Id }, RepairScheduleDto.FromModel(schedule));
        }

        [HttpPut("{id}")]
        public ActionResult<RepairScheduleDto> UpdateSchedule(Guid id, [FromBody] UpdateRepairScheduleDto updateDto)
        {
            var schedule = _schedules.FirstOrDefault(s => s.Id == id);
            if (schedule == null)
                return NotFound();

            if (updateDto.VehicleFleetNumber != null && string.IsNullOrWhiteSpace(updateDto.VehicleFleetNumber))
                return BadRequest("VehicleFleetNumber is required.");

            if (updateDto.CompanyName != null) schedule.CompanyName = updateDto.CompanyName;
            if (updateDto.BranchId != null) schedule.BranchId = updateDto.BranchId;
            if (updateDto.VehicleFleetNumber != null) schedule.VehicleFleetNumber = updateDto.VehicleFleetNumber;
            if (updateDto.VehicleRegistration != null) schedule.VehicleRegistration = updateDto.VehicleRegistration;
            if (updateDto.ExpertWaitingDate != null) schedule.ExpertWaitingDate = updateDto.ExpertWaitingDate;
            if (updateDto.AdditionalInspections != null) schedule.AdditionalInspections = updateDto.AdditionalInspections;
            if (updateDto.RepairStartDate != null) schedule.RepairStartDate = updateDto.RepairStartDate;
            if (updateDto.RepairEndDate != null) schedule.RepairEndDate = updateDto.RepairEndDate;
            if (updateDto.WhyNotOperational != null) schedule.WhyNotOperational = updateDto.WhyNotOperational;
            if (updateDto.AlternativeVehiclesAvailable.HasValue) schedule.AlternativeVehiclesAvailable = updateDto.AlternativeVehiclesAvailable.Value;
            if (updateDto.AlternativeVehiclesDescription != null) schedule.AlternativeVehiclesDescription = updateDto.AlternativeVehiclesDescription;
            if (updateDto.ContactDispatcher != null) schedule.ContactDispatcher = updateDto.ContactDispatcher;
            if (updateDto.ContactManager != null) schedule.ContactManager = updateDto.ContactManager;
            if (updateDto.Status != null) schedule.Status = updateDto.Status;

            schedule.UpdatedAt = DateTime.UtcNow;
            return Ok(RepairScheduleDto.FromModel(schedule));
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteSchedule(Guid id)
        {
            var schedule = _schedules.FirstOrDefault(s => s.Id == id);
            if (schedule == null)
                return NotFound();
            _schedules.Remove(schedule);
            return NoContent();
        }
    }
}
