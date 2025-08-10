using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClaimsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClaimsController> _logger;

        public ClaimsController(ApplicationDbContext context, ILogger<ClaimsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClaimListItemDto>>> GetClaims(
            [FromQuery] string? search = null,
            [FromQuery] string? clientId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? policyNumber = null,
            [FromQuery] DateTime? damageDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.Events.AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(e => 
                        (e.ClaimNumber != null && e.ClaimNumber.Contains(search)) ||
                        (e.SpartaNumber != null && e.SpartaNumber.Contains(search)) ||
                        (e.VehicleNumber != null && e.VehicleNumber.Contains(search)) ||
                        (e.Owner != null && e.Owner.Contains(search)) ||
                        (e.Brand != null && e.Brand.Contains(search)));
                }

                if (!string.IsNullOrEmpty(clientId) && int.TryParse(clientId, out var clientIdValue))
                {
                    query = query.Where(e => e.ClientId == clientIdValue);
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(e => e.Status == status);
                }

                if (!string.IsNullOrEmpty(policyNumber))
                {
                    query = query.Where(e => e.PolicyNumber != null && e.PolicyNumber.Contains(policyNumber));
                }

                if (damageDate.HasValue)
                {
                    var date = damageDate.Value.Date;
                    query = query.Where(e => e.DamageDate.HasValue && e.DamageDate.Value.Date == date);
                }

                var totalCount = await query.CountAsync();

                var events = await query
                    .OrderByDescending(e => e.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(e => new ClaimListItemDto
                    {
                        Id = e.Id.ToString(),
                        ClaimNumber = e.ClaimNumber,
                        SpartaNumber = e.SpartaNumber,
                        VehicleNumber = e.VehicleNumber,
                        Brand = e.Brand,
                        Model = e.Model,
                        Owner = e.Owner,
                        Status = e.Status,
                        DamageDate = e.DamageDate,
                        TotalClaim = e.TotalClaim,
                        Payout = e.Payout,
                        Currency = e.Currency,
                        CreatedAt = e.CreatedAt,
                        ClientId = e.ClientId,
                        Client = e.Client,
                        Liquidator = e.Liquidator,
                        PolicyNumber = e.PolicyNumber,
                        InsuranceCompanyId = e.InsuranceCompanyId,
                        InsuranceCompany = e.InsuranceCompany,
                        LeasingCompanyId = e.LeasingCompanyId,
                        LeasingCompany = e.LeasingCompany,
                        HandlerId = e.HandlerId,
                        Handler = e.Handler
                    })
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events");
                return StatusCode(500, new { error = "Failed to fetch events" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClaimDto>> GetClaim(Guid id)
        {
            try
            {
                var eventEntity = await _context.Events
                    .Include(e => e.Participants).ThenInclude(p => p.Drivers)
                    .Include(e => e.Documents.Where(d => !d.IsDeleted))
                    .Include(e => e.Damages)
                    .Include(e => e.Appeals)
                    .Include(e => e.ClientClaims)
                    .Include(e => e.Decisions)
                    .Include(e => e.Recourses)
                    .Include(e => e.Settlements)
                    .Include(e => e.Emails)
                    .Include(e => e.Notes)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (eventEntity == null)
                {
                    return NotFound(new { error = "Event not found" });
                }

                var eventDto = MapEventToDto(eventEntity);
                return Ok(eventDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving event {EventId}", id);
                return StatusCode(500, new { error = "Failed to fetch event" });
            }
        }

        [HttpPost("initialize")]
        public async Task<ActionResult<object>> InitializeClaim()
        {
            try
            {
                var eventEntity = new Event
                {
                    Id = Guid.NewGuid(),
                    Status = "Nowa",
                    Currency = "PLN",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Events.Add(eventEntity);
                await _context.SaveChangesAsync();

                return Ok(new { id = eventEntity.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing event");
                return StatusCode(500, new { error = "Failed to initialize event" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ClaimDto>> CreateClaim([FromBody] ClaimUpsertDto eventDto)
        {
            try
            {
                Event eventEntity;

                if (eventDto.Id.HasValue)
                {
                    eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.Id == eventDto.Id.Value) ?? new Event
                    {
                        Id = eventDto.Id.Value,
                        CreatedAt = DateTime.UtcNow
                    };


                    if (_context.Entry(eventEntity).State == EntityState.Detached)
                    {
                        _context.Events.Add(eventEntity);
                    }

                    eventEntity.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    eventEntity = new Event
                    {
                        Id = Guid.NewGuid(),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Events.Add(eventEntity);
                }


                eventEntity.SpartaNumber = await GenerateNextSpartaNumber();

                if (_context.Entry(eventEntity).State == EntityState.Detached)
                {
                    _context.Events.Add(eventEntity);
                }


                if (eventDto.Documents != null && eventDto.Documents.Any())
                {
                    var documentIds = eventDto.Documents.Select(d => d.Id).ToList();
                    var documents = await _context.Documents.Where(d => documentIds.Contains(d.Id)).ToListAsync();
                    foreach (var doc in documents)
                    {
                        doc.EventId = eventEntity.Id;
                        doc.UpdatedAt = DateTime.UtcNow;
                    }
                }

                if (eventDto.Participants != null)
                {
                    foreach (var pDto in eventDto.Participants)
                    {
                        var participant = MapParticipantDtoToModel(pDto, eventEntity.Id);
                        _context.Participants.Add(participant);
                        if (pDto.Drivers != null)
                        {
                            foreach (var dDto in pDto.Drivers)
                            {
                                _context.Drivers.Add(MapDriverDtoToModel(dDto, eventEntity.Id, participant.Id));
                            }
                        }
                    }
                }


                if (eventDto.Notes != null)
                {
                    foreach (var nDto in eventDto.Notes)
                    {
                        _context.Notes.Add(MapNoteDtoToModel(nDto, eventEntity.Id));
                    }
                }

                if (eventDto.Emails != null)
                {
                    foreach (var eDto in eventDto.Emails)
                    {
                        _context.Emails.Add(MapEmailDtoToModel(eDto, eventEntity.Id));
                    }
                }

                if (eventDto.Damages != null)
                {
                    foreach (var dDto in eventDto.Damages)
                    {
                        _context.Damages.Add(MapDamageDtoToModel(dDto, eventEntity.Id));
                    }
                }

                if (eventDto.Decisions != null)
                {
                    foreach (var dDto in eventDto.Decisions)
                    {
                        _context.Decisions.Add(MapDecisionDtoToModel(dDto, eventEntity.Id));
                    }
                }

                if (eventDto.ClientClaims != null)
                {
                    foreach (var cDto in eventDto.ClientClaims)
                    {
                        Guid? clientClaimId = null;
                        if (!string.IsNullOrEmpty(cDto.Id))
                        {
                            if (Guid.TryParse(cDto.Id, out var parsedId))
                            {
                                clientClaimId = parsedId;
                            }
                            else
                            {
                                return BadRequest($"Invalid ClientClaim Id format: {cDto.Id}");
                            }
                        }

                        _context.ClientClaims.Add(MapClientClaimDtoToModel(cDto, eventEntity.Id, clientClaimId));
                    }
                }

                if (eventDto.Recourses != null)
                {
                    foreach (var rDto in eventDto.Recourses)
                    {
                        _context.Recourses.Add(MapRecourseDtoToModel(rDto, eventEntity.Id));
                    }
                }

                if (eventDto.Settlements != null)
                {
                    foreach (var sDto in eventDto.Settlements)
                    {
                        _context.Settlements.Add(MapSettlementDtoToModel(sDto, eventEntity.Id));

                    }
                }

                await _context.SaveChangesAsync();

                // Reload the entity with all related data
                var createdEvent = await _context.Events
                    .Include(e => e.Participants).ThenInclude(p => p.Drivers)
                    .Include(e => e.Documents.Where(d => !d.IsDeleted))
                    .Include(e => e.Damages)
                    .Include(e => e.Appeals)
                    .Include(e => e.ClientClaims)
                    .Include(e => e.Decisions)
                    .Include(e => e.Recourses)
                    .Include(e => e.Settlements)
                    .Include(e => e.Emails)
                    .Include(e => e.Notes)
                    .FirstOrDefaultAsync(e => e.Id == eventEntity.Id);

                var createdClaimDto = MapEventToDto(createdEvent!);
                return CreatedAtAction(nameof(GetClaim), new { id = eventEntity.Id }, createdClaimDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating event");
                return StatusCode(500, new { error = "An error occurred while creating the event" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClaim(Guid id, [FromBody] ClaimUpsertDto eventDto)
        {
            try
            {
                var eventEntity = await _context.Events
                    .Include(e => e.Participants).ThenInclude(p => p.Drivers)
                    .Include(e => e.Damages)
                    .Include(e => e.Appeals)
                    .Include(e => e.ClientClaims)
                    .Include(e => e.Decisions)
                    .Include(e => e.Recourses)
                    .Include(e => e.Settlements)
                    .Include(e => e.Notes)
                    .Include(e => e.Emails)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (eventEntity == null)
                {
                    return NotFound(new { error = "Event not found" });
                }

                MapUpsertDtoToEvent(eventDto, eventEntity, _context);

                eventEntity.UpdatedAt = DateTime.UtcNow;

                if (eventDto.Documents != null && eventDto.Documents.Any())
                {
                    var documentIds = eventDto.Documents.Select(d => d.Id).ToList();
                    var documents = await _context.Documents.Where(d => documentIds.Contains(d.Id)).ToListAsync();
                    foreach (var doc in documents)
                    {
                        doc.EventId = eventEntity.Id;
                        doc.UpdatedAt = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new { error = "The record was modified by another process." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating event {EventId}", id);
                return StatusCode(500, new { error = "An error occurred while updating the event" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClaim(Guid id)
        {
            try
            {
                var eventEntity = await _context.Events
                    .Include(e => e.Participants)
                    .ThenInclude(p => p.Drivers)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (eventEntity == null)
                {
                    return NotFound(new { error = "Event not found" });
                }

                foreach (var participant in eventEntity.Participants.ToList())
                {
                    foreach (var driver in participant.Drivers.ToList())
                    {
                        _context.Drivers.Remove(driver);
                    }
                    _context.Participants.Remove(participant);
                }

                _context.Events.Remove(eventEntity);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Event deletion blocked due to related entities {EventId}", id);
                return Conflict(new { error = "Event has related entities and cannot be deleted" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting event {EventId}", id);
                return StatusCode(500, new { error = "An error occurred while deleting the event" });
            }
        }

        [HttpGet("{claimId}/decisions")]
        public async Task<ActionResult<IEnumerable<Decision>>> GetDecisions(Guid claimId)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Decisions)
                .FirstOrDefaultAsync(e => e.Id == claimId);

            if (eventEntity == null)
            {
                return NotFound(new { error = "Event not found" });
            }

            return Ok(eventEntity.Decisions);
        }

        [HttpPost("{claimId}/decisions")]
        public async Task<ActionResult<Decision>> CreateDecision(Guid claimId, [FromForm] DecisionDto dto)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Decisions)
                .FirstOrDefaultAsync(e => e.Id == claimId);

            if (eventEntity == null)
            {
                return NotFound(new { error = "Event not found" });
            }

            var decision = MapDecisionDtoToModel(dto, eventEntity.Id);
            _context.Decisions.Add(decision);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDecisions), new { claimId = eventEntity.Id }, decision);
        }

        [HttpPut("{claimId}/decisions/{decisionId}")]
        public async Task<IActionResult> UpdateDecision(Guid claimId, Guid decisionId, [FromForm] DecisionDto dto)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Decisions)
                .FirstOrDefaultAsync(e => e.Id == claimId);

            if (eventEntity == null)
            {
                return NotFound(new { error = "Event not found" });
            }

            var decision = _context.Decisions.FirstOrDefault(d => d.Id == decisionId && d.EventId == claimId);
            if (decision == null)
            {
                return NotFound(new { error = "Decision not found" });
            }

            decision.DecisionDate = dto.DecisionDate;
            decision.Status = dto.Status;
            decision.Amount = dto.Amount;
            decision.Currency = dto.Currency;
            decision.CompensationTitle = dto.CompensationTitle;
            decision.DocumentDescription = dto.DocumentDescription;
            decision.DocumentName = dto.DocumentName;
            decision.DocumentPath = dto.DocumentPath;
            decision.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(decision);
        }

        [HttpDelete("{claimId}/decisions/{decisionId}")]
        public async Task<IActionResult> DeleteDecision(Guid claimId, Guid decisionId)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Decisions)
                .FirstOrDefaultAsync(e => e.Id == claimId);

            if (eventEntity == null)
            {
                return NotFound(new { error = "Event not found" });
            }

            var decision = await _context.Decisions
                .FirstOrDefaultAsync(d => d.Id == decisionId && d.EventId == claimId);
            if (decision == null)
            {
                return NotFound(new { error = "Decision not found" });
            }

            _context.Decisions.Remove(decision);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<string> GenerateNextSpartaNumber()
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"SPARTA/{year}/";

            var lastNumber = await _context.Events
                .Where(e => e.SpartaNumber != null && e.SpartaNumber.StartsWith(prefix))
                .OrderByDescending(e => e.SpartaNumber)
                .Select(e => e.SpartaNumber)
                .FirstOrDefaultAsync();

            var next = 1;
            if (lastNumber != null)
            {
                var parts = lastNumber.Split('/');
                if (parts.Length == 3 && int.TryParse(parts[2], out var parsed))
                {
                    next = parsed + 1;
                }
            }

            return $"{prefix}{next:D4}";
        }

        private static Event MapUpsertDtoToEvent(ClaimUpsertDto dto, Event? entity = null, ApplicationDbContext? context = null)
        {
            entity ??= new Event();

            if (dto.RowVersion != null)
            {
                entity.RowVersion = dto.RowVersion;
            }

            entity.ClaimNumber = dto.ClaimNumber;
            entity.SpartaNumber = dto.SpartaNumber;
            entity.InsurerClaimNumber = dto.InsurerClaimNumber;
            entity.VehicleNumber = dto.VehicleNumber;
            entity.Brand = dto.Brand;
            entity.Model = dto.Model;
            entity.Owner = dto.Owner;
            entity.InsuranceCompanyId = dto.InsuranceCompanyId;
            entity.InsuranceCompany = dto.InsuranceCompany;
            entity.InsuranceCompanyPhone = dto.InsuranceCompanyPhone;
            entity.InsuranceCompanyEmail = dto.InsuranceCompanyEmail;
            entity.PolicyNumber = dto.PolicyNumber;
            entity.Status = dto.Status;
            entity.DamageDate = dto.DamageDate;
            entity.ReportDate = dto.ReportDate;
            entity.ReportDateToInsurer = dto.ReportDateToInsurer;
            entity.TotalClaim = dto.TotalClaim;
            entity.Payout = dto.Payout;
            entity.Currency = dto.Currency;
            entity.RiskType = dto.RiskType;
            entity.DamageType = dto.DamageType;
            entity.Liquidator = dto.Liquidator;
            entity.ClientId = dto.ClientId;
            entity.Client = dto.Client;
            entity.ReportingChannel = dto.ReportingChannel;
            entity.LeasingCompanyId = dto.LeasingCompanyId;
            entity.LeasingCompany = dto.LeasingCompany;
            entity.LeasingCompanyPhone = dto.LeasingCompanyPhone;
            entity.LeasingCompanyEmail = dto.LeasingCompanyEmail;
            entity.HandlerId = dto.HandlerId;
            entity.Handler = dto.Handler;
            entity.HandlerEmail = dto.HandlerEmail;
            entity.HandlerPhone = dto.HandlerPhone;

            if (DateTime.TryParse(dto.EventTime, out var eventTime))
            {
                entity.EventTime = eventTime;
            }

            entity.EventLocation = dto.EventLocation;
            entity.EventDescription = dto.EventDescription;
            entity.Comments = dto.Comments;
            entity.Area = dto.Area;
            entity.WereInjured = dto.WereInjured;
            entity.StatementWithPerpetrator = dto.StatementWithPerpetrator;
            entity.PerpetratorFined = dto.PerpetratorFined;
            entity.ServicesCalled = dto.ServicesCalled;
            entity.PoliceUnitDetails = dto.PoliceUnitDetails;
            entity.VehicleType = dto.VehicleType;
            entity.DamageDescription = dto.DamageDescription;
            entity.Description = dto.Description;

            // Upsert nested collections
            if (dto.Participants != null)
            {
                var dtoIds = dto.Participants
                    .Where(p => !string.IsNullOrEmpty(p.Id))
                    .Select(p => Guid.Parse(p.Id!))
                    .ToHashSet();
                var toRemove = entity.Participants.Where(p => !dtoIds.Contains(p.Id)).ToList();
                foreach (var r in toRemove) entity.Participants.Remove(r);

                foreach (var pDto in dto.Participants)
                {
                    var hasId = Guid.TryParse(pDto.Id, out var participantId);
                    var existing = hasId ? entity.Participants.FirstOrDefault(p => p.Id == participantId) : null;
                    if (existing != null)
                    {
                        existing.Role = pDto.Role;
                        existing.Name = pDto.Name;
                        existing.Phone = pDto.Phone;
                        existing.Email = pDto.Email;
                        existing.Address = pDto.Address;
                        existing.City = pDto.City;
                        existing.PostalCode = pDto.PostalCode;
                        existing.Country = pDto.Country;
                        existing.InsuranceCompany = pDto.InsuranceCompany;
                        existing.PolicyNumber = pDto.PolicyNumber;
                        existing.VehicleRegistration = pDto.VehicleRegistration;
                        existing.VehicleVin = pDto.VehicleVin;
                        existing.VehicleType = pDto.VehicleType;
                        existing.VehicleBrand = pDto.VehicleBrand;
                        existing.VehicleModel = pDto.VehicleModel;
                        existing.VehicleYear = pDto.VehicleYear;
                        existing.InspectionContactName = pDto.InspectionContactName;
                        existing.InspectionContactPhone = pDto.InspectionContactPhone;
                        existing.InspectionContactEmail = pDto.InspectionContactEmail;
                        existing.IsAtFault = pDto.IsAtFault;
                        existing.IsInjured = pDto.IsInjured;
                        existing.InjuryDescription = pDto.InjuryDescription;
                        existing.LicenseNumber = pDto.LicenseNumber;
                        existing.LicenseClass = pDto.LicenseClass;
                        existing.LicenseExpiryDate = pDto.LicenseExpiryDate;
                        existing.DateOfBirth = pDto.DateOfBirth;
                        existing.ParticipantType = pDto.ParticipantType;
                        existing.ContactInfo = pDto.ContactInfo;
                        existing.Notes = pDto.Notes;
                        existing.UpdatedAt = DateTime.UtcNow;

                        var driverIds = pDto.Drivers?
                            .Where(d => !string.IsNullOrEmpty(d.Id))
                            .Select(d => Guid.Parse(d.Id!))
                            .ToHashSet() ?? new HashSet<Guid>();
                        var driversToRemove = existing.Drivers.Where(d => !driverIds.Contains(d.Id)).ToList();
                        foreach (var d in driversToRemove)
                        {
                            context?.Drivers.Remove(d);
                            existing.Drivers.Remove(d);
                        }

                        if (pDto.Drivers != null)
                        {
                            foreach (var dDto in pDto.Drivers)
                            {
                                var hasDriverId = Guid.TryParse(dDto.Id, out var driverId);
                                var driver = hasDriverId ? existing.Drivers.FirstOrDefault(dr => dr.Id == driverId) : null;
                                if (driver != null)
                                {
                                    driver.FirstName = dDto.FirstName;
                                    driver.LastName = dDto.LastName;
                                    driver.Phone = dDto.Phone;
                                    driver.LicenseNumber = dDto.LicenseNumber;
                                    driver.LicenseState = dDto.LicenseState;
                                    driver.LicenseExpirationDate = dDto.LicenseExpirationDate;
                                    driver.IsMainDriver = dDto.IsMainDriver;
                                    driver.UpdatedAt = DateTime.UtcNow;
                                }
                                else
                                {
                                    existing.Drivers.Add(new Driver
                                    {
                                        Id = hasDriverId ? driverId : Guid.NewGuid(),
                                        EventId = entity.Id,
                                        ParticipantId = existing.Id,
                                        FirstName = dDto.FirstName,
                                        LastName = dDto.LastName,
                                        Phone = dDto.Phone,
                                        LicenseNumber = dDto.LicenseNumber,
                                        LicenseState = dDto.LicenseState,
                                        LicenseExpirationDate = dDto.LicenseExpirationDate,
                                        IsMainDriver = dDto.IsMainDriver,
                                        CreatedAt = DateTime.UtcNow,
                                        UpdatedAt = DateTime.UtcNow
                                    });
                                }
                            }
                        }
                    }
                    else
                    {
                        var participant = MapParticipantDtoToModel(pDto, entity.Id);
                        participant.Drivers.Clear();
                        foreach (var dDto in pDto.Drivers ?? Enumerable.Empty<DriverUpsertDto>())
                        {
                            participant.Drivers.Add(new Driver
                            {
                                Id = string.IsNullOrEmpty(dDto.Id) ? Guid.NewGuid() : Guid.Parse(dDto.Id),
                                EventId = entity.Id,
                                ParticipantId = participant.Id,
                                FirstName = dDto.FirstName,
                                LastName = dDto.LastName,
                                Phone = dDto.Phone,
                                LicenseNumber = dDto.LicenseNumber,
                                LicenseState = dDto.LicenseState,
                                LicenseExpirationDate = dDto.LicenseExpirationDate,
                                IsMainDriver = dDto.IsMainDriver,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            });
                        }
                        entity.Participants.Add(participant);
                    }
                }
            }

            if (dto.Notes != null)
            {
                context?.Notes.RemoveRange(entity.Notes);
                entity.Notes.Clear();
                foreach (var nDto in dto.Notes)
                {
                    entity.Notes.Add(MapNoteDtoToModel(nDto, entity.Id));
                }
            }

            if (dto.Emails != null)
            {
                context?.Emails.RemoveRange(entity.Emails);
                entity.Emails.Clear();
                foreach (var eDto in dto.Emails)
                {
                    entity.Emails.Add(MapEmailDtoToModel(eDto, entity.Id));
                }
            }

            if (dto.Damages != null)
            {
                var dtoIds = dto.Damages
                    .Where(d => d.Id.HasValue)
                    .Select(d => d.Id.Value)
                    .ToHashSet();
                var toRemove = entity.Damages.Where(d => !dtoIds.Contains(d.Id)).ToList();
                foreach (var r in toRemove) entity.Damages.Remove(r);

                foreach (var dDto in dto.Damages)
                {
                    var hasId = dDto.Id.HasValue;
                    var damageId = dDto.Id ?? Guid.Empty;
                    var existing = hasId ? entity.Damages.FirstOrDefault(d => d.Id == damageId) : null;
                    if (existing != null)
                    {
                        existing.Description = dDto.Description;
                        existing.Detail = dDto.Detail;
                        existing.Location = dDto.Location;
                        existing.Severity = dDto.Severity;
                        existing.EstimatedCost = dDto.EstimatedCost;
                        existing.ActualCost = dDto.ActualCost;
                        existing.RepairStatus = dDto.RepairStatus;
                        existing.RepairDate = dDto.RepairDate;
                        existing.RepairShop = dDto.RepairShop;
                        existing.Notes = dDto.Notes;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        entity.Damages.Add(new Damage
                        {
                            Id = hasId ? damageId : Guid.NewGuid(),
                            EventId = entity.Id,
                            Description = dDto.Description,
                            Detail = dDto.Detail,
                            Location = dDto.Location,
                            Severity = dDto.Severity,
                            EstimatedCost = dDto.EstimatedCost,
                            ActualCost = dDto.ActualCost,
                            RepairStatus = dDto.RepairStatus,
                            RepairDate = dDto.RepairDate,
                            RepairShop = dDto.RepairShop,
                            Notes = dDto.Notes,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            if (dto.Decisions != null)
            {
                var dtoIds = dto.Decisions
                    .Select(d => Guid.TryParse(d.Id, out var id) ? id : (Guid?)null)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .ToHashSet();
                var toRemove = entity.Decisions.Where(d => !dtoIds.Contains(d.Id)).ToList();
                foreach (var r in toRemove) entity.Decisions.Remove(r);

                foreach (var dDto in dto.Decisions)
                {
                    var hasId = Guid.TryParse(dDto.Id, out var decisionId);
                    var existing = hasId ? entity.Decisions.FirstOrDefault(d => d.Id == decisionId) : null;
                    if (existing != null)
                    {
                        existing.DecisionDate = dDto.DecisionDate;
                        existing.Status = dDto.Status;
                        existing.Amount = dDto.Amount;
                        existing.Currency = dDto.Currency;
                        existing.CompensationTitle = dDto.CompensationTitle;
                        existing.DocumentDescription = dDto.DocumentDescription;
                        existing.DocumentName = dDto.DocumentName;
                        existing.DocumentPath = dDto.DocumentPath;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        entity.Decisions.Add(new Decision
                        {
                            Id = hasId ? decisionId : Guid.NewGuid(),
                            EventId = entity.Id,
                            DecisionDate = dDto.DecisionDate,
                            Status = dDto.Status,
                            Amount = dDto.Amount,
                            Currency = dDto.Currency,
                            CompensationTitle = dDto.CompensationTitle,
                            DocumentDescription = dDto.DocumentDescription,
                            DocumentName = dDto.DocumentName,
                            DocumentPath = dDto.DocumentPath,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            if (dto.DeletedAppealIds != null && dto.DeletedAppealIds.Any())
            {
                var toRemove = entity.Appeals
                    .Where(a => dto.DeletedAppealIds.Contains(a.Id))
                    .ToList();
                foreach (var r in toRemove) entity.Appeals.Remove(r);
            }

            if (dto.Appeals != null && dto.Appeals.Any())
            {
                foreach (var aDto in dto.Appeals)
                {
                    var hasId = aDto.Id.HasValue;
                    var appealId = aDto.Id ?? Guid.Empty;
                    var existing = hasId ? entity.Appeals.FirstOrDefault(a => a.Id == appealId) : null;
                    if (existing != null)
                    {
                        existing.SubmissionDate = aDto.SubmissionDate ?? existing.SubmissionDate;
                        existing.Reason = aDto.Reason;
                        existing.Status = aDto.Status;
                        existing.Notes = aDto.Notes;
                        existing.Description = aDto.Description;
                        existing.AppealNumber = aDto.AppealNumber;
                        existing.AppealAmount = aDto.AppealAmount;
                        existing.DecisionDate = aDto.DecisionDate;
                        existing.DecisionReason = aDto.DecisionReason;
                        existing.DocumentPath = aDto.DocumentPath;
                        existing.DocumentName = aDto.DocumentName;
                        existing.DocumentDescription = aDto.DocumentDescription;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        entity.Appeals.Add(new Appeal
                        {
                            Id = hasId ? appealId : Guid.NewGuid(),
                            EventId = entity.Id,
                            SubmissionDate = aDto.SubmissionDate ?? DateTime.UtcNow,
                            Reason = aDto.Reason,
                            Status = aDto.Status,
                            Notes = aDto.Notes,
                            Description = aDto.Description,
                            AppealNumber = aDto.AppealNumber,
                            AppealAmount = aDto.AppealAmount,
                            DecisionDate = aDto.DecisionDate,
                            DecisionReason = aDto.DecisionReason,
                            DocumentPath = aDto.DocumentPath,
                            DocumentName = aDto.DocumentName,
                            DocumentDescription = aDto.DocumentDescription,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            if (dto.ClientClaims != null)
            {
                var dtoIds = dto.ClientClaims
                    .Select(c =>
                    {
                        if (!string.IsNullOrEmpty(c.Id))
                        {
                            if (Guid.TryParse(c.Id, out var parsedId))
                            {
                                return (Guid?)parsedId;
                            }
                            else
                            {
                                throw new ArgumentException($"Invalid ClientClaim Id format: {c.Id}");
                            }
                        }
                        return null;
                    })
                    .Where(id => id.HasValue)
                    .Select(id => id.Value)
                    .ToHashSet();
                var toRemove = entity.ClientClaims.Where(c => !dtoIds.Contains(c.Id)).ToList();
                foreach (var r in toRemove) entity.ClientClaims.Remove(r);

                foreach (var cDto in dto.ClientClaims)
                {
                    Guid? claimId = null;
                    if (!string.IsNullOrEmpty(cDto.Id))
                    {
                        if (Guid.TryParse(cDto.Id, out var parsedId))
                        {
                            claimId = parsedId;
                        }
                        else
                        {
                            throw new ArgumentException($"Invalid ClientClaim Id format: {cDto.Id}");
                        }
                    }
                    var existing = claimId.HasValue ? entity.ClientClaims.FirstOrDefault(c => c.Id == claimId.Value) : null;
                    if (existing != null)
                    {
                        existing.ClaimNumber = cDto.ClaimNumber;
                        existing.ClaimDate = cDto.ClaimDate;
                        existing.ClaimType = cDto.ClaimType;
                        existing.ClaimAmount = cDto.ClaimAmount;
                        existing.Currency = cDto.Currency;
                        existing.Status = cDto.Status;
                        existing.Description = cDto.Description;
                        existing.DocumentPath = cDto.DocumentPath;
                        existing.DocumentName = cDto.DocumentName;
                        existing.DocumentDescription = cDto.DocumentDescription;
                        existing.ClaimNotes = cDto.ClaimNotes;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        entity.ClientClaims.Add(new ClientClaim
                        {
                            Id = claimId ?? Guid.NewGuid(),
                            EventId = entity.Id,
                            ClaimNumber = cDto.ClaimNumber,
                            ClaimDate = cDto.ClaimDate,
                            ClaimType = cDto.ClaimType,
                            ClaimAmount = cDto.ClaimAmount,
                            Currency = cDto.Currency,
                            Status = cDto.Status,
                            Description = cDto.Description,
                            DocumentPath = cDto.DocumentPath,
                            DocumentName = cDto.DocumentName,
                            DocumentDescription = cDto.DocumentDescription,
                            ClaimNotes = cDto.ClaimNotes,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            if (dto.Recourses != null)
            {
                var dtoIds = dto.Recourses
                    .Where(r => r.Id.HasValue)
                    .Select(r => r.Id.Value)
                    .ToHashSet();
                var toRemove = entity.Recourses.Where(r => !dtoIds.Contains(r.Id)).ToList();
                foreach (var r in toRemove) entity.Recourses.Remove(r);

                foreach (var rDto in dto.Recourses)
                {
                    var hasId = rDto.Id.HasValue;
                    var recourseId = rDto.Id ?? Guid.Empty;
                    var existing = hasId ? entity.Recourses.FirstOrDefault(r => r.Id == recourseId) : null;
                    if (existing != null)
                    {
                        existing.Status = rDto.Status;
                        existing.InitiationDate = rDto.InitiationDate;
                        existing.Description = rDto.Description;
                        existing.Notes = rDto.Notes;
                        existing.RecourseNumber = rDto.RecourseNumber;
                        existing.RecourseAmount = rDto.RecourseAmount;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        entity.Recourses.Add(new Recourse
                        {
                            Id = hasId ? recourseId : Guid.NewGuid(),
                            EventId = entity.Id,
                            Status = rDto.Status,
                            InitiationDate = rDto.InitiationDate,
                            Description = rDto.Description,
                            Notes = rDto.Notes,
                            RecourseNumber = rDto.RecourseNumber,
                            RecourseAmount = rDto.RecourseAmount,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            if (dto.Settlements != null)
            {
                var dtoIds = dto.Settlements
                    .Where(s => s.Id.HasValue)
                    .Select(s => s.Id.Value)
                    .ToHashSet();
                var toRemove = entity.Settlements.Where(s => !dtoIds.Contains(s.Id)).ToList();
                foreach (var r in toRemove) entity.Settlements.Remove(r);

                foreach (var sDto in dto.Settlements)
                {
                    var hasId = sDto.Id.HasValue;
                    var settlementId = sDto.Id ?? Guid.Empty;
                    var existing = hasId ? entity.Settlements.FirstOrDefault(s => s.Id == settlementId) : null;
                    if (existing != null)
                    {
                        existing.Status = sDto.Status;
                        existing.SettlementDate = sDto.SettlementDate;
                        existing.Amount = sDto.Amount;
                        existing.Currency = sDto.Currency;
                        existing.PaymentMethod = sDto.PaymentMethod;
                        existing.Notes = sDto.Notes;
                        existing.Description = sDto.Description;
                        existing.DocumentPath = sDto.DocumentPath;
                        existing.DocumentName = sDto.DocumentName;
                        existing.DocumentDescription = sDto.DocumentDescription;
                        existing.SettlementNumber = sDto.SettlementNumber;
                        existing.SettlementType = sDto.SettlementType;
                        existing.SettlementAmount = sDto.SettlementAmount;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        entity.Settlements.Add(new Settlement
                        {
                            Id = hasId ? settlementId : Guid.NewGuid(),
                            EventId = entity.Id,
                            Status = sDto.Status,
                            SettlementDate = sDto.SettlementDate,
                            Amount = sDto.Amount,
                            Currency = sDto.Currency,
                            PaymentMethod = sDto.PaymentMethod,
                            Notes = sDto.Notes,
                            Description = sDto.Description,
                            DocumentPath = sDto.DocumentPath,
                            DocumentName = sDto.DocumentName,
                            DocumentDescription = sDto.DocumentDescription,
                            SettlementNumber = sDto.SettlementNumber,
                            SettlementType = sDto.SettlementType,
                            SettlementAmount = sDto.SettlementAmount,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            entity.UpdatedAt = DateTime.UtcNow;
            if (entity.CreatedAt == default) entity.CreatedAt = DateTime.UtcNow;

            return entity;
        }

        private static Participant MapParticipantDtoToModel(ParticipantUpsertDto dto, Guid eventId)
        {
            return new Participant
            {
                Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
                EventId = eventId,
                Role = dto.Role,
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                City = dto.City,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                InsuranceCompany = dto.InsuranceCompany,
                PolicyNumber = dto.PolicyNumber,
                VehicleRegistration = dto.VehicleRegistration,
                VehicleVin = dto.VehicleVin,
                VehicleType = dto.VehicleType,
                VehicleBrand = dto.VehicleBrand,
                VehicleModel = dto.VehicleModel,
                VehicleYear = dto.VehicleYear,
                InspectionContactName = dto.InspectionContactName,
                InspectionContactPhone = dto.InspectionContactPhone,
                InspectionContactEmail = dto.InspectionContactEmail,
                IsAtFault = dto.IsAtFault,
                IsInjured = dto.IsInjured,
                InjuryDescription = dto.InjuryDescription,
                LicenseNumber = dto.LicenseNumber,
                LicenseClass = dto.LicenseClass,
                LicenseExpiryDate = dto.LicenseExpiryDate,
                DateOfBirth = dto.DateOfBirth,
                ParticipantType = dto.ParticipantType,
                ContactInfo = dto.ContactInfo,
                Notes = dto.Notes,
                UpdatedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow // Simplified
            };
        }

        private static Driver MapDriverDtoToModel(DriverUpsertDto dto, Guid eventId, Guid participantId)
        {
            return new Driver
            {
                Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid() : Guid.Parse(dto.Id),
                EventId = eventId,
                ParticipantId = participantId,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                LicenseNumber = dto.LicenseNumber,
                LicenseState = dto.LicenseState,
                LicenseExpirationDate = dto.LicenseExpirationDate,
                IsMainDriver = dto.IsMainDriver,
                UpdatedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow // Simplified
            };
        }

        private static Note MapNoteDtoToModel(NoteUpsertDto dto, Guid eventId)
        {
            return new Note
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                Category = dto.Category,
                Title = dto.Title,
                Content = dto.Content,
                CreatedBy = dto.CreatedBy,
                UpdatedBy = dto.CreatedBy,
                IsPrivate = dto.IsPrivate,
                Priority = dto.Priority,
                Tags = dto.Tags != null ? string.Join(",", dto.Tags) : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static Damage MapDamageDtoToModel(DamageUpsertDto dto, Guid eventId)
        {
            return new Damage
            {
                Id = dto.Id ?? Guid.NewGuid(),
                EventId = dto.EventId ?? eventId,
                Description = dto.Description,
                Detail = dto.Detail,
                Location = dto.Location,
                Severity = dto.Severity,
                EstimatedCost = dto.EstimatedCost,
                ActualCost = dto.ActualCost,
                RepairStatus = dto.RepairStatus,
                RepairDate = dto.RepairDate,
                RepairShop = dto.RepairShop,
                Notes = dto.Notes,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }


        private static Email MapEmailDtoToModel(EmailUpsertDto dto, Guid eventId)
        {
            return new Email
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                From = dto.From,
                To = dto.To,
                Cc = dto.Cc,
                Bcc = dto.Bcc,
                Subject = dto.Subject,
                Body = dto.Body,
                BodyHtml = dto.BodyHtml,
                IsHtml = dto.IsHtml,
                Priority = dto.Priority,
                Direction = dto.Direction,
                Status = dto.Status,
                SentAt = dto.SentAt,
                ReceivedAt = dto.ReceivedAt,
                ReadAt = dto.ReadAt,
                IsRead = dto.IsRead,
                IsImportant = dto.IsImportant,
                IsArchived = dto.IsArchived,
                Tags = dto.Tags,
                Category = dto.Category,
                ClaimId = dto.ClaimId,
                ClaimNumber = dto.ClaimNumber,
                ThreadId = dto.ThreadId,
                MessageId = dto.MessageId,
                InReplyTo = dto.InReplyTo,
                References = dto.References,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static Decision MapDecisionDtoToModel(DecisionDto dto, Guid eventId)
        {
            return new Decision
            {
                Id = Guid.TryParse(dto.Id, out var id) ? id : Guid.NewGuid(),
                EventId = Guid.TryParse(dto.EventId, out var eId) ? eId : eventId,
                DecisionDate = dto.DecisionDate,
                Status = dto.Status,
                Amount = dto.Amount,
                Currency = dto.Currency,
                CompensationTitle = dto.CompensationTitle,
                DocumentDescription = dto.DocumentDescription,
                DocumentName = dto.DocumentName,
                DocumentPath = dto.DocumentPath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static Appeal MapAppealDtoToModel(AppealUpsertDto dto, Guid eventId)
        {
            return new Appeal
            {
                Id = dto.Id ?? Guid.NewGuid(),
                EventId = dto.EventId ?? eventId,
                AppealNumber = dto.AppealNumber,
                SubmissionDate = dto.SubmissionDate ?? DateTime.UtcNow,
                Reason = dto.Reason,
                Status = dto.Status,
                Notes = dto.Notes,
                Description = dto.Description,
                AppealAmount = dto.AppealAmount,
                DecisionDate = dto.DecisionDate,
                DecisionReason = dto.DecisionReason,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static ClientClaim MapClientClaimDtoToModel(ClientClaimUpsertDto dto, Guid eventId, Guid? clientClaimId = null)
        {
            return new ClientClaim
            {
                Id = clientClaimId ?? Guid.NewGuid(),
                EventId = dto.EventId ?? eventId,
                ClaimNumber = dto.ClaimNumber,
                ClaimDate = dto.ClaimDate,
                ClaimType = dto.ClaimType,
                ClaimAmount = dto.ClaimAmount,
                Currency = dto.Currency,
                Status = dto.Status,
                Description = dto.Description,
                DocumentPath = dto.DocumentPath,
                DocumentName = dto.DocumentName,
                DocumentDescription = dto.DocumentDescription,
                ClaimNotes = dto.ClaimNotes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static Recourse MapRecourseDtoToModel(RecourseUpsertDto dto, Guid eventId)
        {
            return new Recourse
            {
                Id = dto.Id ?? Guid.NewGuid(),
                EventId = dto.EventId ?? eventId,
                Status = dto.Status,
                InitiationDate = dto.InitiationDate,
                Description = dto.Description,
                Notes = dto.Notes,
                RecourseNumber = dto.RecourseNumber,
                RecourseAmount = dto.RecourseAmount,
                IsJustified = dto.IsJustified ?? false,
                FilingDate = dto.FilingDate ?? DateTime.UtcNow,
                InsuranceCompany = dto.InsuranceCompany ?? string.Empty,
                ObtainDate = dto.ObtainDate,
                Amount = dto.Amount,
                CurrencyCode = dto.CurrencyCode,
                DocumentPath = dto.DocumentPath,
                DocumentName = dto.DocumentName,
                DocumentDescription = dto.DocumentDescription,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static Settlement MapSettlementDtoToModel(SettlementUpsertDto dto, Guid eventId)
        {
            return new Settlement
            {
                Id = dto.Id ?? Guid.NewGuid(),
                EventId = dto.EventId ?? eventId,
                SettlementNumber = dto.SettlementNumber,
                SettlementType = dto.SettlementType,
                ExternalEntity = dto.ExternalEntity,
                CustomExternalEntity = dto.CustomExternalEntity,
                TransferDate = dto.TransferDate,
                Status = dto.Status,
                SettlementDate = dto.SettlementDate,
                Amount = dto.Amount,
                SettlementAmount = dto.SettlementAmount,
                Currency = dto.Currency,
                PaymentMethod = dto.PaymentMethod,
                Notes = dto.Notes,
                Description = dto.Description,
                DocumentPath = dto.DocumentPath,
                DocumentName = dto.DocumentName,
                DocumentDescription = dto.DocumentDescription,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static ClaimDto MapEventToDto(Event e) => new ClaimDto
        {
            Id = e.Id.ToString(),
            ClaimNumber = e.ClaimNumber,
            SpartaNumber = e.SpartaNumber,
            InsurerClaimNumber = e.InsurerClaimNumber,
            VehicleNumber = e.VehicleNumber,
            Brand = e.Brand,
            Model = e.Model,
            Owner = e.Owner,
            InsuranceCompanyId = e.InsuranceCompanyId,
            InsuranceCompany = e.InsuranceCompany,
            InsuranceCompanyPhone = e.InsuranceCompanyPhone,
            InsuranceCompanyEmail = e.InsuranceCompanyEmail,
            PolicyNumber = e.PolicyNumber,
            Status = e.Status,
            DamageDate = e.DamageDate,
            ReportDate = e.ReportDate,
            ReportDateToInsurer = e.ReportDateToInsurer,
            TotalClaim = e.TotalClaim,
            Payout = e.Payout,
            Currency = e.Currency,
            RiskType = e.RiskType,
            DamageType = e.DamageType,
            Liquidator = e.Liquidator,
            ClientId = e.ClientId,
            Client = e.Client,
            ReportingChannel = e.ReportingChannel,
            LeasingCompanyId = e.LeasingCompanyId,
            LeasingCompany = e.LeasingCompany,
            LeasingCompanyPhone = e.LeasingCompanyPhone,
            LeasingCompanyEmail = e.LeasingCompanyEmail,
            HandlerId = e.HandlerId,
            Handler = e.Handler,
            HandlerEmail = e.HandlerEmail,
            HandlerPhone = e.HandlerPhone,
            EventTime = e.EventTime,
            EventLocation = e.EventLocation,
            EventDescription = e.EventDescription,
            Comments = e.Comments,
            Area = e.Area,
            WereInjured = e.WereInjured ?? false,
            StatementWithPerpetrator = e.StatementWithPerpetrator ?? false,
            PerpetratorFined = e.PerpetratorFined ?? false,
            ServicesCalled = e.ServicesCalled?.Split(',', StringSplitOptions.RemoveEmptyEntries),
            PoliceUnitDetails = e.PoliceUnitDetails,
            VehicleType = e.VehicleType,
            DamageDescription = e.DamageDescription,
            Description = e.Description,
            RowVersion = e.RowVersion,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt,
            Participants = e.Participants.Select(p => new ParticipantDto
            {
                Id = p.Id.ToString(),
                EventId = p.EventId.ToString(),
                Role = p.Role,
                Name = p.Name,
                Phone = p.Phone,
                Email = p.Email,
                Address = p.Address,
                City = p.City,
                PostalCode = p.PostalCode,
                Country = p.Country,
                InsuranceCompany = p.InsuranceCompany,
                PolicyNumber = p.PolicyNumber,
                VehicleRegistration = p.VehicleRegistration,
                VehicleVin = p.VehicleVin,
                VehicleType = p.VehicleType,
                VehicleBrand = p.VehicleBrand,
                VehicleModel = p.VehicleModel,
                VehicleYear = p.VehicleYear,
                InspectionContactName = p.InspectionContactName,
                InspectionContactPhone = p.InspectionContactPhone,
                InspectionContactEmail = p.InspectionContactEmail,
                IsAtFault = p.IsAtFault,
                IsInjured = p.IsInjured,
                Drivers = p.Drivers.Select(d => new DriverDto
                {
                    Id = d.Id.ToString(),
                    ParticipantId = d.ParticipantId.ToString(),
                    FirstName = d.FirstName,
                    LastName = d.LastName,
                    Phone = d.Phone,
                    LicenseNumber = d.LicenseNumber,
                    LicenseState = d.LicenseState,
                    LicenseExpirationDate = d.LicenseExpirationDate,
                    IsMainDriver = d.IsMainDriver
                }).ToList()
            }).ToList(),
            Documents = e.Documents.Select(d => new DocumentDto
            {
                Id = d.Id,
                EventId = d.EventId,
                FileName = d.FileName,
                OriginalFileName = d.OriginalFileName,
                FilePath = d.FilePath,
                FileSize = d.FileSize,
                ContentType = d.ContentType,
                Category = d.DocumentType,
                Description = d.Description,
                UploadedBy = d.UploadedBy,
                IsActive = !d.IsDeleted,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                DownloadUrl = $"/api/documents/{d.Id}/download",
                PreviewUrl = $"/api/documents/{d.Id}/preview",
                CanPreview = true
            }).ToList(),
            Damages = e.Damages.Select(d => new DamageDto
            {
                Id = d.Id.ToString(),
                EventId = d.EventId.ToString(),
                Description = d.Description,
                Detail = d.Detail,
                Location = d.Location,
                Severity = d.Severity,
                EstimatedCost = d.EstimatedCost,
                ActualCost = d.ActualCost,
                RepairStatus = d.RepairStatus,
                RepairDate = d.RepairDate,
                RepairShop = d.RepairShop,
                Notes = d.Notes,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList(),
            Appeals = e.Appeals.Select(a => new AppealDto
            {
                Id = a.Id.ToString(),
                EventId = a.EventId.ToString(),
                SubmissionDate = a.SubmissionDate,
                Reason = a.Reason,
                Status = a.Status,
                Notes = a.Notes,
                Description = a.Description,
                AppealNumber = a.AppealNumber,
                AppealAmount = a.AppealAmount,
                DecisionDate = a.DecisionDate,
                DecisionReason = a.DecisionReason,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            }).ToList(),
            ClientClaims = e.ClientClaims.Select(c => new ClientClaimDto
            {
                Id = c.Id.ToString(),
                EventId = c.EventId.ToString(),
                ClaimAmount = c.ClaimAmount,
                ClaimDate = c.ClaimDate,
                Status = c.Status,
                Description = c.Description,
                ClaimNotes = c.ClaimNotes,
                ClaimNumber = c.ClaimNumber,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList(),
            Decisions = e.Decisions.Select(d => new DecisionDto
            {
                Id = d.Id.ToString(),
                EventId = d.EventId.ToString(),
                DecisionDate = d.DecisionDate,
                Status = d.Status,
                Amount = d.Amount,
                Currency = d.Currency,
                CompensationTitle = d.CompensationTitle,
                DocumentDescription = d.DocumentDescription,
                DocumentName = d.DocumentName,
                DocumentPath = d.DocumentPath,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList(),
            Recourses = e.Recourses.Select(r => new RecourseDto
            {
                Id = r.Id.ToString(),
                EventId = r.EventId.ToString(),
                Status = r.Status,
                InitiationDate = r.InitiationDate,
                Description = r.Description,
                Notes = r.Notes,
                RecourseNumber = r.RecourseNumber,
                RecourseAmount = r.RecourseAmount,
                IsJustified = r.IsJustified,
                FilingDate = r.FilingDate,
                InsuranceCompany = r.InsuranceCompany,
                ObtainDate = r.ObtainDate,
                Amount = r.Amount,
                CurrencyCode = r.CurrencyCode,
                DocumentPath = r.DocumentPath,
                DocumentName = r.DocumentName,
                DocumentDescription = r.DocumentDescription,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList(),
            Settlements = e.Settlements.Select(s => new SettlementDto
            {
                Id = s.Id.ToString(),
                EventId = s.EventId.ToString(),
                Status = s.Status,
                SettlementDate = s.SettlementDate,
                Amount = s.Amount,
                Currency = s.Currency,
                PaymentMethod = s.PaymentMethod,
                Notes = s.Notes,
                Description = s.Description,
                SettlementNumber = s.SettlementNumber,
                SettlementType = s.SettlementType,
                SettlementAmount = s.SettlementAmount,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            }).ToList(),
            Notes = e.Notes.Select(n => new NoteDto
            {
                Id = n.Id.ToString(),
                EventId = n.EventId.ToString(),
                Category = n.Category,
                Title = n.Title,
                Content = n.Content,
                CreatedBy = n.CreatedBy,
                UpdatedBy = n.UpdatedBy,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                IsPrivate = n.IsPrivate,
                Priority = n.Priority,
                Tags = string.IsNullOrEmpty(n.Tags) ? null : n.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
            }).ToList()
        };
    }
}
