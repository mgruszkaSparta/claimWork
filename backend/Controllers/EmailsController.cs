using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using AutomotiveClaimsApi.Services;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailsController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailsController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmailDto>>> GetEmails()
        {
            var emails = await _emailService.GetEmailsAsync();
            return Ok(emails);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmailDto>> GetEmail(Guid id)
        {
            var email = await _emailService.GetEmailByIdAsync(id);
            if (email == null)
                return NotFound();

            return Ok(email);
        }

        [Authorize]
        [HttpGet("claim")]
        public async Task<ActionResult<IEnumerable<EmailDto>>> GetEmailsByClaim([FromQuery] string claimId, [FromQuery] string claimNumber)
        {
            if (!User.HasClaim("claim", claimId))
            {
                return Forbid();
            }

            var emails = await _emailService.GetEmailsByClaimAsync(claimId, claimNumber);
            return Ok(emails);
        }

        [HttpPost]
        public async Task<ActionResult<EmailDto>> SendEmail(SendEmailDto sendEmailDto)
        {
            try
            {
                var email = await _emailService.SendEmailAsync(sendEmailDto);
                return CreatedAtAction(nameof(GetEmail), new { id = email.Id }, email);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("draft")]
        public async Task<ActionResult<EmailDto>> CreateDraft(CreateEmailDto createEmailDto)
        {
            var email = await _emailService.CreateDraftAsync(createEmailDto);
            return CreatedAtAction(nameof(GetEmail), new { id = email.Id }, email);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var result = await _emailService.MarkAsReadAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPut("{id}/important")]
        public async Task<IActionResult> ToggleImportant(Guid id)
        {
            var result = await _emailService.ToggleImportantAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPut("{id}/starred")]
        public async Task<IActionResult> ToggleStarred(Guid id)
        {
            var result = await _emailService.ToggleStarredAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmail(Guid id)
        {
            var result = await _emailService.DeleteEmailAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("fetch")]
        public async Task<IActionResult> FetchEmails()
        {
            await _emailService.FetchEmailsAsync();
            return Ok(new { message = "Emails fetched successfully" });
        }
    }
}
