using EmailService.Models;
using Microsoft.EntityFrameworkCore;

namespace EmailService.Data;

public class EmailDbContext : DbContext
{
    public EmailDbContext(DbContextOptions<EmailDbContext> options) : base(options) { }

    public DbSet<Email> Emails { get; set; } = null!;
    public DbSet<EmailAttachment> EmailAttachments { get; set; } = null!;
    public DbSet<Event> Events { get; set; } = null!;
    public DbSet<Document> Documents { get; set; } = null!;
}
