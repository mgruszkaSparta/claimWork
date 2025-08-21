# EmailService

A simple .NET 8 console project that provides a minimal client for sending and receiving e-mails using SMTP and IMAP via the MailKit library. Incoming messages are stored using the existing `Email` entities from the main application and attachments can be saved locally or in Google Cloud Storage.

Fetched messages are also inspected for claim numbers using the same mapping rules as the main project so related events can be linked automatically. Pending outgoing e-mails stored in the database with `NeedsSending` set are dispatched and marked as sent.

## Usage

Build the project:

```bash
dotnet build
```

Run the service passing connection and storage details:

```bash
dotnet run --project EmailService.csproj smtp.example.com 587 imap.example.com 993 user@example.com supersecret "Server=..." my-bucket
```

If a bucket name is omitted, attachments are saved under a local `attachments/` folder. The program fetches unread messages and sends any pending ones automatically.
