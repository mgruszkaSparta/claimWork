using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;

namespace AutomotiveClaimsApi.Services
{
    public class EmailProcessingService
    {
        private async Task<Guid?> ResolveEventIdFromEventNumberAsync(
            ApplicationDbContext dbContext, string eventNumber)
        {
            if (string.IsNullOrWhiteSpace(eventNumber))
                return null;

            var evt = await dbContext.Events
                .AsNoTracking()
                .Where(e =>
                    e.ClaimNumber == eventNumber ||
                    e.InsurerClaimNumber == eventNumber)
                .Select(e => e.Id)
                .FirstOrDefaultAsync();

            return evt == Guid.Empty ? (Guid?)null : evt;
        }
    }
}
