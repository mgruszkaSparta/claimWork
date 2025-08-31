using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/mobile/notifications")]
    public class MobileNotificationsController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<MobileNotificationDto>> Get()
        {
            var notifications = new List<MobileNotificationDto>
            {
                new MobileNotificationDto
                {
                    Id = "1",
                    Title = "Aktualizacja statusu",
                    Message = "Szkoda SK-2024-001 przeszła do etapu realizacji naprawy",
                    Type = "info",
                    Timestamp = DateTime.UtcNow.AddMinutes(-30),
                    Read = false,
                    ClaimId = "SK-2024-001",
                    ActionType = "status_update",
                    RecipientId = "user-1"
                },
                new MobileNotificationDto
                {
                    Id = "2",
                    Title = "Nowa szkoda",
                    Message = "Otrzymano nowe zgłoszenie szkody komunikacyjnej",
                    Type = "success",
                    Timestamp = DateTime.UtcNow.AddHours(-2),
                    Read = false,
                    ActionType = "new_claim",
                    RecipientId = "user-2"
                },
                new MobileNotificationDto
                {
                    Id = "3",
                    Title = "Przypomnienie",
                    Message = "Szkoda SK-2024-002 oczekuje na Twoją reakcję",
                    Type = "warning",
                    Timestamp = DateTime.UtcNow.AddHours(-4),
                    Read = false,
                    ClaimId = "SK-2024-002",
                    ActionType = "reminder",
                    RecipientId = "user-1"
                },
                new MobileNotificationDto
                {
                    Id = "4",
                    Title = "Szkoda zakończona",
                    Message = "Pomyślnie zakończono realizację szkody SK-2024-004",
                    Type = "success",
                    Timestamp = DateTime.UtcNow.AddHours(-8),
                    Read = true,
                    ClaimId = "SK-2024-004",
                    ActionType = "status_update",
                    RecipientId = "user-1"
                },
                new MobileNotificationDto
                {
                    Id = "5",
                    Title = "Konserwacja systemu",
                    Message = "Planowana konserwacja systemu w niedzielę 15.09 od 2:00 do 6:00",
                    Type = "info",
                    Timestamp = DateTime.UtcNow.AddDays(-1),
                    Read = true,
                    ActionType = "system",
                    RecipientId = null
                }
            };

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
    }
}
