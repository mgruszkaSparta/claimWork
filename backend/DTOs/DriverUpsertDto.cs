using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class DriverUpsertDto
    {
        public string? Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? PersonalId { get; set; }
        public string? LicenseNumber { get; set; }
        public string? LicenseState { get; set; }
        public DateTime? LicenseExpirationDate { get; set; }
        public bool IsMainDriver { get; set; }
    }
}
