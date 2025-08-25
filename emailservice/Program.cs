using EmailService;
using EmailService.Data;
using EmailService.Storage;
using Google.Cloud.Storage.V1;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<EmailDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<IAttachmentStorage>(_ =>
    builder.Configuration["Storage:Bucket"] is { Length: > 0 } bucket
        ? new GoogleCloudAttachmentStorage(StorageClient.Create(), bucket)
        : new LocalAttachmentStorage("attachments"));

builder.Services.AddTransient<EmailClient>(sp =>
{
    var cfg = builder.Configuration.GetSection("Email");
    return new EmailClient(
        smtpHost: cfg["SmtpHost"]!,
        smtpPort: cfg.GetValue<int>("SmtpPort"),
        imapHost: cfg["ImapHost"]!,
        imapPort: cfg.GetValue<int>("ImapPort"),
        username: cfg["Username"]!,
        password: cfg["Password"]!,
        db: sp.GetRequiredService<EmailDbContext>(),
        storage: sp.GetRequiredService<IAttachmentStorage>()
    );
});

builder.Services.AddHostedService<EmailBackgroundService>();

using var host = builder.Build();

await host.RunAsync();

