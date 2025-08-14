using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class EmailClaim
    {
        [Key]
        public Guid EmailId { get; set; }
        public Email Email { get; set; } = null!;

        [Key]
        public Guid ClaimId { get; set; }
        public ClientClaim Claim { get; set; } = null!;
    }
}
