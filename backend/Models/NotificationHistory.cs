using System;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Models
{
    public class NotificationHistory
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public ClaimNotificationEvent EventType { get; set; }
        public Guid? DecisionId { get; set; }
        public Guid? RecourseId { get; set; }
        public Guid? SettlementId { get; set; }
        public Guid? AppealId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Event Event { get; set; } = null!;
    }
}
