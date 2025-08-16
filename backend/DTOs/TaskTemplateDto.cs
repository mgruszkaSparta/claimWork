using System;
using System.Collections.Generic;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.DTOs
{
    public class TaskTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public NotificationChannel Channel { get; set; }
        public List<string> Recipients { get; set; } = new();
        public string? CronExpression { get; set; }
    }

    public class TaskTemplateUpsertDto
    {
        public Guid? Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public NotificationChannel Channel { get; set; }
        public List<string>? Recipients { get; set; }
        public string? CronExpression { get; set; }
    }
}
