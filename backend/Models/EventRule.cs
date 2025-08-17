using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Models
{
    /// <summary>
    /// Defines a rule that triggers <see cref="ClaimNotificationEvent"/> for a given
    /// <see cref="Event"/> according to a cron expression.
    /// </summary>
    public class EventRule
    {
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Cron expression defining when the rule should fire.
        /// </summary>
        [Required]
        public string CronExpression { get; set; } = string.Empty;

        /// <summary>
        /// The notification event that should be raised.
        /// </summary>
        [Required]
        public ClaimNotificationEvent NotificationEvent { get; set; }

        /// <summary>
        /// Reference to the claim/event that should be used when raising the notification.
        /// </summary>
        [ForeignKey(nameof(Event))]
        public Guid EventId { get; set; }

        public Event? Event { get; set; }
    }
}
