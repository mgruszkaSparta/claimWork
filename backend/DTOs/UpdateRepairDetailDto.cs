using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateRepairDetailDto
    {
        public Guid? EventId { get; set; }
        public string? BranchId { get; set; }
        public string? EmployeeEmail { get; set; }
        public bool? ReplacementVehicleRequired { get; set; }
        public string? ReplacementVehicleInfo { get; set; }
        public string? VehicleTabNumber { get; set; }
        public string? VehicleRegistration { get; set; }
        public string? DamageDateTime { get; set; }
        public string? AppraiserWaitingDate { get; set; }
        public string? RepairStartDate { get; set; }
        public string? RepairEndDate { get; set; }
        public bool? OtherVehiclesAvailable { get; set; }
        public string? OtherVehiclesInfo { get; set; }
        public string? RepairType { get; set; }
        public double? BodyworkHours { get; set; }
        public double? PaintingHours { get; set; }
        public double? AssemblyHours { get; set; }
        public double? OtherWorkHours { get; set; }
        public string? OtherWorkDescription { get; set; }
        public string? DamageDescription { get; set; }
        public string? AdditionalDescription { get; set; }
        public string? Status { get; set; }
    }
}
