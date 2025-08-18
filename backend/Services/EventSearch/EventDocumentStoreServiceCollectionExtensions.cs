using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    public static class EventDocumentStoreServiceCollectionExtensions
    {
        public static IServiceCollection AddEventDocumentStore(this IServiceCollection services, IConfiguration configuration)
        {
            var options = configuration.GetSection("EventDocumentStore").Get<EventDocumentStoreOptions>();

            // If no options or provider are configured, register a no-op
            // implementation so that controllers depending on
            // IEventDocumentStore do not fail to resolve.
            if (options == null || options.Provider == DocumentStoreProvider.None)
            {
                services.AddSingleton<IEventDocumentStore, NoOpEventDocumentStore>();
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
                default:
                    // Fallback to no-op implementation if provider is not recognised.
                    services.AddSingleton<IEventDocumentStore, NoOpEventDocumentStore>();
                    break;
            }

            return services;
        }
    }
}

