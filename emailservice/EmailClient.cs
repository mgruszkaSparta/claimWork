
using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Net.Http;
using Microsoft.EntityFrameworkCore;

using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

using EmailService.Data;
using EmailService.Models;
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
    private readonly EmailDbContext _db;
    private readonly IAttachmentStorage _storage;

    public EmailClient(
        string smtpHost,
        int smtpPort,
        string imapHost,
        int imapPort,
        string username,
        string password,
        EmailDbContext db,
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
        if (string.IsNullOrWhiteSpace(_imapHost) || _imapPort <= 0)
            return new List<Email>();

        using var client = new ImapClient();
        await client.ConnectAsync(_imapHost, _imapPort, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(_username, _password);
        await client.Inbox.OpenAsync(FolderAccess.ReadWrite);

        var uids = await client.Inbox.SearchAsync(MailKit.Search.SearchQuery.NotSeen);

        var emails = new List<Email>();
        foreach (var uid in uids)
        {
            var message = await client.Inbox.GetMessageAsync(uid);
            var baseEmail = new Email
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

            var attachmentData = new List<(string? FileName, string ContentType, long FileSize, string FilePath, string? CloudUrl)>();
            foreach (var attachment in message.Attachments.OfType<MimePart>())
            {
                using var stream = new MemoryStream();
                await attachment.Content.DecodeToAsync(stream);
                var result = await _storage.SaveAsync(attachment.FileName ?? Guid.NewGuid().ToString(), attachment.ContentType.MimeType, stream);
                attachmentData.Add((attachment.FileName, attachment.ContentType.MimeType, stream.Length, result.FilePath, result.CloudUrl));
            }

            var combined = (message.Subject ?? string.Empty) + " " + (message.TextBody ?? string.Empty);
            var targets = new List<Event?>();

            var eventId = ExtractEventId(combined);
            if (eventId.HasValue)
            {
                var evt = await _db.Events.FindAsync(eventId.Value);
                if (evt != null)
                    targets.Add(evt);
            }

            if (!targets.Any())
            {
                var spartaNumbers = ExtractSpartaNumbers(combined).Take(2);
                foreach (var sparta in spartaNumbers)
                {
                    var evt = await _db.Events.FirstOrDefaultAsync(e => e.SpartaNumber == sparta);
                    if (evt != null)
                        targets.Add(evt);
                }
            }

            if (!targets.Any())
                targets.Add(null);

            foreach (var evt in targets)
            {
                var emailEntity = new Email
                {
                    // Ensure the email has an ID so related documents can reference it
                    Id = Guid.NewGuid(),
                    Subject = baseEmail.Subject,
                    Body = baseEmail.Body,
                    BodyHtml = baseEmail.BodyHtml,
                    From = baseEmail.From,
                    To = baseEmail.To,
                    Cc = baseEmail.Cc,
                    Bcc = baseEmail.Bcc,
                    IsHtml = baseEmail.IsHtml,
                    ReceivedAt = baseEmail.ReceivedAt,
                    Direction = baseEmail.Direction,
                    Status = baseEmail.Status,
                    MessageId = baseEmail.MessageId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                if (evt != null)
                {
                    emailEntity.EventId = evt.Id;
                    emailEntity.Event = evt;
                }

                foreach (var data in attachmentData)
                {
                    emailEntity.Attachments.Add(new EmailAttachment
                    {
                        FileName = data.FileName,
                        ContentType = data.ContentType,
                        FileSize = data.FileSize,
                        FilePath = data.FilePath,
                        CloudUrl = data.CloudUrl,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });

                    _db.Documents.Add(new Document
                    {
                        Id = Guid.NewGuid(),
                        EventId = evt?.Id,
                        RelatedEntityId = emailEntity.Id,
                        RelatedEntityType = "Email",
                        FileName = Path.GetFileName(data.FilePath),
                        OriginalFileName = data.FileName,
                        FilePath = data.FilePath,
                        CloudUrl = data.CloudUrl,
                        FileSize = data.FileSize,
                        ContentType = data.ContentType,
                        DocumentType = "email",
                        UploadedBy = emailEntity.From,
                        Status = "ACTIVE",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                _db.Emails.Add(emailEntity);
                emails.Add(emailEntity);
            }

            await _db.SaveChangesAsync();

            await client.Inbox.AddFlagsAsync(uid, MessageFlags.Seen, true);
        }

        await client.DisconnectAsync(true);

        return emails;
    }

    /// <summary>
    /// Sends all emails marked as needing sending and updates their status.
    /// </summary>
    public async Task<int> SendPendingEmailsAsync()
    {
        var pending = await _db.Emails
            .Where(e => e.NeedsSending)
            .Include(e => e.Attachments)
            .ToListAsync();

        int processed = 0;
        foreach (var email in pending)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(MailboxAddress.Parse(_username));
                message.To.AddRange(email.To.Split(';').Select(t => MailboxAddress.Parse(t.Trim())));
                if (!string.IsNullOrWhiteSpace(email.Cc))
                    message.Cc.AddRange(email.Cc.Split(';').Select(t => MailboxAddress.Parse(t.Trim())));
                if (!string.IsNullOrWhiteSpace(email.Bcc))
                    message.Bcc.AddRange(email.Bcc.Split(';').Select(t => MailboxAddress.Parse(t.Trim())));
                message.Subject = email.Subject;

                var bodyBuilder = new BodyBuilder();
                if (email.IsHtml)
                    bodyBuilder.HtmlBody = email.BodyHtml ?? email.Body;
                else
                    bodyBuilder.TextBody = email.Body;

                foreach (var attachment in email.Attachments)
                {
                    if (!string.IsNullOrEmpty(attachment.FilePath) && File.Exists(attachment.FilePath))
                    {
                        bodyBuilder.Attachments.Add(attachment.FilePath);
                    }
                    else if (!string.IsNullOrEmpty(attachment.CloudUrl))
                    {
                        try
                        {
                            using var http = new HttpClient();
                            var stream = await http.GetStreamAsync(attachment.CloudUrl);
                            var fileName = attachment.FileName ?? Path.GetFileName(attachment.CloudUrl);
                            var contentType = attachment.ContentType ?? "application/octet-stream";
                            bodyBuilder.Attachments.Add(fileName, stream, ContentType.Parse(contentType));
                        }
                        catch
                        {
                            // Ignore errors fetching attachment
                        }
                    }
                }

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_username, _password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                email.Direction = "Outbound";
                email.NeedsSending = false;
                email.Status = "Sent";
                email.SentAt = DateTime.UtcNow;
                email.UpdatedAt = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                email.Status = "Failed";
                email.ErrorMessage = ex.Message;
                email.UpdatedAt = DateTime.UtcNow;
            }

            processed++;
        }

        await _db.SaveChangesAsync();
        return processed;
    }

    private static Guid? ExtractEventId(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            return null;

        var match = Regex.Match(message, @"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b");
        return match.Success && Guid.TryParse(match.Value, out var guid) ? guid : (Guid?)null;
    }

    private static IEnumerable<string> ExtractSpartaNumbers(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            return Enumerable.Empty<string>();

        return Regex.Matches(message, @"SPARTA/\d{4}/\d+")
            .Select(m => m.Value)
            .Distinct();
    }

    private static string? ExtractInsuranceNumber(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            return null;

        var match = Regex.Match(message, @"\[(\d+)\]");
        return match.Success ? match.Groups[1].Value : null;
    }
}
