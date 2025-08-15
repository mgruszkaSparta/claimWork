using System.Linq;
using AutomotiveClaimsApi.Models;
using Microsoft.Extensions.Logging;

namespace AutomotiveClaimsApi.Services
{
    public interface INotificationService
    {
        Task NotifyAsync(Event claim, ApplicationUser? actor, ClaimNotificationEvent eventType);
    }

    public class NotificationService : INotificationService
    {
        private readonly IEmailSender _emailSender;
        private readonly ClaimNotificationSettings _settings;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IEmailSender emailSender, ClaimNotificationSettings settings, ILogger<NotificationService> logger)
        {
            _emailSender = emailSender;
            _settings = settings;
            _logger = logger;
        }

        public async Task NotifyAsync(Event claim, ApplicationUser? actor, ClaimNotificationEvent eventType)
        {
            var recipients = _settings.Recipients;
            var events = _settings.Events;

            if (recipients == null || events == null || !events.Contains(eventType.ToString()))
                return;

            var subject = eventType switch
            {
                ClaimNotificationEvent.ClaimCreated => $"New claim created: {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.ClaimUpdated => $"Claim updated: {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.StatusChanged => $"Claim status changed to {claim.Status}: {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.DocumentAdded => $"Document added to claim {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.RequiredDocumentAdded => $"Required document added to claim {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.DecisionAdded => $"Decision added to claim {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.RecourseAdded => $"Recourse added to claim {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.SettlementAdded => $"Settlement added to claim {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.SettlementAppealAdded => $"Settlement appeal added to claim {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.SettlementAppealReminder30Days => $"Settlement appeal pending 30 days: {claim.ClaimNumber ?? claim.SpartaNumber}",
                ClaimNotificationEvent.SettlementAppealReminder60Days => $"Settlement appeal pending 60 days: {claim.ClaimNumber ?? claim.SpartaNumber}",
                _ => $"Claim notification: {claim.ClaimNumber ?? claim.SpartaNumber}"
            };

            var actorName = actor?.UserName ?? "Unknown user";
            var body = eventType switch
            {
                ClaimNotificationEvent.StatusChanged => $"Claim {claim.ClaimNumber ?? claim.SpartaNumber} changed status to {claim.Status} by {actorName}.",
                ClaimNotificationEvent.DecisionAdded => $"Decision added to claim {claim.ClaimNumber ?? claim.SpartaNumber} by {actorName}.",
                ClaimNotificationEvent.RecourseAdded => $"Recourse added to claim {claim.ClaimNumber ?? claim.SpartaNumber} by {actorName}.",
                ClaimNotificationEvent.SettlementAdded => $"Settlement added to claim {claim.ClaimNumber ?? claim.SpartaNumber} by {actorName}.",
                ClaimNotificationEvent.SettlementAppealAdded => $"Settlement appeal added to claim {claim.ClaimNumber ?? claim.SpartaNumber} by {actorName}.",
                ClaimNotificationEvent.SettlementAppealReminder30Days => $"Settlement appeal for claim {claim.ClaimNumber ?? claim.SpartaNumber} has been pending for 30 days.",
                ClaimNotificationEvent.SettlementAppealReminder60Days => $"Settlement appeal for claim {claim.ClaimNumber ?? claim.SpartaNumber} has been pending for 60 days.",
                _ => $"Claim {claim.ClaimNumber ?? claim.SpartaNumber} event {eventType} by {actorName}."
            };

            foreach (var email in recipients.Take(3))
            {
                try
                {
                    await _emailSender.SendEmailAsync(email, subject, body);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send claim notification to {Recipient}", email);
                }
            }
        }
    }
}
