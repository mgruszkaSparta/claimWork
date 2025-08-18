using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Models;
using Microsoft.Data.SqlClient;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    public class SqlServerEventDocumentStore : IEventDocumentStore
    {
        private readonly string _connectionString;
        private readonly string _table;

        public SqlServerEventDocumentStore(EventDocumentStoreOptions options)
        {
            _connectionString = options.ConnectionString ?? throw new ArgumentNullException(nameof(options.ConnectionString));
            _table = options.Table ?? "EventDocuments";
        }

        public async Task SaveAsync(Event @event, CancellationToken cancellationToken = default)
        {
            var json = EventSerializer.Serialize(@event);
            await using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(cancellationToken);
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = $@
"MERGE [" + _table + "] AS target USING (SELECT @id AS Id, @data AS Data) AS source " +
"ON target.Id = source.Id " +
"WHEN MATCHED THEN UPDATE SET Data = source.Data " +
"WHEN NOT MATCHED THEN INSERT (Id, Data) VALUES (source.Id, source.Data);";
            cmd.Parameters.AddWithValue("@id", @event.Id);
            cmd.Parameters.AddWithValue("@data", json);
            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }

        public async Task<IReadOnlyCollection<Guid>> SearchAsync(string phrase, CancellationToken cancellationToken = default)
        {
            var result = new List<Guid>();
            await using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(cancellationToken);
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = $"SELECT Id FROM [{_table}] WHERE Data LIKE @p";
            cmd.Parameters.AddWithValue("@p", $"%{phrase}%");
            await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                result.Add(reader.GetGuid(0));
            }
            return result;
        }
    }
}

