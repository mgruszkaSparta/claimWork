using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    public interface IEventDocumentStore
    {
        Task SaveAsync(Event @event, CancellationToken cancellationToken = default);

        Task<IReadOnlyCollection<Guid>> SearchAsync(string phrase, CancellationToken cancellationToken = default);
    }
}

