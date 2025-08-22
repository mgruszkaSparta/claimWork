using System;
using AutomotiveClaimsApi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        [HttpGet("settings")]
        public ActionResult<AdminSettingsDto> GetSettings()
        {
            var settings = new AdminSettingsDto();
            return Ok(settings);
        }
    }
}
