using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using AutomotiveClaimsApi.Controllers;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Tests
{
    public class SettlementsControllerTests
    {
        [Fact]
        public async Task GetSettlementsSummary_SumsSettlementAmountByCurrency()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var eventId = Guid.NewGuid();

            var now = DateTime.UtcNow;
            context.Settlements.AddRange(
                new Settlement { Id = Guid.NewGuid(), EventId = eventId, Currency = "USD", Amount = 1m, SettlementAmount = 100m, Status = "paid", CreatedAt = now, UpdatedAt = now },
                new Settlement { Id = Guid.NewGuid(), EventId = eventId, Currency = "USD", Amount = 1m, SettlementAmount = 50m, Status = "paid", CreatedAt = now, UpdatedAt = now },
                new Settlement { Id = Guid.NewGuid(), EventId = eventId, Currency = null, Amount = 1m, SettlementAmount = 200m, Status = "pending", CreatedAt = now, UpdatedAt = now }
            );
            await context.SaveChangesAsync();

            var controller = new SettlementsController(context, null!, NullLogger<SettlementsController>.Instance);

            var result = await controller.GetSettlementsSummary(eventId);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            dynamic summary = okResult.Value!;
            var totalsByCurrency = (IDictionary<string, decimal>)summary.TotalsByCurrency;

            Assert.Equal(150m, totalsByCurrency["USD"]);
            Assert.Equal(200m, totalsByCurrency["PLN"]);
            Assert.Equal(3, summary.Count);
        }

        [Fact]
        public async Task GetSettlement_ReturnsClaimId()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var claimId = Guid.NewGuid();
            var settlement = new Settlement
            {
                Id = Guid.NewGuid(),
                EventId = Guid.NewGuid(),
                ClaimId = claimId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Settlements.Add(settlement);
            await context.SaveChangesAsync();

            var controller = new SettlementsController(context, null!, NullLogger<SettlementsController>.Instance);

            var result = await controller.GetSettlement(settlement.Id);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<SettlementDto>(okResult.Value);
            Assert.Equal(claimId.ToString(), dto.ClaimId);
        }
    }
}
