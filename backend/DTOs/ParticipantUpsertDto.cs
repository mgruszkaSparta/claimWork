using System;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.DTOs
{
    public class ParticipantUpsertDto
    {
        public string? Id { get; set; }
        public string? Role { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? InsuranceCompany { get; set; }
        public string? PolicyNumber { get; set; }
        public string? VehicleRegistration { get; set; }
        public string? VehicleVin { get; set; }
        public string? VehicleType { get; set; }
        public string? VehicleBrand { get; set; }
        public string? VehicleModel { get; set; }
        public int? VehicleYear { get; set; }
        public string? InspectionContactName { get; set; }
        public string? InspectionContactPhone { get; set; }
        public string? InspectionContactEmail { get; set; }
        public bool IsAtFault { get; set; }
        public bool IsInjured { get; set; }
        public string? InjuryDescription { get; set; }
        public string? LicenseNumber { get; set; }
        public string? LicenseClass { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ParticipantType { get; set; }
        public string? ContactInfo { get; set; }
        public string? Notes { get; set; }
        public ICollection<DriverUpsertDto> Drivers { get; set; } = new List<DriverUpsertDto>();
    }
}
