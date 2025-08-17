using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Common;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Search;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace AutomotiveClaimsApi.Services
{
    public class EmailProcessingService : IEmailProcessingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EmailProcessingService> _logger;
        private readonly IGoogleCloudStorageService _cloudStorageService;

        public EmailProcessingService(
            ApplicationDbContext context,
            ILogger<EmailProcessingService> logger,
            IGoogleCloudStorageService cloudStorageService)
        {
            _context = context;
            _logger = logger;
            _cloudStorageService = cloudStorageService;
        }

        public async Task ProcessPendingEmailsAsync()
        {
            var pendingIds = await _context.Emails
                .Where(e => e.Status == "Pending")
                .Select(e => e.Id)
                .ToListAsync();

            foreach (var id in pendingIds)
            {
                await SendEmailAsync(id);
            }
        }

        private async Task<bool> SendEmailAsync(Guid emailId)
        {
            var email = await _context.Emails
                .Include(e => e.Attachments)
                .FirstOrDefaultAsync(e => e.Id == emailId);
            if (email == null)
                return false;

            try
            {
                var smtpSettings = await _context.SmtpSettings.AsNoTracking().FirstOrDefaultAsync();
                if (smtpSettings == null)
                    throw new InvalidOperationException("SMTP settings not configured");

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(smtpSettings.FromName, smtpSettings.FromEmail));
                message.To.AddRange(email.To.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));
                if (!string.IsNullOrEmpty(email.Cc))
                    message.Cc.AddRange(email.Cc.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));
                if (!string.IsNullOrEmpty(email.Bcc))
                    message.Bcc.AddRange(email.Bcc.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));

                message.Subject = email.Subject;

                var bodyBuilder = new BodyBuilder();
                if (email.IsHtml)
                    bodyBuilder.HtmlBody = email.BodyHtml ?? email.Body;
                else
                    bodyBuilder.TextBody = email.Body;

                foreach (var attachment in email.Attachments)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(attachment.CloudUrl))
                        {
                            var stream = await _cloudStorageService.GetFileStreamAsync(attachment.CloudUrl);
                            bodyBuilder.Attachments.Add(attachment.FileName ?? "attachment", stream);
                        }
                        else if (!string.IsNullOrEmpty(attachment.FilePath) && File.Exists(attachment.FilePath))
                        {
                            bodyBuilder.Attachments.Add(attachment.FileName ?? Path.GetFileName(attachment.FilePath), attachment.FilePath);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to load attachment {AttachmentId} for email {EmailId}", attachment.Id, email.Id);
                    }
                }

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(smtpSettings.Host, smtpSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(smtpSettings.Username, smtpSettings.Password);
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

                email.Status = "Failed";
                email.ErrorMessage = ex.Message;
                email.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return false;
            }
        }

        public async Task FetchEmailsAsync()
        {
            try
            {
                var smtpSettings = await _context.SmtpSettings.AsNoTracking().FirstOrDefaultAsync();
                if (smtpSettings == null)
                    throw new InvalidOperationException("SMTP settings not configured");

                using var client = new ImapClient();
                await client.ConnectAsync(smtpSettings.ImapServer, smtpSettings.ImapPort, SecureSocketOptions.SslOnConnect);
                await client.AuthenticateAsync(smtpSettings.Username, smtpSettings.Password);

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
            if (folder == EmailFolder.Inbox && eventId == null)
            {
                email.Status = "Unassigned";
            }

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

        private string? ExtractEventNumber(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return null;

            var match = Regex.Match(message, @"\\[(.*?)\\]");
            return match.Success ? match.Groups[1].Value : null;
        }

        private async Task<Guid?> ResolveEventIdFromEventNumberAsync(string? eventNumber)
        {
            if (string.IsNullOrWhiteSpace(eventNumber))
                return null;

            return await _context.Events
                .Where(e => e.ClaimNumber == eventNumber || e.SpartaNumber == eventNumber || e.InsurerClaimNumber == eventNumber)
                .Select(e => (Guid?)e.Id)
                .FirstOrDefaultAsync();
        }
    }
}
