using System;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.DTOs
{
    public class EventRuleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? EventType { get; set; }
        public Guid? TaskTemplateId { get; set; }
        public Guid? NotificationTemplateId { get; set; }
        public string? CronExpression { get; set; }
    }

    public class EventRuleUpsertDto
    {
        public Guid? Id { get; set; }
        public string? Name { get; set; }
        public string? EventType { get; set; }
        public Guid? TaskTemplateId { get; set; }
        public Guid? NotificationTemplateId { get; set; }
        public string? CronExpression { get; set; }
    }
}
