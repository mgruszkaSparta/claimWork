using System.Security.Claims;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/push")]
    public class PushSubscriptionsController : ControllerBase
    {
        private readonly IPushSubscriptionStore _store;
        private readonly VapidOptions _vapid;

        public PushSubscriptionsController(IPushSubscriptionStore store, VapidOptions vapid)
        {
            _store = store;
            _vapid = vapid;
        }

        [HttpGet("public-key")]
        public ActionResult<object> GetPublicKey()
        {
            return Ok(new { key = _vapid.PublicKey });
        }

        [HttpPost("subscribe")]
        public IActionResult Subscribe([FromBody] PushSubscriptionDto subscription)
        {
            subscription.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _store.Add(subscription);
            return Ok();
        }
    }
}
