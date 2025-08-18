using System;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.DTOs
{
    public class RepairScheduleDto
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string? BranchId { get; set; }
        public string? CompanyName { get; set; }
        public string? VehicleFleetNumber { get; set; }
        public string? VehicleRegistration { get; set; }
        public string? ExpertWaitingDate { get; set; }
        public string? AdditionalInspections { get; set; }
        public string? RepairStartDate { get; set; }
        public string? RepairEndDate { get; set; }
        public string? WhyNotOperational { get; set; }
        public bool AlternativeVehiclesAvailable { get; set; }
        public string? AlternativeVehiclesDescription { get; set; }
        public string? ContactDispatcher { get; set; }
        public string? ContactManager { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public static RepairScheduleDto FromModel(RepairSchedule schedule)
        {
            return new RepairScheduleDto
            {
                Id = schedule.Id,
                EventId = schedule.EventId,
                BranchId = schedule.BranchId,
                CompanyName = schedule.CompanyName,
                VehicleFleetNumber = schedule.VehicleFleetNumber,
                VehicleRegistration = schedule.VehicleRegistration,
                ExpertWaitingDate = schedule.ExpertWaitingDate,
                AdditionalInspections = schedule.AdditionalInspections,
                RepairStartDate = schedule.RepairStartDate,
                RepairEndDate = schedule.RepairEndDate,
                WhyNotOperational = schedule.WhyNotOperational,
                AlternativeVehiclesAvailable = schedule.AlternativeVehiclesAvailable,
                AlternativeVehiclesDescription = schedule.AlternativeVehiclesDescription,
                ContactDispatcher = schedule.ContactDispatcher,
                ContactManager = schedule.ContactManager,
                Status = schedule.Status,
                CreatedAt = schedule.CreatedAt,
                UpdatedAt = schedule.UpdatedAt
            };
        }
    }
}
