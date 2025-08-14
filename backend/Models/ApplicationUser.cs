using Microsoft.AspNetCore.Identity;

namespace AutomotiveClaimsApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
    }
}
