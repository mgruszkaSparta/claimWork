using System;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;
using AutomotiveClaimsApi.Controllers;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Tests
{
    public class ClaimsControllerTests
    {
        [Fact]
        public async Task CreateClaim_WithExistingId_UpdatesEntityInsteadOfInserting()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var existing = new Event
            {
                Id = Guid.NewGuid(),
                Status = "Initial",
                CreatedAt = DateTime.UtcNow.AddMinutes(-10),
                UpdatedAt = DateTime.UtcNow.AddMinutes(-10)
            };
            context.Events.Add(existing);
            await context.SaveChangesAsync();

            var oldUpdatedAt = existing.UpdatedAt;
            var controller = new ClaimsController(context, NullLogger<ClaimsController>.Instance);
            var dto = new ClaimUpsertDto { Id = existing.Id };

            await controller.CreateClaim(dto);

            var events = await context.Events.ToListAsync();
            Assert.Single(events);
            Assert.True(events[0].UpdatedAt > oldUpdatedAt);
        }

        [Fact]
        public async Task UpdateClaim_UpdatesDamage_WhenModified()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev = new Event { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            var damage = new Damage { Id = Guid.NewGuid(), EventId = ev.Id, Description = "old" };
            ev.Damages.Add(damage);
            context.Events.Add(ev);
            await context.SaveChangesAsync();

            var controller = new ClaimsController(context, NullLogger<ClaimsController>.Instance);
            var dto = new ClaimUpsertDto
            {
                Id = ev.Id,
                Damages = new[] { new DamageUpsertDto { Id = damage.Id, Description = "new" } }
            };

            await controller.UpdateClaim(ev.Id, dto);

            var updated = await context.Damages.FirstAsync(d => d.Id == damage.Id);
            Assert.Equal("new", updated.Description);
        }

        [Fact]
        public async Task UpdateClaim_UpdatesParticipant_WhenModified()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev = new Event { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            var participant = new Participant { Id = Guid.NewGuid(), EventId = ev.Id, Name = "old" };
            ev.Participants.Add(participant);
            context.Events.Add(ev);
            await context.SaveChangesAsync();

            var controller = new ClaimsController(context, NullLogger<ClaimsController>.Instance);
            var dto = new ClaimUpsertDto
            {
                Id = ev.Id,
                Participants = new[] { new ParticipantUpsertDto { Id = participant.Id.ToString(), Name = "new" } }
            };

            await controller.UpdateClaim(ev.Id, dto);

            var updated = await context.Participants.FirstAsync(p => p.Id == participant.Id);
            Assert.Equal("new", updated.Name);
        }

        [Fact]
        public async Task UpdateClaim_UpdatesDecision_WhenModified()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev = new Event { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            var decision = new Decision { Id = Guid.NewGuid(), EventId = ev.Id, Status = "old", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            ev.Decisions.Add(decision);
            context.Events.Add(ev);
            await context.SaveChangesAsync();

            var controller = new ClaimsController(context, NullLogger<ClaimsController>.Instance);
            var dto = new ClaimUpsertDto
            {
                Id = ev.Id,
                Decisions = new[] { new DecisionDto { Id = decision.Id.ToString(), EventId = ev.Id.ToString(), Status = "new" } }
            };

            await controller.UpdateClaim(ev.Id, dto);

            var updated = await context.Decisions.FirstAsync(d => d.Id == decision.Id);
            Assert.Equal("new", updated.Status);
        }

        [Fact]
        public async Task UpdateClaim_AddsRecourse_WithAllProperties()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev = new Event { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            context.Events.Add(ev);
            await context.SaveChangesAsync();

            var controller = new ClaimsController(context, NullLogger<ClaimsController>.Instance);
            var recourseDto = new RecourseUpsertDto
            {
                Status = "pending",
                InitiationDate = DateTime.UtcNow.Date,
                Description = "desc",
                Notes = "notes",
                RecourseNumber = "RN1",
                RecourseAmount = 10m,
                IsJustified = true,
                FilingDate = new DateTime(2024, 1, 1),
                InsuranceCompany = "InsureCo",
                ObtainDate = new DateTime(2024, 1, 2),
                Amount = 20m,
                CurrencyCode = "USD",
                DocumentPath = "/tmp/doc.pdf",
                DocumentName = "doc",
                DocumentDescription = "doc desc"
            };
            var dto = new ClaimUpsertDto { Id = ev.Id, Recourses = new[] { recourseDto } };

            await controller.UpdateClaim(ev.Id, dto);

            var recourse = await context.Recourses.FirstAsync();
            Assert.Equal(recourseDto.Status, recourse.Status);
            Assert.Equal(recourseDto.InitiationDate, recourse.InitiationDate);
            Assert.Equal(recourseDto.Description, recourse.Description);
            Assert.Equal(recourseDto.Notes, recourse.Notes);
            Assert.Equal(recourseDto.RecourseNumber, recourse.RecourseNumber);
            Assert.Equal(recourseDto.RecourseAmount, recourse.RecourseAmount);
            Assert.Equal(recourseDto.IsJustified, recourse.IsJustified);
            Assert.Equal(recourseDto.FilingDate, recourse.FilingDate);
            Assert.Equal(recourseDto.InsuranceCompany, recourse.InsuranceCompany);
            Assert.Equal(recourseDto.ObtainDate, recourse.ObtainDate);
            Assert.Equal(recourseDto.Amount, recourse.Amount);
            Assert.Equal(recourseDto.CurrencyCode, recourse.CurrencyCode);
            Assert.Equal(recourseDto.DocumentPath, recourse.DocumentPath);
            Assert.Equal(recourseDto.DocumentName, recourse.DocumentName);
            Assert.Equal(recourseDto.DocumentDescription, recourse.DocumentDescription);
        }

        [Fact]
        public async Task UpdateClaim_UpdatesRecourse_WithAllProperties()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev = new Event { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            var recourse = new Recourse
            {
                Id = Guid.NewGuid(),
                EventId = ev.Id,
                Status = "old",
                InitiationDate = new DateTime(2023, 1, 1),
                Description = "old",
                Notes = "old",
                RecourseNumber = "OLD",
                RecourseAmount = 1m,
                IsJustified = false,
                FilingDate = new DateTime(2023, 1, 2),
                InsuranceCompany = "OldCo",
                ObtainDate = new DateTime(2023, 1, 3),
                Amount = 5m,
                CurrencyCode = "EUR",
                DocumentPath = "oldpath",
                DocumentName = "oldname",
                DocumentDescription = "olddesc",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            ev.Recourses.Add(recourse);
            context.Events.Add(ev);
            await context.SaveChangesAsync();

            var controller = new ClaimsController(context, NullLogger<ClaimsController>.Instance);
            var recourseDto = new RecourseUpsertDto
            {
                Id = recourse.Id,
                Status = "new",
                InitiationDate = new DateTime(2024, 2, 2),
                Description = "new",
                Notes = "new",
                RecourseNumber = "NEW",
                RecourseAmount = 2m,
                IsJustified = true,
                FilingDate = new DateTime(2024, 2, 3),
                InsuranceCompany = "NewCo",
                ObtainDate = new DateTime(2024, 2, 4),
                Amount = 10m,
                CurrencyCode = "USD",
                DocumentPath = "newpath",
                DocumentName = "newname",
                DocumentDescription = "newdesc"
            };
            var dto = new ClaimUpsertDto { Id = ev.Id, Recourses = new[] { recourseDto } };

            await controller.UpdateClaim(ev.Id, dto);

            var updated = await context.Recourses.FirstAsync(r => r.Id == recourse.Id);
            Assert.Equal(recourseDto.Status, updated.Status);
            Assert.Equal(recourseDto.InitiationDate, updated.InitiationDate);
            Assert.Equal(recourseDto.Description, updated.Description);
            Assert.Equal(recourseDto.Notes, updated.Notes);
            Assert.Equal(recourseDto.RecourseNumber, updated.RecourseNumber);
            Assert.Equal(recourseDto.RecourseAmount, updated.RecourseAmount);
            Assert.Equal(recourseDto.IsJustified, updated.IsJustified);
            Assert.Equal(recourseDto.FilingDate, updated.FilingDate);
            Assert.Equal(recourseDto.InsuranceCompany, updated.InsuranceCompany);
            Assert.Equal(recourseDto.ObtainDate, updated.ObtainDate);
            Assert.Equal(recourseDto.Amount, updated.Amount);
            Assert.Equal(recourseDto.CurrencyCode, updated.CurrencyCode);
            Assert.Equal(recourseDto.DocumentPath, updated.DocumentPath);
            Assert.Equal(recourseDto.DocumentName, updated.DocumentName);
            Assert.Equal(recourseDto.DocumentDescription, updated.DocumentDescription);
        }
    }
}

