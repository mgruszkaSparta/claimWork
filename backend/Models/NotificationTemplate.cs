using System;

namespace AutomotiveClaimsApi.Models
{
    public class NotificationTemplate
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public NotificationChannel Channel { get; set; }
        public string Recipients { get; set; } = string.Empty;
    }
}
