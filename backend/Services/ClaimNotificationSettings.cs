using System.Collections.Generic;

namespace AutomotiveClaimsApi.Services
{
    public class ClaimNotificationSettings
    {
        public List<string> Recipients { get; set; } = new();
        public List<string> Events { get; set; } = new();
    }
}
