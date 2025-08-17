using Microsoft.AspNetCore.Identity;

namespace AutomotiveClaimsApi.Models
{
    public class ApplicationUser : IdentityUser
    {

        public bool MustChangePassword { get; set; } = false;

        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        public int? ClientId { get; set; }
        public Client? Client { get; set; }
    }
}
