using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateRepairScheduleDto
    {
        public string? CompanyName { get; set; }
        public string? BranchId { get; set; }
        public string? VehicleFleetNumber { get; set; }
        public string? VehicleRegistration { get; set; }
        public string? ExpertWaitingDate { get; set; }
        public string? AdditionalInspections { get; set; }
        public string? RepairStartDate { get; set; }
        public string? RepairEndDate { get; set; }
        public string? WhyNotOperational { get; set; }
        public bool? AlternativeVehiclesAvailable { get; set; }
        public string? AlternativeVehiclesDescription { get; set; }
        public string? ContactDispatcher { get; set; }
        public string? ContactManager { get; set; }
        public string? Status { get; set; }
    }
}
