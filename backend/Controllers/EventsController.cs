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
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EventsController> _logger;

        public EventsController(ApplicationDbContext context, ILogger<EventsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventListItemDto>>> GetEvents(
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

                if (!string.IsNullOrEmpty(clientId))
                {
                    query = query.Where(e => e.Client == clientId);
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
                    .Select(e => new EventListItemDto
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
                        Client = e.Client,
                        Liquidator = e.Liquidator,
                        PolicyNumber = e.PolicyNumber,
                        InsuranceCompany = e.InsuranceCompany
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
        public async Task<ActionResult<EventDto>> GetEvent(Guid id)
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

        [HttpPost]
        public async Task<ActionResult<EventDto>> CreateEvent(EventUpsertDto eventDto)
        {
            try
            {
                var eventEntity = MapUpsertDtoToEvent(eventDto);
                eventEntity.Id = Guid.NewGuid();
                eventEntity.CreatedAt = DateTime.UtcNow;
                eventEntity.UpdatedAt = DateTime.UtcNow;

                _context.Events.Add(eventEntity);

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

                var createdEventDto = MapEventToDto(createdEvent!);
                return CreatedAtAction(nameof(GetEvent), new { id = eventEntity.Id }, createdEventDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating event");
                return StatusCode(500, new { error = "An error occurred while creating the event" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(Guid id, EventUpsertDto eventDto)
        {
            try
            {
                var eventEntity = await _context.Events
                    .Include(e => e.Participants).ThenInclude(p => p.Drivers)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (eventEntity == null)
                {
                    return NotFound(new { error = "Event not found" });
                }

                MapUpsertDtoToEvent(eventDto, eventEntity);
                eventEntity.UpdatedAt = DateTime.UtcNow;

                // Remove existing participants and drivers
                var existingDrivers = eventEntity.Participants.SelectMany(p => p.Drivers).ToList();
                _context.Drivers.RemoveRange(existingDrivers);
                _context.Participants.RemoveRange(eventEntity.Participants);

                // Add new participants
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

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating event {EventId}", id);
                return StatusCode(500, new { error = "An error occurred while updating the event" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            try
            {
                var eventEntity = await _context.Events.FindAsync(id);
                if (eventEntity == null)
                {
                    return NotFound(new { error = "Event not found" });
                }

                _context.Events.Remove(eventEntity);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting event {EventId}", id);
                return StatusCode(500, new { error = "An error occurred while deleting the event" });
            }
        }

        private static Event MapUpsertDtoToEvent(EventUpsertDto dto, Event? entity = null)
        {
            entity ??= new Event();

            entity.ClaimNumber = dto.ClaimNumber;
            entity.SpartaNumber = dto.SpartaNumber;
            entity.InsurerClaimNumber = dto.InsurerClaimNumber;
            entity.VehicleNumber = dto.VehicleNumber;
            entity.Brand = dto.Brand;
            entity.Model = dto.Model;
            entity.Owner = dto.Owner;
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
            entity.Client = dto.Client;
            entity.ReportingChannel = dto.ReportingChannel;
            entity.LeasingCompany = dto.LeasingCompany;
            entity.LeasingCompanyPhone = dto.LeasingCompanyPhone;
            entity.LeasingCompanyEmail = dto.LeasingCompanyEmail;
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

        private static EventDto MapEventToDto(Event e) => new EventDto
        {
            Id = e.Id.ToString(),
            ClaimNumber = e.ClaimNumber,
            SpartaNumber = e.SpartaNumber,
            InsurerClaimNumber = e.InsurerClaimNumber,
            VehicleNumber = e.VehicleNumber,
            Brand = e.Brand,
            Model = e.Model,
            Owner = e.Owner,
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
            Client = e.Client,
            ReportingChannel = e.ReportingChannel,
            LeasingCompany = e.LeasingCompany,
            LeasingCompanyPhone = e.LeasingCompanyPhone,
            LeasingCompanyEmail = e.LeasingCompanyEmail,
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
                DecisionType = d.DecisionType,
                DecisionDescription = d.DecisionDescription,
                DecisionAmount = d.DecisionAmount,
                DecisionStatus = d.DecisionStatus,
                DecisionNumber = d.DecisionNumber,
                Description = d.Description,
                Reason = d.Reason,
                Notes = d.Notes,
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
