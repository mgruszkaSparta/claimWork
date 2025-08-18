using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Services
{
    public class EmailBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EmailBackgroundService> _logger;

        public EmailBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<EmailBackgroundService> logger)
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
                    var processor = scope.ServiceProvider.GetRequiredService<IEmailProcessingService>();

                    await processor.ProcessPendingEmailsAsync();
                    await processor.FetchEmailsAsync();
                    _logger.LogInformation("Email processing completed at {Time}", DateTimeOffset.Now);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while fetching emails");
                }

                // Wait for 5 minutes before next fetch
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
