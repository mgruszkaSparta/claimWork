using System.Collections.Concurrent;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IPushSubscriptionStore
    {
        void Add(PushSubscriptionDto subscription);
        IEnumerable<PushSubscriptionDto> GetAll(string? userId = null);
    }

    public class InMemoryPushSubscriptionStore : IPushSubscriptionStore
    {
        private readonly ConcurrentDictionary<string, PushSubscriptionDto> _subscriptions = new();

        public void Add(PushSubscriptionDto subscription)
        {
            if (string.IsNullOrEmpty(subscription.Endpoint)) return;
            _subscriptions[subscription.Endpoint] = subscription;
        }

        public IEnumerable<PushSubscriptionDto> GetAll(string? userId = null)
        {
            return _subscriptions.Values.Where(s => userId == null || s.UserId == null || s.UserId == userId);
        }
    }
}
