using System;
using System.Linq;
using AutomotiveClaimsApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AutomotiveClaimsApi.Services
{
    public class AppealReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AppealReminderService> _logger;

        public AppealReminderService(IServiceProvider serviceProvider, ILogger<AppealReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    var appeals = await context.Appeals
                        .Where(a => a.DecisionDate == null)
                        .Include(a => a.Event)
                        .ToListAsync(stoppingToken);

                    foreach (var appeal in appeals)
                    {
                        var days = (DateTime.UtcNow - appeal.SubmissionDate).Days;
                        ClaimNotificationEvent? eventType = days switch
                        {
                            30 => ClaimNotificationEvent.SettlementAppealReminder30Days,
                            60 => ClaimNotificationEvent.SettlementAppealReminder60Days,
                            _ => null
                        };

                        if (eventType.HasValue && appeal.Event != null)
                        {
                            try
                            {
                                await notificationService.NotifyAsync(appeal.Event, null, eventType.Value);
                                _logger.LogInformation("Sent {Days}-day reminder for appeal {Id}", days, appeal.Id);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Error sending {Days}-day reminder for appeal {Id}", days, appeal.Id);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing appeal reminders");
                }

                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }
    }
}

