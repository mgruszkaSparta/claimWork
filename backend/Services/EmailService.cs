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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.IO;
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
        private readonly string _attachmentsPath;
        private readonly IConfiguration _config;
        private readonly IGoogleCloudStorageService? _cloudStorage;
        private readonly bool _cloudEnabled;

        public EmailService(
            ApplicationDbContext context,
            IOptions<SmtpSettings> smtpSettings,
            ILogger<EmailService> logger,
            IWebHostEnvironment environment,
            IConfiguration config,
            IGoogleCloudStorageService? cloudStorage = null,
            IOptions<GoogleCloudStorageSettings>? cloudSettings = null)
        {
            _context = context;
            _smtpSettings = smtpSettings.Value;
            _logger = logger;
            _attachmentsPath = Path.Combine(environment.ContentRootPath, "uploads", "email");
            if (!Directory.Exists(_attachmentsPath))
            {
                Directory.CreateDirectory(_attachmentsPath);
            }
            _config = config;
            _cloudStorage = cloudStorage;
            _cloudEnabled = cloudSettings?.Value.Enabled ?? false;
        }

        public async Task<EmailDto> CreateEmailAsync(CreateEmailDto createEmailDto)
        {
            try
            {
                var email = new Email
                {
                    Id = Guid.NewGuid(),
                    Subject = createEmailDto.Subject ?? string.Empty,
                    Body = createEmailDto.Body ?? string.Empty,
                    From = createEmailDto.From ?? _smtpSettings.FromEmail,
                    To = createEmailDto.To ?? string.Empty,
                    Cc = createEmailDto.Cc,
                    Bcc = createEmailDto.Bcc,
                    Priority = createEmailDto.Priority,
                    IsHtml = createEmailDto.IsHtml,
                    Status = "Draft",
                    NeedsSending = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                if (createEmailDto.EventId.HasValue)
                {
                    var evt = await _context.Events.FindAsync(createEmailDto.EventId.Value);
                    if (evt != null)
                    {
                        email.EventId = evt.Id;
                        email.Event = evt;
                    }
                }

                _context.Emails.Add(email);

                if (createEmailDto.ClaimIds != null)
                {
                    foreach (var claimIdStr in createEmailDto.ClaimIds)
                    {
                        if (Guid.TryParse(claimIdStr, out var claimId))
                        {
                            var claim = await _context.ClientClaims.FindAsync(claimId);
                            if (claim != null)
                            {
                                var emailClaim = new EmailClaim
                                {
                                    EmailId = email.Id,
                                    Email = email,
                                    ClaimId = claim.Id,
                                    Claim = claim
                                };
                                email.EmailClaims.Add(emailClaim);
                            }
                        }
                    }
                }

                if (createEmailDto.Attachments != null)
                {
                    foreach (var file in createEmailDto.Attachments)
                    {
                        var attachment = await SaveAttachmentAsync(file, email.Id);
                        email.Attachments.Add(attachment);
                    }
                }

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

            email.NeedsSending = true;
            email.Direction = "Outbound";
            email.Status = "Pending";
            email.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<EmailDto>> GetEmailsByEventIdAsync(Guid eventId, string? folder = null)
        {
            // Start with a basic IQueryable to avoid keeping the more specific
            // IIncludableQueryable that `Include` returns.  Reassigning an
            // IIncludableQueryable after additional `Where` calls can lead to
            // invalid cast exceptions at runtime when EF Core attempts to cast
            // the simplified query back to the includable version.  By keeping
            // the variable typed as `IQueryable<Email>` we can safely add
            // filters conditionally without triggering these casts.
            IQueryable<Email> query = _context.Emails
                .Where(e => e.EventId == eventId);

            query = query
                .Include(e => e.EmailClaims)
                .Include(e => e.Attachments);

            if (!string.IsNullOrWhiteSpace(folder))
            {
                switch (folder.ToLowerInvariant())
                {
                    case "inbox":
                        query = query.Where(e => e.Direction == "Inbound");
                        break;
                    case "sent":
                        query = query.Where(e => e.Direction == "Outbound");
                        break;
                    case "drafts":
                        query = query.Where(e => e.Status == "Draft");
                        break;
                    case "important":
                        query = query.Where(e => e.IsImportant);
                        break;
                    case "unassigned":
                        query = query.Where(e => !e.EmailClaims.Any());
                        break;
                }
            }

            var emails = await query
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return emails.Select(MapEmailToDto);
        }

        public async Task<EmailDto?> GetEmailByIdAsync(Guid id)
        {
            var email = await _context.Emails
                .Where(e => e.Id == id)
                .Include(e => e.EmailClaims)
                .Include(e => e.Attachments)
                .FirstOrDefaultAsync();

            return email != null ? MapEmailToDto(email) : null;
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
                NeedsSending = email.NeedsSending,
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

        private async Task<EmailAttachment> SaveAttachmentAsync(IFormFile file, Guid emailId)
        {
            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(_attachmentsPath, uniqueFileName);
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string? cloudUrl = null;
            if (_cloudEnabled && _cloudStorage != null)
            {
                await using var uploadStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
                cloudUrl = await _cloudStorage.UploadFileAsync(uploadStream, uniqueFileName, file.ContentType);
            }

            var relativePath = Path.Combine("uploads", "email", uniqueFileName).Replace("\\", "/");

            return new EmailAttachment
            {
                Id = Guid.NewGuid(),
                EmailId = emailId,
                FileName = file.FileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                FilePath = relativePath,
                CloudUrl = cloudUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

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
                    ClaimNumber = sendEmailDto.ClaimNumber,
                    Direction = "Outbound",
                    Status = "Pending",
                    NeedsSending = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                if (sendEmailDto.EventId.HasValue)
                {
                    var evt = await _context.Events.FindAsync(sendEmailDto.EventId.Value);
                    if (evt != null)
                    {
                        email.EventId = evt.Id;
                        email.Event = evt;
                    }
                }

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

                if (sendEmailDto.Attachments != null)
                {
                    foreach (var file in sendEmailDto.Attachments)
                    {
                        var attachment = await SaveAttachmentAsync(file, email.Id);
                        email.Attachments.Add(attachment);
                    }
                    await _context.SaveChangesAsync();
                }

                return MapEmailToDto(email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email");
                throw;
            }
        }

        public async Task<int> ProcessPendingEmailsAsync()
        {
            var pendingEmails = await _context.Emails
                .Where(e => e.NeedsSending)
                .Include(e => e.Attachments)
                .ToListAsync();

            int processed = 0;
            foreach (var email in pendingEmails)
            {
                try
                {
                    var message = await BuildMimeMessageAsync(email);

                    using var client = new SmtpClient();
                    await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);

                    email.NeedsSending = false;
                    email.Status = "Sent";
                    email.SentAt = DateTime.UtcNow;
                    email.UpdatedAt = DateTime.UtcNow;
                }
                catch (Exception ex)
                {
                    email.Status = "Failed";
                    email.ErrorMessage = ex.Message;
                    email.UpdatedAt = DateTime.UtcNow;
                    _logger.LogError(ex, "Error sending queued email {EmailId}", email.Id);
                }

                processed++;
            }

            await _context.SaveChangesAsync();
            return processed;
        }

        private async Task<MimeMessage> BuildMimeMessageAsync(Email email)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
            message.To.AddRange(email.To.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));
            if (!string.IsNullOrWhiteSpace(email.Cc))
                message.Cc.AddRange(email.Cc.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));
            if (!string.IsNullOrWhiteSpace(email.Bcc))
                message.Bcc.AddRange(email.Bcc.Split(';').Select(e => MailboxAddress.Parse(e.Trim())));

            message.Subject = email.Subject;

            var bodyBuilder = new BodyBuilder();
            if (email.IsHtml)
                bodyBuilder.HtmlBody = email.BodyHtml ?? email.Body;
            else
                bodyBuilder.TextBody = email.Body;

            foreach (var attachment in email.Attachments)
            {
                if (!string.IsNullOrEmpty(attachment.FilePath))
                {
                    var fullPath = Path.Combine(_attachmentsPath, Path.GetFileName(attachment.FilePath));
                    if (File.Exists(fullPath))
                    {
                        bodyBuilder.Attachments.Add(fullPath);
                        continue;
                    }
                }

                if (_cloudEnabled && _cloudStorage != null && !string.IsNullOrEmpty(attachment.CloudUrl))
                {
                    try
                    {
                        var stream = await _cloudStorage.GetFileStreamAsync(attachment.CloudUrl);
                        var fileName = attachment.FileName ?? Path.GetFileName(attachment.CloudUrl);
                        var contentType = attachment.ContentType ?? "application/octet-stream";
                        bodyBuilder.Attachments.Add(fileName, stream, ContentType.Parse(contentType));
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to load attachment from cloud storage {Url}", attachment.CloudUrl);
                    }
                }
            }

            message.Body = bodyBuilder.ToMessageBody();
            return message;
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
            var email = await _context.Emails
                .Include(e => e.EmailClaims)
                .FirstOrDefaultAsync(e => e.Id == emailId);
            if (email == null) return false;

            foreach (var claimId in claimIds)
            {
                var claim = await _context.ClientClaims
                    .FirstOrDefaultAsync(c => c.Id == claimId);
                if (claim == null)
                {
                    continue;
                }

                if (!email.EmailClaims.Any(ec => ec.ClaimId == claimId))
                {
                    email.EmailClaims.Add(new EmailClaim
                    {
                        EmailId = emailId,
                        ClaimId = claimId
                    });
                }

                // Always associate the email with the event of the claim
                // so it moves out of the unassigned folder and into "Odebrane".
                // This also ensures that subsequent reassignments update the
                // event reference.
                email.EventId = claim.EventId;
            }

            // Mark the email as received once it's linked to a claim
            if (email.Status != "Received")
            {
                email.Status = "Received";
            }

            if (!email.ReceivedAt.HasValue)
            {
                email.ReceivedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<EmailAttachmentDto> UploadAttachmentAsync(Guid emailId, IFormFile file)
        {
            var email = await _context.Emails.FindAsync(emailId);
            if (email == null) throw new ArgumentException("Email not found", nameof(emailId));

            var attachment = await SaveAttachmentAsync(file, emailId);
            email.Attachments.Add(attachment);
            await _context.SaveChangesAsync();
            return new EmailAttachmentDto
            {
                Id = attachment.Id,
                EmailId = attachment.EmailId,
                FileName = attachment.FileName ?? string.Empty,
                ContentType = attachment.ContentType ?? string.Empty,
                FileSize = attachment.FileSize,
                FilePath = attachment.FilePath ?? string.Empty,
                CreatedAt = attachment.CreatedAt,
            };
        }

        public async Task<EmailAttachmentDto?> GetAttachmentByIdAsync(Guid id)
        {
            var attachment = await _context.EmailAttachments.FindAsync(id);
            if (attachment == null) return null;
            return new EmailAttachmentDto
            {
                Id = attachment.Id,
                EmailId = attachment.EmailId,
                FileName = attachment.FileName ?? string.Empty,
                ContentType = attachment.ContentType ?? string.Empty,
                FileSize = attachment.FileSize,
                FilePath = attachment.FilePath ?? string.Empty,
                CreatedAt = attachment.CreatedAt,
            };
        }

        public async Task<Stream?> DownloadAttachmentAsync(Guid id)
        {
            var attachment = await _context.EmailAttachments.FindAsync(id);
            if (attachment == null) return null;

            if (!string.IsNullOrEmpty(attachment.FilePath))
            {
                var fullPath = Path.Combine(_attachmentsPath, Path.GetFileName(attachment.FilePath));
                if (File.Exists(fullPath))
                {
                    return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
                }
            }

            if (_cloudEnabled && _cloudStorage != null && !string.IsNullOrEmpty(attachment.CloudUrl))
            {
                return await _cloudStorage.GetFileStreamAsync(attachment.CloudUrl);
            }

            return null;
        }

        public async Task<bool> DeleteAttachmentAsync(Guid id)
        {
            var attachment = await _context.EmailAttachments.FindAsync(id);
            if (attachment == null) return false;

            if (!string.IsNullOrEmpty(attachment.FilePath))
            {
                var fullPath = Path.Combine(_attachmentsPath, Path.GetFileName(attachment.FilePath));
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }

            if (_cloudEnabled && _cloudStorage != null && !string.IsNullOrEmpty(attachment.CloudUrl))
            {
                await _cloudStorage.DeleteFileAsync(attachment.CloudUrl);
            }

            _context.EmailAttachments.Remove(attachment);
            await _context.SaveChangesAsync();
            return true;
        }

        public Guid? ExtractEventId(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return null;

            var match = Regex.Match(message, @"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b");
            return match.Success && Guid.TryParse(match.Value, out var guid) ? guid : (Guid?)null;
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
                NeedsSending = false,
                MessageId = message.MessageId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var eventId = ExtractEventId(message.Subject + " " + (message.TextBody ?? string.Empty));
            if (eventId.HasValue)
            {
                var evt = await _context.Events.FindAsync(eventId.Value);
                if (evt != null)
                {
                    email.EventId = evt.Id;
                    email.Event = evt;
                }
            }

            foreach (var attachment in message.Attachments)
            {
                if (attachment is MimePart part)
                {
                    var fileName = part.FileName ?? Guid.NewGuid().ToString();
                    var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
                    var fullPath = Path.Combine(_attachmentsPath, uniqueFileName);
                    await using (var fs = new FileStream(fullPath, FileMode.Create))
                    {
                        await part.Content.DecodeToAsync(fs);
                    }

                    var attachmentEntity = new EmailAttachment
                    {
                        Id = Guid.NewGuid(),
                        EmailId = email.Id,
                        FileName = fileName,
                        ContentType = part.ContentType.MimeType,
                        FileSize = new FileInfo(fullPath).Length,
                        FilePath = Path.Combine("uploads", "email", uniqueFileName).Replace("\\", "/"),
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
