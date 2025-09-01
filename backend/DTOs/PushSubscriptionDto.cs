using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class PushSubscriptionDto
    {
        public string Endpoint { get; set; } = string.Empty;
        public string? P256DH { get; set; }
        public string? Auth { get; set; }
        public string? UserId { get; set; }
    }
}
