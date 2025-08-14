using Microsoft.AspNetCore.Identity;

namespace AutomotiveClaimsApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public bool MustChangePassword { get; set; } = false;
    }
}
