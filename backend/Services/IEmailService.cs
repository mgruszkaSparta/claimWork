using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IEmailService
    {
        Task<IEnumerable<EmailDto>> GetEmailsAsync();
        Task<EmailDto?> GetEmailByIdAsync(Guid id);
        Task<IEnumerable<EmailDto>> GetEmailsByClaimNumberAsync(string claimNumber);
        Task<EmailDto> SendEmailAsync(SendEmailDto sendEmailDto);
        Task<EmailDto> CreateDraftAsync(CreateEmailDto createEmailDto);
        Task<bool> MarkAsReadAsync(Guid id);
        Task<bool> ToggleImportantAsync(Guid id);
        Task<bool> ToggleStarredAsync(Guid id);
        Task<bool> DeleteEmailAsync(Guid id);
        Task FetchEmailsAsync();
    }
}
