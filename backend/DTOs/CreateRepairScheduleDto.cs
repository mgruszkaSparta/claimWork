using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateRepairScheduleDto
    {
        public Guid EventId { get; set; }
        public string? CompanyName { get; set; }
        public string? DamageNumber { get; set; }
        [Required]
        public string VehicleFleetNumber { get; set; } = string.Empty;
        [Required]
        public string VehicleRegistration { get; set; } = string.Empty;
        [Required]
        public string DamageDate { get; set; } = string.Empty;
        public string? DamageTime { get; set; }
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
    }
}
