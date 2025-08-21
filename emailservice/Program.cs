using EmailService;

using EmailService.Storage;
using AutomotiveClaimsApi.Data;
using Google.Cloud.Storage.V1;
using Microsoft.EntityFrameworkCore;

// Usage: EmailService <smtpHost> <smtpPort> <imapHost> <imapPort> <username> <password> <connectionString> [gcsBucket]
if (args.Length < 7)
{
    Console.WriteLine("Usage: EmailService <smtpHost> <smtpPort> <imapHost> <imapPort> <username> <password> <connectionString> [gcsBucket]");
    return;
}

var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseSqlServer(args[6])
    .Options;
var db = new ApplicationDbContext(options);

IAttachmentStorage storage = args.Length > 7
    ? new GoogleCloudAttachmentStorage(StorageClient.Create(), args[7])
    : new LocalAttachmentStorage("attachments");


var client = new EmailClient(
    smtpHost: args[0],
    smtpPort: int.Parse(args[1]),
    imapHost: args[2],
    imapPort: int.Parse(args[3]),
    username: args[4],

    password: args[5],
    db: db,
    storage: storage
);
var fetched = await client.FetchUnreadEmailsAsync();
Console.WriteLine($"Fetched {fetched.Count} unread emails.");

var sent = await client.SendPendingEmailsAsync();
Console.WriteLine($"Sent {sent} pending emails.");

