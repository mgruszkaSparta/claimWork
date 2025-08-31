using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IMobileNotificationStore
    {
        IEnumerable<MobileNotificationDto> GetAll();
        void Add(MobileNotificationDto notification);
        bool MarkAsRead(string id);
        void MarkAllAsRead(string? userId);
    }

    public class InMemoryMobileNotificationStore : IMobileNotificationStore
    {
        private readonly ConcurrentDictionary<string, MobileNotificationDto> _notifications = new();

        public InMemoryMobileNotificationStore()
        {
            var now = DateTime.UtcNow;
            Add(new MobileNotificationDto
            {
                Title = "Aktualizacja statusu",
                Message = "Szkoda SK-2024-001 przeszła do etapu realizacji naprawy",
                Type = "info",
                Timestamp = now.AddMinutes(-30),
                Read = false,
                ClaimId = "SK-2024-001",
                ActionType = "status_update",
                RecipientId = "user-1"
            });

            Add(new MobileNotificationDto
            {
                Title = "Nowa szkoda",
                Message = "Otrzymano nowe zgłoszenie szkody komunikacyjnej",
                Type = "success",
                Timestamp = now.AddHours(-2),
                Read = false,
                ActionType = "new_claim",
                RecipientId = "user-2"
            });
        }

        public IEnumerable<MobileNotificationDto> GetAll() =>
            _notifications.Values.OrderByDescending(n => n.Timestamp);

        public void Add(MobileNotificationDto notification)
        {
            if (string.IsNullOrEmpty(notification.Id))
            {
                notification.Id = Guid.NewGuid().ToString();
            }

            if (notification.Timestamp == default)
            {
                notification.Timestamp = DateTime.UtcNow;
            }

            _notifications[notification.Id] = notification;
        }

        public bool MarkAsRead(string id)
        {
            if (_notifications.TryGetValue(id, out var notification))
            {
                notification.Read = true;
                return true;
            }
            return false;
        }

        public void MarkAllAsRead(string? userId)
        {
            foreach (var notification in _notifications.Values)
            {
                if (userId == null || notification.RecipientId == null || notification.RecipientId == userId)
                {
                    notification.Read = true;
                }
            }
        }
    }
}

