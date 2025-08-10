using System;
using System.Linq;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Controllers;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Xunit;

namespace AutomotiveClaimsApi.Tests
{
    public class ClaimsControllerTests
    {
        [Fact]
        public async Task UpdateClaim_WithoutAppeals_KeepsExistingAppeals()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new ApplicationDbContext(options);

            var claimId = Guid.NewGuid();
            var appealId = Guid.NewGuid();

            context.Events.Add(new Event
            {
                Id = claimId,
                ClaimNumber = "CLAIM-1",
                Appeals =
                {
                    new Appeal
                    {
                        Id = appealId,
                        EventId = claimId,
                        SubmissionDate = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                }
            });

            await context.SaveChangesAsync();

            var logger = LoggerFactory.Create(b => { }).CreateLogger<ClaimsController>();
            var controller = new ClaimsController(context, logger);

            var dto = new ClaimUpsertDto
            {
                ClaimNumber = "CLAIM-1"
            };

            var result = await controller.UpdateClaim(claimId, dto);

            Assert.IsType<NoContentResult>(result);
            var updated = await context.Events.Include(e => e.Appeals).FirstAsync(e => e.Id == claimId);
            Assert.Single(updated.Appeals);
            Assert.Equal(appealId, updated.Appeals.First().Id);
        }

        [Fact]
        public async Task UpdateClaim_RemovesMissingDrivers()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new ApplicationDbContext(options);

            var claimId = Guid.NewGuid();
            var participantId = Guid.NewGuid();
            var driverId = Guid.NewGuid();

            context.Events.Add(new Event
            {
                Id = claimId,
                ClaimNumber = "CLAIM-DRIVER",
                Participants =
                {
                    new Participant
                    {
                        Id = participantId,
                        EventId = claimId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Drivers =
                        {
                            new Driver
                            {
                                Id = driverId,
                                EventId = claimId,
                                ParticipantId = participantId,
                                FirstName = "John",
                                LastName = "Doe",
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            }
                        }
                    }
                }
            });

            await context.SaveChangesAsync();

            var logger = LoggerFactory.Create(b => { }).CreateLogger<ClaimsController>();
            var controller = new ClaimsController(context, logger);

            var dto = new ClaimUpsertDto
            {
                ClaimNumber = "CLAIM-DRIVER",
                Participants = new[]
                {
                    new ParticipantUpsertDto
                    {
                        Id = participantId.ToString(),
                        Drivers = Array.Empty<DriverUpsertDto>()
                    }
                }
            };

            var result = await controller.UpdateClaim(claimId, dto);

            Assert.IsType<NoContentResult>(result);
            Assert.Empty(await context.Drivers.ToListAsync());
        }
    }
}
