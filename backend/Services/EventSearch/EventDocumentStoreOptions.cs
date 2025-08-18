using System;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    public class EventDocumentStoreOptions
    {
        public DocumentStoreProvider Provider { get; set; } = DocumentStoreProvider.None;
        public string? ConnectionString { get; set; }
        public string? Database { get; set; }
        public string? Collection { get; set; }
        public string? Table { get; set; }
    }

    public enum DocumentStoreProvider
    {
        None,
        MongoDb,
        Postgres,
        SqlServer
    }
}

