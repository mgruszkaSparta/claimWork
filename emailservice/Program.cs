using EmailService;

// Usage: EmailService <smtpHost> <smtpPort> <imapHost> <imapPort> <username> <password>
if (args.Length < 6)
{
    Console.WriteLine("Usage: EmailService <smtpHost> <smtpPort> <imapHost> <imapPort> <username> <password>");
    return;
}

var client = new EmailClient(
    smtpHost: args[0],
    smtpPort: int.Parse(args[1]),
    imapHost: args[2],
    imapPort: int.Parse(args[3]),
    username: args[4],
    password: args[5]
);

Console.WriteLine("EmailService ready. Implement custom logic to call SendEmailAsync or FetchUnreadEmailsAsync as needed.");
