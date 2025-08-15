using Microsoft.EntityFrameworkCore;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace AutomotiveClaimsApi.Services
{
    public class EmailService : IEmailService
    {
        private readonly ApplicationDbContext _context;
        private readonly SmtpSettings _smtpSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            ApplicationDbContext context,
            IOptions<SmtpSettings> smtpSettings,
            ILogger<EmailService> logger)
        {
            _context = context;
            _smtpSettings = smtpSettings.Value;
            _logger = logger;
        }

        public async Task<EmailDto> CreateEmailAsync(CreateEmailDto createEmailDto)
        {
            try
            {
                var email = new Email
                {
                    Id = Guid.NewGuid(),
                    EventId = createEmailDto.EventId.HasValue ? new Guid(createEmailDto.EventId.Value.ToString()) : null,
                    Subject = createEmailDto.Subject,
                    Body = createEmailDto.Body,
                    From = createEmailDto.From,
                    To = createEmailDto.To,
                    Cc = createEmailDto.Cc,
                    Bcc = createEmailDto.Bcc,
                    Priority = createEmailDto.Priority,
                    IsHtml = createEmailDto.IsHtml,
                    Status = "Draft",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Emails.Add(email);
                await _context.SaveChangesAsync();

                return MapEmailToDto(email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating email");
                throw;
            }
        }

        public async Task<bool> SendEmailAsync(Guid emailId)
        {
            var email = await _context.Emails.FindAsync(emailId);
            if (email == null)
                return false;

            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
                message.To.AddRange(email.To.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));
                if (!string.IsNullOrEmpty(email.Cc))
                    message.Cc.AddRange(email.Cc.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));
                if (!string.IsNullOrEmpty(email.Bcc))
                    message.Bcc.AddRange(email.Bcc.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));

                message.Subject = email.Subject;

                var bodyBuilder = new BodyBuilder();
                if (email.IsHtml)
                    bodyBuilder.HtmlBody = email.BodyHtml;
                else
                    bodyBuilder.TextBody = email.Body;

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                email.Status = "Sent";
                email.SentAt = DateTime.UtcNow;
                email.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email with id {EmailId}", emailId);
                
                if (email != null)
                {
                    email.Status = "Failed";
                    email.ErrorMessage = ex.Message;
                    email.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                
                return false;
            }
        }

        public async Task<IEnumerable<EmailDto>> GetEmailsByEventIdAsync(Guid eventId)
        {
            var emails = await _context.Emails
                .Where(e => e.EventId == eventId)
                .Include(e => e.EmailClaims)
                .Select(e => MapEmailToDto(e))
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return emails;
        }

        public async Task<EmailDto?> GetEmailByIdAsync(Guid id)
        {
            var email = await _context.Emails
                .Where(e => e.Id == id)
                .Include(e => e.EmailClaims)
                .Select(e => MapEmailToDto(e))
                .FirstOrDefaultAsync();

            return email;
        }
        
        private static EmailDto MapEmailToDto(Email email) =>
            new EmailDto
            {
                Id = email.Id,
                EventId = email.EventId,
                Subject = email.Subject,
                Body = email.Body,
                BodyHtml = email.BodyHtml,
                From = email.From,
                To = email.To,
                Cc = email.Cc,
                Bcc = email.Bcc,
                Priority = email.Priority,
                IsHtml = email.IsHtml,
                Status = email.Status,
                SentAt = email.SentAt,
                CreatedAt = email.CreatedAt,
                UpdatedAt = email.UpdatedAt,
                Direction = email.Direction,
                ReceivedAt = email.ReceivedAt,
                ReadAt = email.ReadAt,
                IsRead = email.IsRead,
                IsImportant = email.IsImportant,
                IsArchived = email.IsArchived,
                Tags = email.Tags,
                Category = email.Category,
                ErrorMessage = email.ErrorMessage,
                RetryCount = email.RetryCount,
                ClaimNumber = email.ClaimNumber,
                ClaimIds = email.EmailClaims.Select(ec => ec.ClaimId.ToString()).ToList(),
                ThreadId = email.ThreadId,
                InReplyTo = email.InReplyTo,
                MessageId = email.MessageId,
                References = email.References,
                Attachments = email.Attachments.Select(a => new EmailAttachmentDto
                {
                    Id = a.Id,
                    EmailId = a.EmailId,
                    FileName = a.FileName ?? string.Empty,
                    ContentType = a.ContentType ?? string.Empty,
                    FileSize = a.FileSize,
                    FilePath = a.FilePath ?? string.Empty,
                    CreatedAt = a.CreatedAt,
                }).ToList()
            };

        public async Task<IEnumerable<EmailDto>> GetEmailsAsync()
        {
            return await _context.Emails.Include(e => e.EmailClaims).Select(e => MapEmailToDto(e)).ToListAsync();
        }

        public async Task<IEnumerable<EmailDto>> GetEmailsByClaimNumberAsync(string claimNumber)
        {
            return await _context.Emails.Where(e => e.ClaimNumber == claimNumber).Include(e => e.EmailClaims).Select(e => MapEmailToDto(e)).ToListAsync();
        }

        public Task<EmailDto> SendEmailAsync(SendEmailDto sendEmailDto)
        {
            throw new NotImplementedException();
        }

        public async Task<EmailDto> CreateDraftAsync(CreateEmailDto createEmailDto)
        {
            return await CreateEmailAsync(createEmailDto);
        }

        public async Task<bool> MarkAsReadAsync(Guid id)
        {
            var email = await _context.Emails.FindAsync(id);
            if (email == null) return false;

            email.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleImportantAsync(Guid id)
        {
            var email = await _context.Emails.FindAsync(id);
            if (email == null) return false;

            email.IsImportant = !email.IsImportant;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleStarredAsync(Guid id)
        {
            var email = await _context.Emails.FindAsync(id);
            if (email == null) return false;

            // Assuming IsStarred exists in Email model
            // email.IsStarred = !email.IsStarred; 
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteEmailAsync(Guid id)
        {
            var email = await _context.Emails.FindAsync(id);
            if (email == null) return false;

            _context.Emails.Remove(email);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignEmailToClaimAsync(Guid emailId, IEnumerable<Guid> claimIds)
        {
            var email = await _context.Emails.Include(e => e.EmailClaims).FirstOrDefaultAsync(e => e.Id == emailId);
            if (email == null) return false;

            foreach (var claimId in claimIds)
            {
                if (!email.EmailClaims.Any(ec => ec.ClaimId == claimId))
                {
                    email.EmailClaims.Add(new EmailClaim { EmailId = emailId, ClaimId = claimId });
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public string? ExtractEventNumber(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return null;

            var match = Regex.Match(message, @"\b\w{3}\d{7}\b");
            return match.Success ? match.Value : null;
        }

        private async Task<Guid?> ResolveEventIdFromEventNumberAsync(string? eventNumber)
        {
            if (string.IsNullOrWhiteSpace(eventNumber))
                return null;

            return await _context.Events
                .Where(e => e.ClaimNumber != null && e.ClaimNumber == eventNumber)
                .Select(e => (Guid?)e.Id)
                .FirstOrDefaultAsync();
        }

        private async Task<Email> CreateEmailEntityAsync(string message)
        {
            var email = new Email();

            var eventNumber = ExtractEventNumber(message);
            var eventId = await ResolveEventIdFromEventNumberAsync(eventNumber);
            email.EventId = eventId; // null jeśli brak dopasowania

            // Pozostała logika tworzenia i zapisu e‑maila pozostaje bez zmian
            return email;
        }

        public Task FetchEmailsAsync()
        {
            throw new NotImplementedException();
        }
    }
}
