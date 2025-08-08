using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using AutomotiveClaimsApi.Controllers;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using Xunit;

namespace AutomotiveClaimsApi.Tests
{
    public class EventsControllerTests
    {
        private static ApplicationDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task DeleteEvent_NoParticipants_RemovesEvent()
        {
            using var context = CreateContext();
            var controller = new EventsController(context, NullLogger<EventsController>.Instance);

            var evt = new Event { Id = Guid.NewGuid() };
            context.Events.Add(evt);
            await context.SaveChangesAsync();

            var result = await controller.DeleteEvent(evt.Id);

            Assert.IsType<NoContentResult>(result);
            Assert.False(context.Events.Any());
        }

        [Fact]
        public async Task DeleteEvent_WithParticipants_RemovesDependents()
        {
            using var context = CreateContext();
            var controller = new EventsController(context, NullLogger<EventsController>.Instance);

            var evt = new Event { Id = Guid.NewGuid() };
            var participant = new Participant { Id = Guid.NewGuid(), EventId = evt.Id };
            var driver = new Driver { Id = Guid.NewGuid(), EventId = evt.Id, ParticipantId = participant.Id };
            participant.Drivers.Add(driver);
            evt.Participants.Add(participant);

            context.Events.Add(evt);
            context.Participants.Add(participant);
            context.Drivers.Add(driver);
            await context.SaveChangesAsync();

            var result = await controller.DeleteEvent(evt.Id);

            Assert.IsType<NoContentResult>(result);
            Assert.False(context.Events.Any());
            Assert.False(context.Participants.Any());
            Assert.False(context.Drivers.Any());
        }
    }
}
