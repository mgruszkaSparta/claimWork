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
    }
}

