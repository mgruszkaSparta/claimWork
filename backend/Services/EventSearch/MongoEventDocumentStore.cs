using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    public class MongoEventDocumentStore : IEventDocumentStore
    {
        private readonly IMongoCollection<EventDocument> _collection;

        public MongoEventDocumentStore(EventDocumentStoreOptions options)
        {
            var client = new MongoClient(options.ConnectionString);
            var database = client.GetDatabase(options.Database ?? "events");
            _collection = database.GetCollection<EventDocument>(options.Collection ?? "events");
        }

        public Task SaveAsync(Event @event, CancellationToken cancellationToken = default)
        {
            var doc = new EventDocument
            {
                Id = @event.Id,
                Content = EventSerializer.Serialize(@event)
            };

            var filter = Builders<EventDocument>.Filter.Eq(x => x.Id, doc.Id);
            return _collection.ReplaceOneAsync(filter, doc, new ReplaceOptions { IsUpsert = true }, cancellationToken);
        }

        public async Task<IReadOnlyCollection<Guid>> SearchAsync(string phrase, CancellationToken cancellationToken = default)
        {
            var filter = Builders<EventDocument>.Filter.Regex(x => x.Content, new BsonRegularExpression(phrase, "i"));
            var results = await _collection.Find(filter).Project(x => x.Id).ToListAsync(cancellationToken);
            return results;
        }
    }
}

