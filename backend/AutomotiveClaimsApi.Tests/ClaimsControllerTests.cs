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
    }
}

