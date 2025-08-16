using System;

namespace AutomotiveClaimsApi.Models
{
    public class EventRule
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? EventType { get; set; }
        public Guid? TaskTemplateId { get; set; }
        public TaskTemplate? TaskTemplate { get; set; }
        public Guid? NotificationTemplateId { get; set; }
        public NotificationTemplate? NotificationTemplate { get; set; }
        public string? CronExpression { get; set; }
    }
}
