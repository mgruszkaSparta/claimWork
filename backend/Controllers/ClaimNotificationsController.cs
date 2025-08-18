using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClaimNotificationsController : ControllerBase
    {
        private readonly ClaimNotificationSettings _settings;

        public ClaimNotificationsController(ClaimNotificationSettings settings)
        {
            _settings = settings;
        }

        [HttpGet]
        public ActionResult<ClaimNotificationSettings> Get()
        {
            return _settings;
        }

        [HttpPut]
        public IActionResult Update([FromBody] ClaimNotificationSettings update)
        {
            _settings.Recipients = update.Recipients ?? new List<string>();
            _settings.Events = update.Events ?? new List<string>();
            return NoContent();
        }
    }
}
