using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using EmailService.Storage;

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
    private readonly ApplicationDbContext _db;
    private readonly IAttachmentStorage _storage;

    public EmailClient(
        string smtpHost,
        int smtpPort,
        string imapHost,
        int imapPort,
        string username,
        string password,
        ApplicationDbContext db,
        IAttachmentStorage storage)
    {
        _smtpHost = smtpHost;
        _smtpPort = smtpPort;
        _imapHost = imapHost;
        _imapPort = imapPort;
        _username = username;
        _password = password;
        _db = db;
        _storage = storage;
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
    /// Fetches unread e-mails, saves them using existing Email entities and marks them as read.
    /// </summary>
    public async Task<IList<Email>> FetchUnreadEmailsAsync()
    {
        using var client = new ImapClient();
        await client.ConnectAsync(_imapHost, _imapPort, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(_username, _password);
        await client.Inbox.OpenAsync(FolderAccess.ReadWrite);

        var uids = await client.Inbox.SearchAsync(MailKit.Search.SearchQuery.NotSeen);
        var emails = new List<Email>();
        foreach (var uid in uids)
        {
            var message = await client.Inbox.GetMessageAsync(uid);
            var emailEntity = new Email
            {
                Subject = message.Subject ?? string.Empty,
                Body = message.TextBody ?? string.Empty,
                BodyHtml = message.HtmlBody,
                From = message.From.ToString(),
                To = string.Join(";", message.To.Select(r => r.ToString())),
                Cc = message.Cc?.Any() == true ? string.Join(";", message.Cc.Select(r => r.ToString())) : null,
                Bcc = message.Bcc?.Any() == true ? string.Join(";", message.Bcc.Select(r => r.ToString())) : null,
                IsHtml = !string.IsNullOrEmpty(message.HtmlBody),
                ReceivedAt = message.Date.UtcDateTime,
                Direction = "Inbound",
                Status = "Received",
                MessageId = message.MessageId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var eventNumber = ExtractEventNumber((message.Subject ?? string.Empty) + " " + (message.TextBody ?? string.Empty));
            emailEntity.EventId = await ResolveEventIdFromEventNumberAsync(eventNumber);

            foreach (var attachment in message.Attachments.OfType<MimePart>())
            {
                using var stream = new MemoryStream();
                await attachment.Content.DecodeToAsync(stream);
                var result = await _storage.SaveAsync(attachment.FileName ?? Guid.NewGuid().ToString(), attachment.ContentType.MimeType, stream);
                emailEntity.Attachments.Add(new EmailAttachment
                {
                    FileName = attachment.FileName,
                    ContentType = attachment.ContentType.MimeType,
                    FileSize = stream.Length,
                    FilePath = result.FilePath,
                    CloudUrl = result.CloudUrl,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            _db.Emails.Add(emailEntity);
            await _db.SaveChangesAsync();
            emails.Add(emailEntity);
            await client.Inbox.AddFlagsAsync(uid, MessageFlags.Seen, true);
        }

        await client.DisconnectAsync(true);
        return emails;
    }

    private static string? ExtractEventNumber(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            return null;

        var match = Regex.Match(message, @"\b\w{3}\d{7}\b");
        return match.Success ? match.Value : null;
    }

    private async Task<Guid?> ResolveEventIdFromEventNumberAsync(string? eventNumber)
    {
        if (string.IsNullOrWhiteSpace(eventNumber))
            return null;

        return await _db.Events
            .Where(e => e.ClaimNumber != null && e.ClaimNumber == eventNumber)
            .Select(e => (Guid?)e.Id)
            .FirstOrDefaultAsync();
    }
}
