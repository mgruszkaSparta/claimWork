using System;
using System.Collections.Generic;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.DTOs
{
    public class NotificationTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public NotificationChannel Channel { get; set; }
        public List<string> Recipients { get; set; } = new();
    }

    public class NotificationTemplateUpsertDto
    {
        public Guid? Id { get; set; }
        public string? Name { get; set; }
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public NotificationChannel Channel { get; set; }
        public List<string>? Recipients { get; set; }
    }
}
