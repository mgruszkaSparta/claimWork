using System.Text.Json;
using AutomotiveClaimsApi.DTOs;
using WebPush;

namespace AutomotiveClaimsApi.Services
{
    public interface IPushNotificationService
    {
        Task SendAsync(IEnumerable<PushSubscriptionDto> subscriptions, string title, string message);
    }

    public class PushNotificationService : IPushNotificationService
    {
        private readonly VapidOptions _options;
        private readonly WebPushClient _client = new();

        public PushNotificationService(VapidOptions options)
        {
            _options = options;
        }

        public async Task SendAsync(IEnumerable<PushSubscriptionDto> subscriptions, string title, string message)
        {
            var payload = JsonSerializer.Serialize(new { title, message });
            foreach (var sub in subscriptions)
            {
                try
                {
                    var pushSub = new PushSubscription(sub.Endpoint, sub.P256DH, sub.Auth);
                    await _client.SendNotificationAsync(pushSub, payload, new VapidDetails(_options.Subject, _options.PublicKey, _options.PrivateKey));
                }
                catch
                {
                    // ignore errors sending individual notifications
                }
            }
        }
    }

    public class VapidOptions
    {
        public string Subject { get; set; } = string.Empty;
        public string PublicKey { get; set; } = string.Empty;
        public string PrivateKey { get; set; } = string.Empty;
    }
}
