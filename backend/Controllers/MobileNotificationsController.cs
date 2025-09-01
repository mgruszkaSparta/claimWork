using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/mobile/notifications")]
    public class MobileNotificationsController : ControllerBase
    {
        private readonly IMobileNotificationStore _store;
        private readonly IPushSubscriptionStore _pushStore;
        private readonly IPushNotificationService _pushService;

        public MobileNotificationsController(IMobileNotificationStore store, IPushSubscriptionStore pushStore, IPushNotificationService pushService)
        {
            _store = store;
            _pushStore = pushStore;
            _pushService = pushService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<MobileNotificationDto>> Get()
        {
            var notifications = _store.GetAll();
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (User.IsInRole("Admin") || User.IsInRole("ClaimHandler"))
            {
                return Ok(notifications);
            }

            if (string.IsNullOrEmpty(userId))
            {
                return Ok(Enumerable.Empty<MobileNotificationDto>());
            }

            var filtered = notifications.Where(n => n.RecipientId == null || n.RecipientId == userId);
            return Ok(filtered);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MobileNotificationDto notification)
        {
            _store.Add(notification);
            var subs = _pushStore.GetAll(notification.RecipientId);
            await _pushService.SendAsync(subs, notification.Title ?? "Notification", notification.Message ?? "");
            return CreatedAtAction(nameof(Get), new { id = notification.Id }, notification);
        }

        [HttpPost("{id}/read")]
        public IActionResult MarkAsRead(string id)
        {
            return _store.MarkAsRead(id) ? NoContent() : NotFound();
        }

        [HttpPost("read-all")]
        public IActionResult MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _store.MarkAllAsRead(userId);
            return NoContent();
        }
    }
}
