using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace EmailService;

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
                var client = scope.ServiceProvider.GetRequiredService<EmailClient>();

                var fetched = await client.FetchUnreadEmailsAsync();
                _logger.LogInformation("Fetched {Count} unread emails.", fetched.Count);

                var sent = await client.SendPendingEmailsAsync();
                _logger.LogInformation("Sent {Count} pending emails.", sent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing emails");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}

