using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.Models.Dictionary;


namespace AutomotiveClaimsApi.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // Main entities
        public DbSet<Event> Events { get; set; }
        public DbSet<Damage> Damages { get; set; }
        public DbSet<Participant> Participants { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Appeal> Appeals { get; set; }
        public DbSet<Settlement> Settlements { get; set; }
        public DbSet<ClientClaim> ClientClaims { get; set; }
        public DbSet<Decision> Decisions { get; set; }
        public DbSet<Recourse> Recourses { get; set; }
        public DbSet<Email> Emails { get; set; }
        public DbSet<EmailAttachment> EmailAttachments { get; set; }
        public DbSet<EmailClaim> EmailClaims { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<RiskType> RiskTypes { get; set; }
        public DbSet<DamageType> DamageTypes { get; set; }
        public DbSet<TaskTemplate> TaskTemplates { get; set; }
        public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
        public DbSet<EventRule> EventRules { get; set; }
        public DbSet<TaskHistory> TaskHistories { get; set; }
        public DbSet<NotificationHistory> NotificationHistories { get; set; }

        // Dictionary entities
        public DbSet<CaseHandler> CaseHandlers { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<Currency> Currencies { get; set; }
        public DbSet<InsuranceCompany> InsuranceCompanies { get; set; }
        public DbSet<LeasingCompany> LeasingCompanies { get; set; }
        public DbSet<ClaimStatus> ClaimStatuses { get; set; }
        public DbSet<VehicleType> VehicleTypes { get; set; }
        public DbSet<Priority> Priorities { get; set; }
        public DbSet<EventStatus> EventStatuses { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<ContractType> ContractTypes { get; set; }
        public DbSet<DocumentStatus> DocumentStatuses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.HasOne(u => u.Client)
                      .WithMany()
                      .HasForeignKey(u => u.ClientId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Event is the central aggregate root
            modelBuilder.Entity<Event>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ClaimNumber).HasMaxLength(50);
                entity.HasIndex(e => e.ClaimNumber).IsUnique();

                entity.HasOne(e => e.RegisteredBy)
                      .WithMany()
                      .HasForeignKey(e => e.RegisteredById)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.ClaimStatus)
                      .WithMany()
                      .HasForeignKey(e => e.ClaimStatusId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(e => e.Damages).WithOne(d => d.Event).HasForeignKey(d => d.EventId).OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.Appeals).WithOne(a => a.Event).HasForeignKey(a => a.EventId).OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.ClientClaims).WithOne(c => c.Event).HasForeignKey(c => c.EventId).OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.Decisions).WithOne(d => d.Event).HasForeignKey(d => d.EventId).OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.Recourses).WithOne(r => r.Event).HasForeignKey(r => r.EventId).OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.Settlements).WithOne(s => s.Event).HasForeignKey(s => s.EventId).OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.Participants)

                      .WithOne(p => p.Event)
                      .HasForeignKey(p => p.EventId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.Notes).WithOne(n => n.Event).HasForeignKey(n => n.EventId).OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.Documents).WithOne(d => d.Event).HasForeignKey(d => d.EventId).OnDelete(DeleteBehavior.Restrict);

            });

            modelBuilder.Entity<Participant>(entity =>
            {
                entity.HasMany(p => p.Drivers)
                      .WithOne(d => d.Participant)
                      .HasForeignKey(d => d.ParticipantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Driver>(entity =>
            {
                entity.HasOne(d => d.Event)
                      .WithMany()
                      .HasForeignKey(d => d.EventId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<DamageType>(entity =>
            {
                entity.HasOne(dt => dt.RiskType).WithMany(rt => rt.DamageTypes).HasForeignKey(dt => dt.RiskTypeId);
            });

            modelBuilder.Entity<EmailClaim>(entity =>
            {
                entity.HasKey(ec => new { ec.EmailId, ec.ClaimId });

                entity.HasOne(ec => ec.Email)
                      .WithMany(e => e.EmailClaims)
                      .HasForeignKey(ec => ec.EmailId);

                entity.HasOne(ec => ec.Claim)
                      .WithMany(c => c.EmailClaims)
                      .HasForeignKey(ec => ec.ClaimId);
            });
        }
    }
}
