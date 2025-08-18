using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Models;
using Npgsql;
using NpgsqlTypes;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    public class PostgresEventDocumentStore : IEventDocumentStore
    {
        private readonly string _connectionString;
        private readonly string _table;

        public PostgresEventDocumentStore(EventDocumentStoreOptions options)
        {
            _connectionString = options.ConnectionString ?? throw new ArgumentNullException(nameof(options.ConnectionString));
            _table = options.Table ?? "EventDocuments";
        }

        public async Task SaveAsync(Event @event, CancellationToken cancellationToken = default)
        {
            var json = EventSerializer.Serialize(@event);
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync(cancellationToken);
            await using var cmd = new NpgsqlCommand($@
                "INSERT INTO \"{_table}\" (\"Id\", \"Data\") VALUES (@id, @data) " +
                "ON CONFLICT (\"Id\") DO UPDATE SET \"Data\" = EXCLUDED.\"Data\";", conn);
            cmd.Parameters.AddWithValue("id", @event.Id);
            cmd.Parameters.AddWithValue("data", NpgsqlDbType.Jsonb, json);
            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }

        public async Task<IReadOnlyCollection<Guid>> SearchAsync(string phrase, CancellationToken cancellationToken = default)
        {
            var result = new List<Guid>();
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync(cancellationToken);
            await using var cmd = new NpgsqlCommand($@
                "SELECT \"Id\" FROM \"{_table}\" WHERE \"Data\"::text ILIKE @p;", conn);
            cmd.Parameters.AddWithValue("p", $"%{phrase}%");
            await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                result.Add(reader.GetGuid(0));
            }
            return result;
        }
    }
}

