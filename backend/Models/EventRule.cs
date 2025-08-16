using System;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Models
{
    public class EventRule
    {
        public Guid Id { get; set; }
        public ClaimNotificationEvent EventType { get; set; }
        public Guid? TaskTemplateId { get; set; }
        public Guid? NotificationTemplateId { get; set; }
        public string? CronExpression { get; set; }

        public TaskTemplate? TaskTemplate { get; set; }
        public NotificationTemplate? NotificationTemplate { get; set; }
    }
}
