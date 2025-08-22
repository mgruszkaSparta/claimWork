using Microsoft.AspNetCore.Identity;
using AutomotiveClaimsApi.Models.Dictionary;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public bool MustChangePassword { get; set; } = false;

        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        public bool FullAccess { get; set; } = false;

        public int? CaseHandlerId { get; set; }
        public CaseHandler? CaseHandler { get; set; }

        public ICollection<UserClient> UserClients { get; set; } = new List<UserClient>();
    }
}
