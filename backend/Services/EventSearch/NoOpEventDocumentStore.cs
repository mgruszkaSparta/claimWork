using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    /// <summary>
    /// A no-op implementation of <see cref="IEventDocumentStore"/> used when
    /// no document store provider is configured. It simply ignores save
    /// requests and returns an empty result for searches.
    /// </summary>
    public class NoOpEventDocumentStore : IEventDocumentStore
    {
        public Task SaveAsync(Event @event, CancellationToken cancellationToken = default)
        {
            // Nothing to persist when the document store is not configured.
            return Task.CompletedTask;
        }

        public Task<IReadOnlyCollection<Guid>> SearchAsync(string phrase, CancellationToken cancellationToken = default)
        {
            // When there is no document store configured, searching should
            // simply return no results rather than throwing an exception.
            IReadOnlyCollection<Guid> empty = Array.Empty<Guid>();
            return Task.FromResult(empty);
        }
    }
}

