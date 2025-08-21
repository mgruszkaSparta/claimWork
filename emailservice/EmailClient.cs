using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace EmailService;

/// <summary>
/// Simple client for sending and receiving e-mails using SMTP and IMAP.
/// </summary>
public class EmailClient
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _imapHost;
    private readonly int _imapPort;
    private readonly string _username;
    private readonly string _password;

    public EmailClient(string smtpHost, int smtpPort, string imapHost, int imapPort, string username, string password)
    {
        _smtpHost = smtpHost;
        _smtpPort = smtpPort;
        _imapHost = imapHost;
        _imapPort = imapPort;
        _username = username;
        _password = password;
    }

    /// <summary>
    /// Sends a plain text e-mail message.
    /// </summary>
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(_username));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_username, _password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    /// <summary>
    /// Fetches unread e-mails from the inbox and marks them as read.
    /// </summary>
    public async Task<IList<MimeMessage>> FetchUnreadEmailsAsync()
    {
        using var client = new ImapClient();
        await client.ConnectAsync(_imapHost, _imapPort, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(_username, _password);
        await client.Inbox.OpenAsync(FolderAccess.ReadWrite);

        var uids = await client.Inbox.SearchAsync(MailKit.Search.SearchQuery.NotSeen);
        var messages = new List<MimeMessage>();
        foreach (var uid in uids)
        {
            var message = await client.Inbox.GetMessageAsync(uid);
            messages.Add(message);
            await client.Inbox.AddFlagsAsync(uid, MessageFlags.Seen, true);
        }

        await client.DisconnectAsync(true);
        return messages;
    }
}
