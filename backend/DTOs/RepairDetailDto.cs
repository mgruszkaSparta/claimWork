using System;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.DTOs
{
    public class RepairDetailDto
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string? BranchId { get; set; }
        public string? EmployeeEmail { get; set; }
        public bool ReplacementVehicleRequired { get; set; }
        public string? ReplacementVehicleInfo { get; set; }
        public string? VehicleTabNumber { get; set; }
        public string? VehicleRegistration { get; set; }
        public string? DamageDateTime { get; set; }
        public string? AppraiserWaitingDate { get; set; }
        public string? RepairStartDate { get; set; }
        public string? RepairEndDate { get; set; }
        public bool OtherVehiclesAvailable { get; set; }
        public string? OtherVehiclesInfo { get; set; }
        public string? RepairType { get; set; }
        public double BodyworkHours { get; set; }
        public double PaintingHours { get; set; }
        public double AssemblyHours { get; set; }
        public double OtherWorkHours { get; set; }
        public string? OtherWorkDescription { get; set; }
        public string? DamageDescription { get; set; }
        public string? AdditionalDescription { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public static RepairDetailDto FromModel(RepairDetail detail)
        {
            return new RepairDetailDto
            {
                Id = detail.Id,
                EventId = detail.EventId,
                BranchId = detail.BranchId,
                EmployeeEmail = detail.EmployeeEmail,
                ReplacementVehicleRequired = detail.ReplacementVehicleRequired,
                ReplacementVehicleInfo = detail.ReplacementVehicleInfo,
                VehicleTabNumber = detail.VehicleTabNumber,
                VehicleRegistration = detail.VehicleRegistration,
                DamageDateTime = detail.DamageDateTime,
                AppraiserWaitingDate = detail.AppraiserWaitingDate,
                RepairStartDate = detail.RepairStartDate,
                RepairEndDate = detail.RepairEndDate,
                OtherVehiclesAvailable = detail.OtherVehiclesAvailable,
                OtherVehiclesInfo = detail.OtherVehiclesInfo,
                RepairType = detail.RepairType,
                BodyworkHours = detail.BodyworkHours,
                PaintingHours = detail.PaintingHours,
                AssemblyHours = detail.AssemblyHours,
                OtherWorkHours = detail.OtherWorkHours,
                OtherWorkDescription = detail.OtherWorkDescription,
                DamageDescription = detail.DamageDescription,
                AdditionalDescription = detail.AdditionalDescription,
                Status = detail.Status,
                CreatedAt = detail.CreatedAt,
                UpdatedAt = detail.UpdatedAt
            };
        }
    }
}
