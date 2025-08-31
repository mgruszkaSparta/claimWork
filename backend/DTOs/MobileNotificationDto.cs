using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class MobileNotificationDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // info, success, warning, error
        public DateTime Timestamp { get; set; }
        public bool Read { get; set; }
        public string? ClaimId { get; set; }
        public string? ActionType { get; set; } // status_update, new_claim, reminder, system
        public string? RecipientId { get; set; }
    }
}
