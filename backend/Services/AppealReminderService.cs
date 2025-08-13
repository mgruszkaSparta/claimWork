using System;
using System.Linq;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
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
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                    var appeals = await context.Appeals
                        .Where(a => a.DecisionDate == null)
                        .ToListAsync(stoppingToken);

                    foreach (var appeal in appeals)
                    {
                        var days = (DateTime.UtcNow - appeal.SubmissionDate).Days;

                        if (days == 30 || days == 60)
                        {
                            var level = days == 30 ? "first" : "second";
                            try
                            {
                                await emailService.SendEmailAsync(new SendEmailDto
                                {
                                    To = "admin@example.com",
                                    Subject = $"Appeal reminder ({level} alert)",
                                    Body = $"Appeal {appeal.Id} has been pending for {days} days."
                                });
                                _logger.LogInformation("Sent {Level} alert for appeal {Id}", level, appeal.Id);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Error sending {Level} alert for appeal {Id}", level, appeal.Id);
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

