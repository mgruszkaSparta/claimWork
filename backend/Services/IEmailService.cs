using AutomotiveClaimsApi.DTOs;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace AutomotiveClaimsApi.Services
{
    public interface IEmailService
    {
        Task<IEnumerable<EmailDto>> GetEmailsAsync();
        Task<EmailDto?> GetEmailByIdAsync(Guid id);
        Task<IEnumerable<EmailDto>> GetEmailsByClaimNumberAsync(string claimNumber);
        Task<IEnumerable<EmailDto>> GetEmailsByEventIdAsync(Guid eventId, string folder);
        Task<EmailDto> SendEmailAsync(SendEmailDto sendEmailDto);
        Task<EmailDto> CreateDraftAsync(CreateEmailDto createEmailDto);
        Task<bool> MarkAsReadAsync(Guid id);
        Task<bool> ToggleImportantAsync(Guid id);
        Task<bool> ToggleStarredAsync(Guid id);
        Task<bool> DeleteEmailAsync(Guid id);
        Task FetchEmailsAsync();
        Task<int> ProcessPendingEmailsAsync();
        Task<bool> AssignEmailToClaimAsync(Guid emailId, IEnumerable<Guid> claimIds);
        Task<EmailAttachmentDto> UploadAttachmentAsync(Guid emailId, IFormFile file);
        Task<EmailAttachmentDto?> GetAttachmentByIdAsync(Guid id);
        Task<Stream?> DownloadAttachmentAsync(Guid id);
        Task<bool> DeleteAttachmentAsync(Guid id);
        Guid? ExtractEventId(string message);
    }
}
