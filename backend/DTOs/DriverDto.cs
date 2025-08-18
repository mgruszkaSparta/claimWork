namespace AutomotiveClaimsApi.DTOs
{
    public class DriverDto
    {
        public string Id { get; set; } = string.Empty;
        public string ParticipantId { get; set; } = string.Empty;
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
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
