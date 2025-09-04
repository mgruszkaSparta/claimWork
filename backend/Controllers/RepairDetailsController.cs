using Microsoft.AspNetCore.Mvc;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/repair-details")]
    public class RepairDetailsController : ControllerBase
    {
        private static readonly List<RepairDetail> _details = new();

        [HttpGet]
        public ActionResult<IEnumerable<RepairDetailDto>> GetDetails([FromQuery] Guid? eventId)
        {
            var query = _details.AsEnumerable();
            if (eventId.HasValue)
            {
                query = query.Where(d => d.EventId == eventId.Value);
            }

            return Ok(query.Select(RepairDetailDto.FromModel));
        }

        [HttpGet("{id}")]
        public ActionResult<RepairDetailDto> GetDetail(Guid id)
        {
            var detail = _details.FirstOrDefault(d => d.Id == id);
            if (detail == null)
                return NotFound();
            return Ok(RepairDetailDto.FromModel(detail));
        }

        [HttpPost]
        public ActionResult<RepairDetailDto> CreateDetail([FromBody] CreateRepairDetailDto createDto)
        {
            var detail = new RepairDetail
            {
                Id = Guid.NewGuid(),
                EventId = createDto.EventId,
                BranchId = createDto.BranchId,
                EmployeeEmail = createDto.EmployeeEmail,
                ReplacementVehicleRequired = createDto.ReplacementVehicleRequired,
                ReplacementVehicleInfo = createDto.ReplacementVehicleInfo,
                VehicleTabNumber = createDto.VehicleTabNumber,
                VehicleRegistration = createDto.VehicleRegistration,
                DamageDateTime = createDto.DamageDateTime,
                AppraiserWaitingDate = createDto.AppraiserWaitingDate,
                RepairStartDate = createDto.RepairStartDate,
                RepairEndDate = createDto.RepairEndDate,
                OtherVehiclesAvailable = createDto.OtherVehiclesAvailable,
                OtherVehiclesInfo = createDto.OtherVehiclesInfo,
                RepairType = createDto.RepairType,
                BodyworkHours = createDto.BodyworkHours,
                PaintingHours = createDto.PaintingHours,
                AssemblyHours = createDto.AssemblyHours,
                OtherWorkHours = createDto.OtherWorkHours,
                OtherWorkDescription = createDto.OtherWorkDescription,
                DamageDescription = createDto.DamageDescription,
                AdditionalDescription = createDto.AdditionalDescription,
                Status = createDto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _details.Add(detail);
            return CreatedAtAction(nameof(GetDetail), new { id = detail.Id }, RepairDetailDto.FromModel(detail));
        }

        [HttpPut("{id}")]
        public ActionResult<RepairDetailDto> UpdateDetail(Guid id, [FromBody] UpdateRepairDetailDto updateDto)
        {
            var detail = _details.FirstOrDefault(d => d.Id == id);
            if (detail == null)
                return NotFound();

            if (updateDto.EventId.HasValue) detail.EventId = updateDto.EventId.Value;
            if (updateDto.BranchId != null) detail.BranchId = updateDto.BranchId;
            if (updateDto.EmployeeEmail != null) detail.EmployeeEmail = updateDto.EmployeeEmail;
            if (updateDto.ReplacementVehicleRequired.HasValue) detail.ReplacementVehicleRequired = updateDto.ReplacementVehicleRequired.Value;
            if (updateDto.ReplacementVehicleInfo != null) detail.ReplacementVehicleInfo = updateDto.ReplacementVehicleInfo;
            if (updateDto.VehicleTabNumber != null) detail.VehicleTabNumber = updateDto.VehicleTabNumber;
            if (updateDto.VehicleRegistration != null) detail.VehicleRegistration = updateDto.VehicleRegistration;
            if (updateDto.DamageDateTime != null) detail.DamageDateTime = updateDto.DamageDateTime;
            if (updateDto.AppraiserWaitingDate != null) detail.AppraiserWaitingDate = updateDto.AppraiserWaitingDate;
            if (updateDto.RepairStartDate != null) detail.RepairStartDate = updateDto.RepairStartDate;
            if (updateDto.RepairEndDate != null) detail.RepairEndDate = updateDto.RepairEndDate;
            if (updateDto.OtherVehiclesAvailable.HasValue) detail.OtherVehiclesAvailable = updateDto.OtherVehiclesAvailable.Value;
            if (updateDto.OtherVehiclesInfo != null) detail.OtherVehiclesInfo = updateDto.OtherVehiclesInfo;
            if (updateDto.RepairType != null) detail.RepairType = updateDto.RepairType;
            if (updateDto.BodyworkHours.HasValue) detail.BodyworkHours = updateDto.BodyworkHours.Value;
            if (updateDto.PaintingHours.HasValue) detail.PaintingHours = updateDto.PaintingHours.Value;
            if (updateDto.AssemblyHours.HasValue) detail.AssemblyHours = updateDto.AssemblyHours.Value;
            if (updateDto.OtherWorkHours.HasValue) detail.OtherWorkHours = updateDto.OtherWorkHours.Value;
            if (updateDto.OtherWorkDescription != null) detail.OtherWorkDescription = updateDto.OtherWorkDescription;
            if (updateDto.DamageDescription != null) detail.DamageDescription = updateDto.DamageDescription;
            if (updateDto.AdditionalDescription != null) detail.AdditionalDescription = updateDto.AdditionalDescription;
            if (updateDto.Status != null) detail.Status = updateDto.Status;

            detail.UpdatedAt = DateTime.UtcNow;
            return Ok(RepairDetailDto.FromModel(detail));
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteDetail(Guid id)
        {
            var detail = _details.FirstOrDefault(d => d.Id == id);
            if (detail == null)
                return NotFound();
            _details.Remove(detail);
            return NoContent();
        }
    }
}
