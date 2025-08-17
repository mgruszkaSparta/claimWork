using System.Threading.Tasks;

namespace AutomotiveClaimsApi.Services
{
    public interface IEmailProcessingService
    {
        Task ProcessPendingEmailsAsync();
        Task FetchEmailsAsync();
    }
}
