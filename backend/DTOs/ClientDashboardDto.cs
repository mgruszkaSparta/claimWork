using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class ClientDashboardDto
    {
        public int TotalClaims { get; set; }
        public int ActiveClaims { get; set; }
        public int ClosedClaims { get; set; }
    }
}
