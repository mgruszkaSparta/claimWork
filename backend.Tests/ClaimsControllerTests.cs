using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using AutomotiveClaimsApi.Controllers;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using System.Collections.Generic;
using System.Reflection;
using Xunit;

namespace AutomotiveClaimsApi.Tests
{
    public class ClaimsControllerTests
    {
        private static ApplicationDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task DeleteClaim_NoParticipants_RemovesClaim()
        {
            using var context = CreateContext();
            var controller = new ClaimsController(context, NullLogger<ClaimsController>.Instance);

            var evt = new Event { Id = Guid.NewGuid() };
            context.Events.Add(evt);
            await context.SaveChangesAsync();

            var result = await controller.DeleteClaim(evt.Id);

            Assert.IsType<NoContentResult>(result);
            Assert.False(context.Events.Any());
        }

        [Fact]
        public async Task DeleteClaim_WithParticipants_RemovesDependents()
        {
            using var context = CreateContext();
            var controller = new ClaimsController(context, NullLogger<ClaimsController>.Instance);

            var evt = new Event { Id = Guid.NewGuid() };
            var participant = new Participant { Id = Guid.NewGuid(), EventId = evt.Id };
            var driver = new Driver { Id = Guid.NewGuid(), EventId = evt.Id, ParticipantId = participant.Id };
            participant.Drivers.Add(driver);
            evt.Participants.Add(participant);

            context.Events.Add(evt);
            context.Participants.Add(participant);
            context.Drivers.Add(driver);
            await context.SaveChangesAsync();

            var result = await controller.DeleteClaim(evt.Id);

            Assert.IsType<NoContentResult>(result);
            Assert.False(context.Events.Any());
            Assert.False(context.Participants.Any());
            Assert.False(context.Drivers.Any());
        }

        [Fact]
        public async Task CreateClaim_WithExistingId_UpdatesEventAndLinksSchedules()
        {
            using var context = CreateContext();
            var claimsController = new ClaimsController(context, NullLogger<ClaimsController>.Instance);
            var schedulesController = new RepairSchedulesController();

            // Reset static schedules list
            typeof(RepairSchedulesController)
                .GetField("_schedules", BindingFlags.NonPublic | BindingFlags.Static)?
                .SetValue(null, new List<RepairSchedule>());

            var eventId = Guid.NewGuid();
            context.Events.Add(new Event { Id = eventId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            await context.SaveChangesAsync();

            var dto = new ClaimUpsertDto { Id = eventId, ClaimNumber = "CL-1" };
            var createResult = await claimsController.CreateClaim(dto);

            var created = Assert.IsType<CreatedAtActionResult>(createResult.Result);
            var claimDto = Assert.IsType<ClaimDto>(created.Value);
            Assert.Equal(eventId.ToString(), claimDto.Id);
            Assert.Single(context.Events);

            var scheduleResult = schedulesController.CreateSchedule(new CreateRepairScheduleDto
            {
                EventId = eventId,
            });

            var scheduleCreated = Assert.IsType<CreatedAtActionResult>(scheduleResult.Result);
            var scheduleDto = Assert.IsType<RepairScheduleDto>(scheduleCreated.Value);
            Assert.Equal(eventId, scheduleDto.EventId);
        }
    }
}
