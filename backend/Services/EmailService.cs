using Microsoft.EntityFrameworkCore;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MailKit.Net.Imap;
using MailKit;
using MailKit.Search;
using AutomotiveClaimsApi.Common;
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

        public async Task<EmailDto> SendEmailAsync(SendEmailDto sendEmailDto)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
                message.To.AddRange(sendEmailDto.To.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));

                if (!string.IsNullOrWhiteSpace(sendEmailDto.Cc))
                    message.Cc.AddRange(sendEmailDto.Cc.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));

                if (!string.IsNullOrWhiteSpace(sendEmailDto.Bcc))
                    message.Bcc.AddRange(sendEmailDto.Bcc.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));

                message.Subject = sendEmailDto.Subject;

                var bodyBuilder = new BodyBuilder();
                if (sendEmailDto.IsHtml)
                    bodyBuilder.HtmlBody = sendEmailDto.Body;
                else
                    bodyBuilder.TextBody = sendEmailDto.Body;

                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                var email = new Email
                {
                    Id = Guid.NewGuid(),
                    Subject = sendEmailDto.Subject,
                    Body = sendEmailDto.Body,
                    BodyHtml = sendEmailDto.IsHtml ? sendEmailDto.Body : null,
                    From = _smtpSettings.FromEmail,
                    To = sendEmailDto.To,
                    Cc = sendEmailDto.Cc,
                    Bcc = sendEmailDto.Bcc,
                    IsHtml = sendEmailDto.IsHtml,
                    EventId = sendEmailDto.EventId,
                    ClaimNumber = sendEmailDto.ClaimNumber,
                    Direction = "Outbound",
                    Status = "Sent",
                    SentAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                ClientClaim? claim = null;
                if (!string.IsNullOrWhiteSpace(sendEmailDto.ClaimId) && Guid.TryParse(sendEmailDto.ClaimId, out var claimGuid))
                {
                    claim = await _context.ClientClaims.FirstOrDefaultAsync(c => c.Id == claimGuid);
                }

                if (claim == null && !string.IsNullOrWhiteSpace(sendEmailDto.ClaimNumber))
                {
                    claim = await _context.ClientClaims.FirstOrDefaultAsync(c => c.ClaimNumber == sendEmailDto.ClaimNumber);
                }

                if (claim != null)
                {
                    email.EmailClaims.Add(new EmailClaim { EmailId = email.Id, ClaimId = claim.Id });
                    email.ClaimNumber ??= claim.ClaimNumber;
                }

                _context.Emails.Add(email);
                await _context.SaveChangesAsync();

                return MapEmailToDto(email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email");
                throw;
            }
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

        private async Task<bool> EmailExistsAsync(string messageId)
        {
            if (string.IsNullOrWhiteSpace(messageId))
                return false;

            return await _context.Emails.AnyAsync(e => e.MessageId == messageId);
        }

        private async Task<Email> CreateEmailEntityAsync(MimeMessage message, EmailFolder folder)
        {
            var email = new Email
            {
                Id = Guid.NewGuid(),
                Subject = message.Subject ?? string.Empty,
                Body = message.TextBody ?? string.Empty,
                BodyHtml = message.HtmlBody,
                From = message.From.ToString(),
                To = string.Join(";", message.To.Select(r => r.ToString())),
                Cc = message.Cc?.Any() == true ? string.Join(";", message.Cc.Select(r => r.ToString())) : null,
                Bcc = message.Bcc?.Any() == true ? string.Join(";", message.Bcc.Select(r => r.ToString())) : null,
                IsHtml = !string.IsNullOrEmpty(message.HtmlBody),
                ReceivedAt = message.Date.UtcDateTime,
                Direction = folder == EmailFolder.Inbox ? "Inbound" : "Outbound",
                Status = folder == EmailFolder.Inbox ? "Received" : "Sent",
                MessageId = message.MessageId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var eventNumber = ExtractEventNumber(message.Subject + " " + (message.TextBody ?? string.Empty));
            var eventId = await ResolveEventIdFromEventNumberAsync(eventNumber);
            email.EventId = eventId;

            foreach (var attachment in message.Attachments)
            {
                if (attachment is MimePart part)
                {
                    var attachmentEntity = new EmailAttachment
                    {
                        Id = Guid.NewGuid(),
                        EmailId = email.Id,
                        FileName = part.FileName,
                        ContentType = part.ContentType.MimeType,
                        FileSize = part.ContentDisposition?.Size ?? 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    email.Attachments.Add(attachmentEntity);
                }
            }

            return email;
        }

        private async Task ProcessFolderAsync(IMailFolder folder, EmailFolder folderEnum)
        {
            _logger.LogInformation("Processing {FolderName} folder...", folder.Name);

            var searchQuery = folderEnum == EmailFolder.Inbox
                ? SearchQuery.NotSeen
                : SearchQuery.SentAfter(DateTime.UtcNow.AddDays(-7));

            await folder.OpenAsync(folderEnum == EmailFolder.Inbox ? FolderAccess.ReadWrite : FolderAccess.ReadOnly);
            var uids = await folder.SearchAsync(searchQuery);

            if (uids.Count == 0)
            {
                await folder.CloseAsync();
                return;
            }

            const int batchSize = 20;
            int processedCount = 0;

            foreach (var uid in uids)
            {
                try
                {
                    var message = await folder.GetMessageAsync(uid);
                    if (!await EmailExistsAsync(message.MessageId))
                    {
                        var emailEntity = await CreateEmailEntityAsync(message, folderEnum);
                        await _context.Emails.AddAsync(emailEntity);
                    }

                    if (folderEnum == EmailFolder.Inbox)
                    {
                        folder.AddFlags(uid, MessageFlags.Seen, true);
                    }

                    processedCount++;
                    if (processedCount % batchSize == 0)
                    {
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Saved a batch of emails from {FolderName}.", folder.Name);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message UID {UID} from {FolderName}.", uid, folder.Name);
                }
            }

            await _context.SaveChangesAsync();
            await folder.CloseAsync();
        }

        public async Task FetchEmailsAsync()
        {
            try
            {
                using var client = new ImapClient();
                await client.ConnectAsync(_smtpSettings.ImapServer, _smtpSettings.ImapPort, SecureSocketOptions.SslOnConnect);
                await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);

                await ProcessFolderAsync(client.Inbox, EmailFolder.Inbox);
                var sentFolder = client.GetFolder(SpecialFolder.Sent);
                await ProcessFolderAsync(sentFolder, EmailFolder.Sent);

                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching emails");
                throw;
            }
        }
    }
}
