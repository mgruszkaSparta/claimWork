using System;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.DTOs
{
    public class AssignEmailToClaimDto
    {
        public Guid EmailId { get; set; }
        public List<Guid> ClaimIds { get; set; } = new List<Guid>();
    }
}
