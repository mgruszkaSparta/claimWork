namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateClientDto
    {
        public string? Name { get; set; }
        public string? FullName { get; set; }
        public string? ShortName { get; set; }
        public string? TaxId { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public bool? IsActive { get; set; }
    }
}
