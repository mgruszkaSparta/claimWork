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
        public async Task UpdateClaim_ConcurrencyConflict_Returns409()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var claimId = Guid.NewGuid();
            var initialVersion = new byte[] { 1 };

            using (var setupContext = new ApplicationDbContext(options))
            {
                setupContext.Events.Add(new Event
                {
                    Id = claimId,
                    ClaimNumber = "CLAIM-1",
                    RowVersion = initialVersion
                });
                await setupContext.SaveChangesAsync();
            }

            var logger = LoggerFactory.Create(b => { }).CreateLogger<ClaimsController>();

            using var context1 = new ApplicationDbContext(options);
            // Preload entity to keep original RowVersion in context1
            await context1.Events.FirstAsync(e => e.Id == claimId);
            var controller1 = new ClaimsController(context1, logger);

            using (var context2 = new ApplicationDbContext(options))
            {
                var concurrent = await context2.Events.FirstAsync(e => e.Id == claimId);
                concurrent.RowVersion = new byte[] { 2 };
                await context2.SaveChangesAsync();
            }

            var dto = new ClaimUpsertDto
            {
                ClaimNumber = "CLAIM-1",
                RowVersion = initialVersion
            };

            var result = await controller1.UpdateClaim(claimId, dto);

            var conflict = Assert.IsType<ObjectResult>(result);
            Assert.Equal(409, conflict.StatusCode);
        }

        [Fact]
        public async Task UpdateClaim_WithMatchingRowVersion_Succeeds()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var claimId = Guid.NewGuid();
            var version = new byte[] { 1 };

            using var context = new ApplicationDbContext(options);
            context.Events.Add(new Event
            {
                Id = claimId,
                ClaimNumber = "CLAIM-1",
                RowVersion = version
            });
            await context.SaveChangesAsync();

            var logger = LoggerFactory.Create(b => { }).CreateLogger<ClaimsController>();
            var controller = new ClaimsController(context, logger);

            var dto = new ClaimUpsertDto
            {
                ClaimNumber = "CLAIM-2",
                RowVersion = version
            };

            var result = await controller.UpdateClaim(claimId, dto);

            Assert.IsType<NoContentResult>(result);
        }
    }
}
