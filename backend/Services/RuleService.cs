using System;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Services
{
    public interface IRuleService
    {
        Task ProcessAsync(ClaimNotificationEvent eventType, Guid entityId);
    }

    public class RuleService : IRuleService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService? _notificationService;

        public RuleService(ApplicationDbContext context, INotificationService? notificationService = null)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task ProcessAsync(ClaimNotificationEvent eventType, Guid entityId)
        {
            Guid? eventId = null;
            Guid? decisionId = null;
            Guid? recourseId = null;
            Guid? settlementId = null;
            Guid? appealId = null;

            switch (eventType)
            {
                case ClaimNotificationEvent.DecisionAdded:
                    var decision = await _context.Decisions.FindAsync(entityId);
                    eventId = decision?.EventId;
                    decisionId = entityId;
                    break;
                case ClaimNotificationEvent.RecourseAdded:
                    var recourse = await _context.Recourses.FindAsync(entityId);
                    eventId = recourse?.EventId;
                    recourseId = entityId;
                    break;
                case ClaimNotificationEvent.SettlementAdded:
                    var settlement = await _context.Settlements.FindAsync(entityId);
                    eventId = settlement?.EventId;
                    settlementId = entityId;
                    break;
                case ClaimNotificationEvent.SettlementAppealAdded:
                    var appeal = await _context.Appeals.FindAsync(entityId);
                    eventId = appeal?.EventId;
                    appealId = entityId;
                    break;
            }

            if (eventId == null)
            {
                return;
            }

            var taskHistory = new TaskHistory
            {
                Id = Guid.NewGuid(),
                EventId = eventId.Value,
                EventType = eventType,
                DecisionId = decisionId,
                RecourseId = recourseId,
                SettlementId = settlementId,
                AppealId = appealId,
                CreatedAt = DateTime.UtcNow
            };

            var notificationHistory = new NotificationHistory
            {
                Id = Guid.NewGuid(),
                EventId = eventId.Value,
                EventType = eventType,
                DecisionId = decisionId,
                RecourseId = recourseId,
                SettlementId = settlementId,
                AppealId = appealId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaskHistories.Add(taskHistory);
            _context.NotificationHistories.Add(notificationHistory);
            await _context.SaveChangesAsync();

            if (_notificationService != null)
            {
                var eventEntity = await _context.Events.FindAsync(eventId.Value);
                if (eventEntity != null)
                {
                    await _notificationService.NotifyAsync(eventEntity, null, eventType);
                }
            }
        }
    }
}
