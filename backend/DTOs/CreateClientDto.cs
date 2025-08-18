using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateClientDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? ShortName { get; set; }
        public string? Nip { get; set; }
        public string? Regon { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
