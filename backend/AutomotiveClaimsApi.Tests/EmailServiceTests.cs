using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.Services;

namespace AutomotiveClaimsApi.Tests
{
    public class EmailServiceTests
    {
        private class FakeWebHostEnvironment : IWebHostEnvironment
        {
            public string ApplicationName { get; set; } = "Test";
            public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
            public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
            public string WebRootPath { get; set; } = Path.GetTempPath();
            public string ContentRootPath { get; set; } = Path.GetTempPath();
            public string EnvironmentName { get; set; } = "Development";
        }

        [Fact]
        public async Task AssignEmailToClaimAsync_AssignsByEventId()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var evt = new Event { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            context.Events.Add(evt);
            var email = new Email
            {
                Id = Guid.NewGuid(),
                Subject = string.Empty,
                Body = string.Empty,
                From = string.Empty,
                To = string.Empty,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Emails.Add(email);
            await context.SaveChangesAsync();

            var smtp = Options.Create(new SmtpSettings { FromEmail = "test@example.com" });
            var env = new FakeWebHostEnvironment();
            var config = new ConfigurationBuilder().Build();
            var cloud = Options.Create(new GoogleCloudStorageSettings { Enabled = false });
            var service = new EmailService(context, smtp, NullLogger<EmailService>.Instance, env, config, null, cloud);

            var result = await service.AssignEmailToClaimAsync(email.Id, new[] { evt.Id });

            Assert.True(result);
            var updated = await context.Emails.FindAsync(email.Id);
            Assert.Equal(evt.Id, updated?.EventId);
        }
    }
}

