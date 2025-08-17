using Microsoft.AspNetCore.Mvc;
using AutomotiveClaimsApi.Services;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailsController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IEmailProcessingService _processor;

        public EmailsController(IEmailService emailService, IEmailProcessingService processor)
        {
            _emailService = emailService;
            _processor = processor;
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

        [HttpGet("claim/{claimNumber}")]
        public async Task<ActionResult<IEnumerable<EmailDto>>> GetEmailsByClaimNumber(string claimNumber)
        {
            var emails = await _emailService.GetEmailsByClaimNumberAsync(claimNumber);
            return Ok(emails);
        }

        [HttpPost]
        public async Task<ActionResult<EmailDto>> SendEmail([FromForm] SendEmailDto sendEmailDto)
        {
            try
            {
                var email = await _emailService.QueueEmailAsync(sendEmailDto);
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

        [HttpGet("unassigned")]
        public async Task<ActionResult<IEnumerable<EmailDto>>> GetUnassigned()
        {
            var emails = await _emailService.GetUnassignedEmailsAsync();
            return Ok(emails);
        }

        [HttpPost("fetch")]
        public async Task<IActionResult> FetchEmails()
        {
            await _processor.FetchEmailsAsync();
            return Ok(new { message = "Emails fetched successfully" });
        }

        [HttpPost("assign-to-claim")]
        public async Task<IActionResult> AssignToClaim(AssignEmailToClaimDto dto)
        {
            var success = await _emailService.AssignEmailToClaimAsync(dto.EmailId, dto.ClaimIds);
            if (!success)
                return NotFound();
            return NoContent();
        }
    }
}
