using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models
{
    /// <summary>
    /// Records scheduled notification jobs for tracking and cancellation.
    /// </summary>
    public class NotificationHistory
    {
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Related event rule.
        /// </summary>
        [ForeignKey(nameof(EventRule))]
        public int EventRuleId { get; set; }

        public EventRule? EventRule { get; set; }

        /// <summary>
        /// Identifier of the scheduled job returned by the scheduler.
        /// </summary>
        [Required]
        public string JobId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
