using System;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class TaskHistory
    {
        [Key]
        public Guid Id { get; set; }

        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;

        public Guid? DecisionId { get; set; }
        public Decision? Decision { get; set; }

        public Guid? RecourseId { get; set; }
        public Recourse? Recourse { get; set; }

        public Guid? SettlementId { get; set; }
        public Settlement? Settlement { get; set; }

        public Guid? AppealId { get; set; }
        public Appeal? Appeal { get; set; }

        public Guid? TaskTemplateId { get; set; }
        public TaskTemplate? TaskTemplate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}

