using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    public static class EventDocumentStoreServiceCollectionExtensions
    {
        public static IServiceCollection AddEventDocumentStore(this IServiceCollection services, IConfiguration configuration)
        {
            var options = configuration.GetSection("EventDocumentStore").Get<EventDocumentStoreOptions>();
            if (options == null || options.Provider == DocumentStoreProvider.None)
            {
                return services;
            }

            services.AddSingleton(options);

            switch (options.Provider)
            {
                case DocumentStoreProvider.MongoDb:
                    services.AddSingleton<IEventDocumentStore, MongoEventDocumentStore>();
                    break;
                case DocumentStoreProvider.Postgres:
                    services.AddSingleton<IEventDocumentStore, PostgresEventDocumentStore>();
                    break;
                case DocumentStoreProvider.SqlServer:
                    services.AddSingleton<IEventDocumentStore, SqlServerEventDocumentStore>();
                    break;
            }

            return services;
        }
    }
}

