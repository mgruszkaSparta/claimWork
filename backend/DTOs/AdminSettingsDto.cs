using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class AdminSettingsDto
    {
        public string Version { get; set; } = "1.0";
        public DateTime ServerTime { get; set; } = DateTime.UtcNow;
    }
}
