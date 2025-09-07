using EmailService;
using EmailService.Data;
using EmailService.Storage;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var builder = Host.CreateApplicationBuilder(args);

var dbProvider = builder.Configuration.GetValue<string>("DatabaseProvider")?.ToLowerInvariant();
builder.Services.AddDbContext<EmailDbContext>(options =>
{
    if (dbProvider == "postgres" || dbProvider == "postgresql")
    {
        options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection"));
    }
    else
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});

builder.Services.AddSingleton<IAttachmentStorage>(_ =>
{
    var gcsCfg = builder.Configuration.GetSection("GoogleCloudStorage");
    var enabled = gcsCfg.GetValue<bool>("Enabled");
    var bucket = gcsCfg["BucketName"];
    if (enabled && !string.IsNullOrEmpty(bucket))
    {
        var credentialsPath = gcsCfg["CredentialsPath"];
        StorageClient client;
        if (!string.IsNullOrEmpty(credentialsPath))
        {
            var credential = GoogleCredential.FromFile(credentialsPath);
            client = StorageClient.Create(credential);
        }
        else
        {
            client = StorageClient.Create();
        }

        return new GoogleCloudAttachmentStorage(client, bucket);
    }

    return new LocalAttachmentStorage("attachments");
});

builder.Services.AddTransient<EmailClient>(sp =>
{
    var cfg = builder.Configuration.GetSection("Email");
    return new EmailClient(
        smtpHost: cfg["SmtpHost"] ?? string.Empty,
        smtpPort: cfg.GetValue<int?>("SmtpPort") ?? 0,
        imapHost: cfg["ImapHost"] ?? string.Empty,
        imapPort: cfg.GetValue<int?>("ImapPort") ?? 0,
        username: cfg["Username"] ?? string.Empty,
        password: cfg["Password"] ?? string.Empty,
        db: sp.GetRequiredService<EmailDbContext>(),
        storage: sp.GetRequiredService<IAttachmentStorage>()
    );
});

builder.Services.AddHostedService<EmailBackgroundService>();

using var host = builder.Build();

await host.RunAsync();

