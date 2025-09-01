using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Xunit;
using AutomotiveClaimsApi.Controllers;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutomotiveClaimsApi.Tests
{
    public class ClaimsControllerTests
    {
        private static ClaimsController MakeController(ApplicationDbContext context)
        {
            var config = new ConfigurationBuilder().Build();
            return new ClaimsController(context, NullLogger<ClaimsController>.Instance, config, documentService: new FakeDocumentService());
        }

        private class FakeDocumentService : IDocumentService
        {
            public Task<IEnumerable<DocumentDto>> GetDocumentsByEventIdAsync(Guid eventId) => Task.FromResult<IEnumerable<DocumentDto>>(Array.Empty<DocumentDto>());
            public Task<DocumentDto?> GetDocumentByIdAsync(Guid id) => Task.FromResult<DocumentDto?>(null);
            public Task<DocumentDto> UploadAndCreateDocumentAsync(IFormFile file, CreateDocumentDto createDto) => Task.FromResult(new DocumentDto());
            public Task<bool> DeleteDocumentAsync(Guid id) => Task.FromResult(true);
            public Task<bool> DeleteDocumentAsync(string filePath) => Task.FromResult(true);
            public Task<DocumentDownloadResult?> DownloadDocumentAsync(Guid id) => Task.FromResult<DocumentDownloadResult?>(null);
            public Task<(string FilePath, string OriginalFileName)> SaveDocumentAsync(IFormFile file, string category, string? description) => Task.FromResult((string.Empty, string.Empty));
            public Task<DocumentDownloadResult?> GetDocumentAsync(string filePath) => Task.FromResult<DocumentDownloadResult?>(null);
            public Task<Stream> GetDocumentStreamAsync(string filePath) => Task.FromResult(Stream.Null);
            public Task<DocumentDto> UploadDocumentAsync(IFormFile file, string category, string entityId) => Task.FromResult(new DocumentDto());
        }

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
            var controller = MakeController(context);
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

            var controller = MakeController(context);
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
            var participant = new Participant
            {
                Id = Guid.NewGuid(),
                EventId = ev.Id,
                Name = "old",
                PolicyDealDate = new DateTime(2023, 1, 1),
                PolicyStartDate = new DateTime(2023, 1, 2),
                PolicyEndDate = new DateTime(2023, 12, 31),
                PolicySumAmount = 100m
            };
            ev.Participants.Add(participant);
            context.Events.Add(ev);
            await context.SaveChangesAsync();

            var controller = MakeController(context);
            var dto = new ClaimUpsertDto
            {
                Id = ev.Id,
                Participants = new[]
                {
                    new ParticipantUpsertDto
                    {
                        Id = participant.Id.ToString(),
                        Name = "new",
                        PolicyDealDate = new DateTime(2024, 1, 1),
                        PolicyStartDate = new DateTime(2024, 1, 2),
                        PolicyEndDate = new DateTime(2024, 12, 31),
                        PolicySumAmount = 200m
                    }
                }
            };

            await controller.UpdateClaim(ev.Id, dto);

            var updated = await context.Participants.FirstAsync(p => p.Id == participant.Id);
            Assert.Equal("new", updated.Name);
            Assert.Equal(new DateTime(2024, 1, 1), updated.PolicyDealDate);
            Assert.Equal(new DateTime(2024, 1, 2), updated.PolicyStartDate);
            Assert.Equal(new DateTime(2024, 12, 31), updated.PolicyEndDate);
            Assert.Equal(200m, updated.PolicySumAmount);

            var claimResult = await controller.GetClaim(ev.Id);
            var claimDto = claimResult.Value!;
            var participantDto = Assert.Single(claimDto.Participants);
            Assert.Equal(updated.PolicyDealDate, participantDto.PolicyDealDate);
            Assert.Equal(updated.PolicyStartDate, participantDto.PolicyStartDate);
            Assert.Equal(updated.PolicyEndDate, participantDto.PolicyEndDate);
            Assert.Equal(updated.PolicySumAmount, participantDto.PolicySumAmount);
        }

        [Fact]
        public async Task UpdateClaim_AddsParticipant_WithPolicyFields()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev = new Event { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            context.Events.Add(ev);
            await context.SaveChangesAsync();

            var controller = MakeController(context);
            var pDto = new ParticipantUpsertDto
            {
                Name = "added",
                PolicyDealDate = new DateTime(2024, 2, 1),
                PolicyStartDate = new DateTime(2024, 2, 2),
                PolicyEndDate = new DateTime(2024, 2, 3),
                PolicySumAmount = 300m
            };
            var dto = new ClaimUpsertDto { Id = ev.Id, Participants = new[] { pDto } };

            await controller.UpdateClaim(ev.Id, dto);

            var stored = await context.Participants.FirstAsync();
            Assert.Equal(pDto.PolicyDealDate, stored.PolicyDealDate);
            Assert.Equal(pDto.PolicyStartDate, stored.PolicyStartDate);
            Assert.Equal(pDto.PolicyEndDate, stored.PolicyEndDate);
            Assert.Equal(pDto.PolicySumAmount, stored.PolicySumAmount);
        }

        [Fact]
        public async Task UpdateClaim_UpdatesDriverPersonalData_WhenModified()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev = new Event { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            var participant = new Participant { Id = Guid.NewGuid(), EventId = ev.Id, Name = "p" };
            var driver = new Driver
            {
                Id = Guid.NewGuid(),
                EventId = ev.Id,
                ParticipantId = participant.Id,
                FirstName = "Old",
                LastName = "Driver",
                Email = "old@example.com",
                Address = "Old St",
                City = "Oldtown",
                PostalCode = "00-000",
                PersonalId = "OLDID",
                IsMainDriver = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            participant.Drivers.Add(driver);
            ev.Participants.Add(participant);
            context.Events.Add(ev);
            await context.SaveChangesAsync();

            var controller = MakeController(context);
            var dto = new ClaimUpsertDto
            {
                Id = ev.Id,
                Participants = new[]
                {
                    new ParticipantUpsertDto
                    {
                        Id = participant.Id.ToString(),
                        Drivers = new[]
                        {
                            new DriverUpsertDto
                            {
                                Id = driver.Id.ToString(),
                                FirstName = "New",
                                LastName = "Driver",
                                Email = "new@example.com",
                                Address = "New St",
                                City = "New City",
                                PostalCode = "11-111",
                                PersonalId = "NEWID",
                                IsMainDriver = true
                            }
                        }
                    }
                }
            };

            await controller.UpdateClaim(ev.Id, dto);

            var updated = await context.Drivers.FirstAsync(d => d.Id == driver.Id);
            Assert.Equal("new@example.com", updated.Email);
            Assert.Equal("New St", updated.Address);
            Assert.Equal("New City", updated.City);
            Assert.Equal("11-111", updated.PostalCode);
            Assert.Equal("NEWID", updated.PersonalId);
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

            var controller = MakeController(context);
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
        public async Task GetClaims_Searches_All_Text_Fields()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var controller = MakeController(context);
            await controller.CreateClaim(new ClaimUpsertDto { InsuranceCompanyEmail = "search@example.com" });

            var response = await controller.GetClaims(search: "example");
            var ok = Assert.IsType<OkObjectResult>(response.Result);
            var items = Assert.IsAssignableFrom<IEnumerable<ClaimListItemDto>>(ok.Value);
            var item = Assert.Single(items);
            Assert.NotNull(item.Id);
        }

        [Fact]
        public async Task GetClaims_Filters_By_CaseHandlerId()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev1 = new Event { Id = Guid.NewGuid(), HandlerId = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsDraft = false };
            var ev2 = new Event { Id = Guid.NewGuid(), HandlerId = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsDraft = false };
            context.Events.AddRange(ev1, ev2);
            await context.SaveChangesAsync();

            var controller = MakeController(context);
            var response = await controller.GetClaims(caseHandlerId: 1);
            var ok = Assert.IsType<OkObjectResult>(response.Result);
            var items = Assert.IsAssignableFrom<IEnumerable<ClaimListItemDto>>(ok.Value);
            var item = Assert.Single(items);
            Assert.Equal(1, item.HandlerId);
        }

        [Fact]
        public async Task GetClaims_Filters_By_RegisteredById()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var ev1 = new Event { Id = Guid.NewGuid(), RegisteredById = "user1", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsDraft = false };
            var ev2 = new Event { Id = Guid.NewGuid(), RegisteredById = "user2", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsDraft = false };
            context.Events.AddRange(ev1, ev2);
            await context.SaveChangesAsync();

            var controller = MakeController(context);
            var response = await controller.GetClaims(registeredById: "user1");
            var ok = Assert.IsType<OkObjectResult>(response.Result);
            var items = Assert.IsAssignableFrom<IEnumerable<ClaimListItemDto>>(ok.Value);
            var item = Assert.Single(items);
            Assert.Equal("user1", item.RegisteredById);
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

            var controller = MakeController(context);
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

            var controller = MakeController(context);
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

        [Fact]
        public async Task GetClaim_ReturnsSettlementWithClaimId()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);
            var eventId = Guid.NewGuid();
            var claimId = Guid.NewGuid();
            var settlement = new Settlement
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                ClaimId = claimId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Events.Add(new Event { Id = eventId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            context.Settlements.Add(settlement);
            await context.SaveChangesAsync();

            var controller = MakeController(context);

            var result = await controller.GetClaim(eventId);
            var claimDto = result.Value!;
            var settlementDto = Assert.Single(claimDto.Settlements);
            Assert.Equal(claimId.ToString(), settlementDto.ClaimId);
        }
    }
}

