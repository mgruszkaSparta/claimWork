using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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

        public MobileNotificationsController(IMobileNotificationStore store)
        {
            _store = store;
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
        public IActionResult Create([FromBody] MobileNotificationDto notification)
        {
            _store.Add(notification);
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
