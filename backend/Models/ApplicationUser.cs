using Microsoft.AspNetCore.Identity;
using AutomotiveClaimsApi.Models.Dictionary;

namespace AutomotiveClaimsApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public bool MustChangePassword { get; set; } = false;

        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        public int? ClientId { get; set; }
        public Client? Client { get; set; }

        public int? CaseHandlerId { get; set; }
        public CaseHandler? CaseHandler { get; set; }
    }
}
