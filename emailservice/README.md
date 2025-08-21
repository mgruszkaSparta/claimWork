# EmailService

A simple .NET 8 console project that provides a minimal client for sending and receiving e-mails using SMTP and IMAP via the MailKit library.

## Usage

Build the project:

```bash
dotnet build
```

Run the service passing connection details:

```bash
dotnet run --project EmailService.csproj smtp.example.com 587 imap.example.com 993 user@example.com supersecret
```

Then call `SendEmailAsync` or `FetchUnreadEmailsAsync` from your own code to send or retrieve messages.
