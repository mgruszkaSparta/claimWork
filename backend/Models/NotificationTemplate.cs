using System;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Models
{
    public class NotificationTemplate
    {
        public Guid Id { get; set; }
        public ClaimNotificationEvent EventType { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }
}
