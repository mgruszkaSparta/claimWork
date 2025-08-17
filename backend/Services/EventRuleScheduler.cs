using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Cronos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Services
{
    /// <summary>
    /// Hosted service that schedules notifications based on <see cref="EventRule"/> records.
    /// </summary>
    public class EventRuleScheduler : IHostedService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<EventRuleScheduler> _logger;
        private readonly Dictionary<int, Timer> _timers = new();
        private readonly Dictionary<int, string> _jobIds = new();

        public EventRuleScheduler(IServiceProvider services, ILogger<EventRuleScheduler> logger)
        {
            _services = services;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var rules = await db.EventRules.AsNoTracking().ToListAsync(cancellationToken);
            foreach (var rule in rules)
            {
                await ScheduleRuleAsync(rule, cancellationToken);
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            foreach (var timer in _timers.Values)
            {
                timer.Dispose();
            }
            _timers.Clear();
            _jobIds.Clear();
            return Task.CompletedTask;
        }

        /// <summary>
        /// Schedules a rule based on its cron expression and persists the generated job id
        /// to <see cref="NotificationHistory"/>.
        /// </summary>
        private async Task ScheduleRuleAsync(EventRule rule, CancellationToken ct)
        {
            var cron = CronExpression.Parse(rule.CronExpression);
            var next = cron.GetNextOccurrence(DateTimeOffset.UtcNow);
            if (next == null)
            {
                return;
            }

            var jobId = Guid.NewGuid().ToString();
            _jobIds[rule.Id] = jobId;

            Timer? timer = null;
            async void Callback(object? _)
            {
                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                var ev = await db.Events.FindAsync(rule.EventId);
                if (ev != null)
                {
                    await notificationService.NotifyAsync(ev, null, rule.NotificationEvent);
                }

                // reschedule next occurrence
                var nextTime = cron.GetNextOccurrence(DateTimeOffset.UtcNow);
                if (nextTime != null)
                {
                    timer?.Change(nextTime.Value - DateTimeOffset.UtcNow, Timeout.InfiniteTimeSpan);
                }
            }

            var delay = next.Value - DateTimeOffset.UtcNow;
            timer = new Timer(Callback, null, delay, Timeout.InfiniteTimeSpan);
            _timers[rule.Id] = timer;

            using var scope2 = _services.CreateScope();
            var db2 = scope2.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db2.NotificationHistories.Add(new NotificationHistory { EventRuleId = rule.Id, JobId = jobId });
            await db2.SaveChangesAsync(ct);
        }

        /// <summary>
        /// Cancels a scheduled rule and removes its notification history.
        /// </summary>
        public async Task CancelRuleAsync(int ruleId)
        {
            if (_timers.TryGetValue(ruleId, out var timer))
            {
                timer.Dispose();
                _timers.Remove(ruleId);
            }

            _jobIds.Remove(ruleId);

            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var histories = db.NotificationHistories.Where(h => h.EventRuleId == ruleId);
            db.NotificationHistories.RemoveRange(histories);
            await db.SaveChangesAsync();
        }
    }
}
