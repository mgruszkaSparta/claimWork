using Microsoft.AspNetCore.Mvc;
using AutomotiveClaimsApi.Services;
using AutomotiveClaimsApi.DTOs;
using Microsoft.AspNetCore.Http;

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

        [HttpGet("claim/{claimNumber}")]
        public async Task<ActionResult<IEnumerable<EmailDto>>> GetEmailsByClaimNumber(string claimNumber)
        {
            var emails = await _emailService.GetEmailsByClaimNumberAsync(claimNumber);
            return Ok(emails);
        }

        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<EmailDto>>> GetEmailsByEventId(Guid eventId)
        {
            var emails = await _emailService.GetEmailsByEventIdAsync(eventId);
            return Ok(emails);
        }

        [HttpPost]
        public async Task<ActionResult<EmailDto>> SendEmail([FromForm] SendEmailDto sendEmailDto)
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
        public async Task<ActionResult<EmailDto>> CreateDraft([FromForm] CreateEmailDto createEmailDto)
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

        [HttpPost("process-pending")]
        public async Task<IActionResult> ProcessPendingEmails()
        {
            var count = await _emailService.ProcessPendingEmailsAsync();
            return Ok(new { processed = count });
        }

        [HttpPost("assign-to-claim")]
        public async Task<IActionResult> AssignToClaim(AssignEmailToClaimDto dto)
        {
            var success = await _emailService.AssignEmailToClaimAsync(dto.EmailId, dto.ClaimIds);
            if (!success)
                return NotFound();
            return NoContent();
        }

        [HttpPost("{emailId}/attachments")]
        public async Task<ActionResult<EmailAttachmentDto>> UploadAttachment(Guid emailId, [FromForm] IFormFile file)
        {
            var attachment = await _emailService.UploadAttachmentAsync(emailId, file);
            return CreatedAtAction(nameof(GetEmail), new { id = emailId }, attachment);
        }

        [HttpGet("attachment/{id}")]
        public async Task<IActionResult> DownloadAttachment(Guid id)
        {
            var attachment = await _emailService.GetAttachmentByIdAsync(id);
            if (attachment == null) return NotFound();
            var stream = await _emailService.DownloadAttachmentAsync(id);
            if (stream == null) return NotFound();
            return File(stream, attachment.ContentType, attachment.FileName);
        }

        [HttpDelete("attachment/{id}")]
        public async Task<IActionResult> DeleteAttachment(Guid id)
        {
            var success = await _emailService.DeleteAttachmentAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
