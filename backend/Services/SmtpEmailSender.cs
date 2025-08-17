using System;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.Data;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using MimeKit;

namespace AutomotiveClaimsApi.Services
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly ApplicationDbContext _context;

        public SmtpEmailSender(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var settings = await _context.SmtpSettings.AsNoTracking().FirstOrDefaultAsync();
            if (settings == null)
                throw new InvalidOperationException("SMTP settings not configured");

            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(new MailboxAddress(settings.FromName, settings.FromEmail));
            mimeMessage.To.Add(MailboxAddress.Parse(email));
            mimeMessage.Subject = subject;
            mimeMessage.Body = new TextPart("plain") { Text = message };

            using var client = new SmtpClient();
            await client.ConnectAsync(settings.Host, settings.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(settings.Username, settings.Password);
            await client.SendAsync(mimeMessage);
            await client.DisconnectAsync(true);
        }
    }
}
