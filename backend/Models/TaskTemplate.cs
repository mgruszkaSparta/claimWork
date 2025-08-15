using System;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Models
{
    public class TaskTemplate
    {
        public Guid Id { get; set; }
        public ClaimNotificationEvent EventType { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
