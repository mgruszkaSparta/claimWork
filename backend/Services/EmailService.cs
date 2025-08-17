using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Common;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AutomotiveClaimsApi.Services
{
    public class EmailService : IEmailService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EmailService> _logger;
        private readonly IGoogleCloudStorageService _cloudStorageService;

        public EmailService(
            ApplicationDbContext context,
            ILogger<EmailService> logger,
            IGoogleCloudStorageService cloudStorageService)
        {
            _context = context;
            _logger = logger;
            _cloudStorageService = cloudStorageService;
        }

        public async Task<EmailDto> CreateEmailAsync(CreateEmailDto createEmailDto)
        {
            try
            {
                var email = new Email
                {
                    Id = Guid.NewGuid(),
                    EventId = createEmailDto.EventId,
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

                if (createEmailDto.Attachments != null)
                {
                    foreach (var file in createEmailDto.Attachments)
                    {
                        var cloudUrl = await _cloudStorageService.UploadFileAsync(file.OpenReadStream(), file.FileName, file.ContentType);
                        email.Attachments.Add(new EmailAttachment
                        {
                            Id = Guid.NewGuid(),
                            EmailId = email.Id,
                            FileName = file.FileName,
                            ContentType = file.ContentType,
                            FileSize = file.Length,
                            CloudUrl = cloudUrl,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }

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

                await _context.SaveChangesAsync();

                return MapEmailToDto(email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating email");
                throw;
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

        public async Task<EmailDto> QueueEmailAsync(SendEmailDto sendEmailDto)
        {
            try
            {
                var email = new Email
                {
                    Id = Guid.NewGuid(),
                    Subject = sendEmailDto.Subject,
                    Body = sendEmailDto.Body,
                    BodyHtml = sendEmailDto.IsHtml ? sendEmailDto.Body : null,
                    From = (await _context.SmtpSettings.AsNoTracking().FirstOrDefaultAsync())?.FromEmail ?? string.Empty,
                    To = sendEmailDto.To,
                    Cc = sendEmailDto.Cc,
                    Bcc = sendEmailDto.Bcc,
                    IsHtml = sendEmailDto.IsHtml,
                    EventId = sendEmailDto.EventId,
                    ClaimNumber = sendEmailDto.ClaimNumber,
                    Direction = "Outbound",
                    Status = "Pending",
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
                    if (!email.EventId.HasValue)
                        email.EventId = claim.EventId;
                }

                if (sendEmailDto.Attachments != null)
                {
                    foreach (var file in sendEmailDto.Attachments)
                    {
                        var cloudUrl = await _cloudStorageService.UploadFileAsync(file.OpenReadStream(), file.FileName, file.ContentType);
                        email.Attachments.Add(new EmailAttachment
                        {
                            Id = Guid.NewGuid(),
                            EmailId = email.Id,
                            FileName = file.FileName,
                            ContentType = file.ContentType,
                            FileSize = file.Length,
                            CloudUrl = cloudUrl,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }

                _context.Emails.Add(email);
                await _context.SaveChangesAsync();

                return MapEmailToDto(email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error queueing email");
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

        public async Task<IEnumerable<EmailDto>> GetUnassignedEmailsAsync()
        {
            var emails = await _context.Emails
                .Where(e => e.EventId == null || e.Status == "Unassigned")
                .Include(e => e.EmailClaims)
                .Select(e => MapEmailToDto(e))
                .ToListAsync();

            return emails;
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
    }
}
