using System;
using System.ComponentModel.DataAnnotations;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Models
{
    public class EventRule
    {
        [Key]
        public Guid Id { get; set; }

        public ClaimNotificationEvent EventType { get; set; }

        public Guid? TaskTemplateId { get; set; }
        public TaskTemplate? TaskTemplate { get; set; }

        public Guid? NotificationTemplateId { get; set; }
        public NotificationTemplate? NotificationTemplate { get; set; }
    }
}

