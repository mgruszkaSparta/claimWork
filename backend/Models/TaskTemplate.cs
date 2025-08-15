using System;

namespace AutomotiveClaimsApi.Models
{
    public class TaskTemplate
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public NotificationChannel Channel { get; set; }
        public string Recipients { get; set; } = string.Empty;
        public string? CronExpression { get; set; }
    }
}
