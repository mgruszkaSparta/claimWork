using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.Models.Dictionary;
using AutomotiveClaimsApi.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using AutomotiveClaimsApi.Services;
using AutomotiveClaimsApi.Services.EventSearch;
using AutomotiveClaimsApi.Common;

using Microsoft.AspNetCore.Http;

using Microsoft.Extensions.Configuration;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,User")]
    public class ClaimsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClaimsController> _logger;
        private readonly UserManager<ApplicationUser>? _userManager;
        private readonly INotificationService? _notificationService;
        private readonly IEmailSender? _emailSender;
        private readonly IDocumentService _documentService;
        private readonly IConfiguration _config;
        private readonly IEventDocumentStore _eventDocumentStore;
        private readonly IMobileNotificationStore? _mobileNotificationStore;
        private readonly IPushSubscriptionStore? _pushSubscriptionStore;
        private readonly IPushNotificationService? _pushNotificationService;

        public ClaimsController(
            ApplicationDbContext context,
            ILogger<ClaimsController> logger,
            IConfiguration config,
            UserManager<ApplicationUser>? userManager = null,
            INotificationService? notificationService = null,
            IEmailSender? emailSender = null,
            IDocumentService? documentService = null,
            IEventDocumentStore? eventDocumentStore = null,
            IMobileNotificationStore? mobileNotificationStore = null,
            IPushSubscriptionStore? pushSubscriptionStore = null,
            IPushNotificationService? pushNotificationService = null)
        {
            _context = context;
            _logger = logger;
            _config = config;
            _userManager = userManager;
            _notificationService = notificationService;
            _emailSender = emailSender;
            _documentService = documentService ?? throw new ArgumentNullException(nameof(documentService));
            _eventDocumentStore = eventDocumentStore ?? throw new ArgumentNullException(nameof(eventDocumentStore));
            _mobileNotificationStore = mobileNotificationStore;
            _pushSubscriptionStore = pushSubscriptionStore;
            _pushNotificationService = pushNotificationService;
        }

        private static Guid EnsureClaimId(Guid? id)
        {
            return !id.HasValue || id == Guid.Empty ? Guid.NewGuid() : id.Value;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClaimListItemDto>>> GetClaims(
            [FromQuery] string? search = null,
            [FromQuery] string? clientId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? riskType = null,
            [FromQuery] string? policyNumber = null,
            [FromQuery] int? caseHandlerId = null,
            [FromQuery] string? registeredById = null,
            [FromQuery] DateTime? damageDate = null,
            [FromQuery] DateTime? reportFromDate = null,
            [FromQuery] DateTime? reportToDate = null,
            [FromQuery] DateTime? damageFromDate = null,
            [FromQuery] DateTime? damageToDate = null,
            [FromQuery] DateTime? registrationFromDate = null,
            [FromQuery] DateTime? registrationToDate = null,
            [FromQuery] DateTime? reportToInsurerFromDate = null,
            [FromQuery] DateTime? reportToInsurerToDate = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? sortBy = "spartaNumber",
            [FromQuery] string? sortOrder = "desc")
        {
            try
            {
                var query = _context.Events.AsQueryable().Where(e => !e.IsDraft);

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                ApplicationUser? currentUser = null;

                if (!string.IsNullOrEmpty(userId))
                {
                    if (_userManager != null)
                    {
                        currentUser = await _userManager.Users
                            .Include(u => u.UserClients)
                            .FirstOrDefaultAsync(u => u.Id == userId);
                    }
                    else
                    {
                        currentUser = await _context.Users
                            .Include(u => u.UserClients)
                            .FirstOrDefaultAsync(u => u.Id == userId);
                    }

                    if (currentUser != null)
                    {
                        var allowedClients = currentUser.UserClients.Select(uc => uc.ClientId).ToList();
                        if (allowedClients.Any())
                        {
                            query = query.Where(e => e.ClientId != null && allowedClients.Contains(e.ClientId.Value));
                        }
                        else if (!currentUser.FullAccess)
                        {
                            query = query.Where(e => false);
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var ids = await _eventDocumentStore.SearchAsync(search);
                    if (ids.Count == 0)
                    {
                        Response.Headers.Append("X-Total-Count", "0");
                        return Ok(Array.Empty<ClaimListItemDto>());
                    }
                    query = query.Where(e => ids.Contains(e.Id));
                }

                if (!string.IsNullOrEmpty(clientId) && int.TryParse(clientId, out var clientIdValue))
                {
                    query = query.Where(e => e.ClientId == clientIdValue);
                }

                if (!string.IsNullOrEmpty(status) && int.TryParse(status, out var statusId))
                {
                    query = query.Where(e => e.ClaimStatusId == statusId);
                }

                if (!string.IsNullOrEmpty(riskType))
                {
                    query = query.Where(e => e.RiskType == riskType);
                }

                if (!string.IsNullOrEmpty(policyNumber))
                {
                    query = query.Where(e => e.PolicyNumber != null && e.PolicyNumber.Contains(policyNumber));
                }

                if (caseHandlerId.HasValue)
                {
                    query = query.Where(e => e.HandlerId == caseHandlerId.Value);
                }

                if (!string.IsNullOrEmpty(registeredById))
                {
                    query = query.Where(e => e.RegisteredById == registeredById);
                }

                if (damageDate.HasValue)
                {
                    var date = damageDate.Value.Date;
                    query = query.Where(e => e.DamageDate.HasValue && e.DamageDate.Value.Date == date);
                }

                if (reportFromDate.HasValue)
                {
                    var from = reportFromDate.Value.Date;
                    query = query.Where(e => e.ReportDate.HasValue && e.ReportDate.Value.Date >= from);
                }

                if (reportToDate.HasValue)
                {
                    var to = reportToDate.Value.Date;
                    query = query.Where(e => e.ReportDate.HasValue && e.ReportDate.Value.Date <= to);
                }

                if (damageFromDate.HasValue)
                {
                    var from = damageFromDate.Value.Date;
                    query = query.Where(e => e.DamageDate.HasValue && e.DamageDate.Value.Date >= from);
                }

                if (damageToDate.HasValue)
                {
                    var to = damageToDate.Value.Date;
                    query = query.Where(e => e.DamageDate.HasValue && e.DamageDate.Value.Date <= to);
                }

                if (registrationFromDate.HasValue)
                {
                    var from = registrationFromDate.Value.Date;
                    query = query.Where(e => e.CreatedAt.Date >= from);
                }

                if (registrationToDate.HasValue)
                {
                    var to = registrationToDate.Value.Date;
                    query = query.Where(e => e.CreatedAt.Date <= to);
                }

                if (reportToInsurerFromDate.HasValue)
                {
                    var from = reportToInsurerFromDate.Value.Date;
                    query = query.Where(e => e.ReportDateToInsurer.HasValue && e.ReportDateToInsurer.Value.Date >= from);
                }

                if (reportToInsurerToDate.HasValue)
                {
                    var to = reportToInsurerToDate.Value.Date;
                    query = query.Where(e => e.ReportDateToInsurer.HasValue && e.ReportDateToInsurer.Value.Date <= to);
                }

                if (fromDate.HasValue)
                {
                    var from = fromDate.Value.Date;
                    query = query.Where(e =>
                        (e.ReportDate.HasValue && e.ReportDate.Value.Date >= from) ||
                        (e.DamageDate.HasValue && e.DamageDate.Value.Date >= from) ||
                        e.CreatedAt.Date >= from);
                }

                if (toDate.HasValue)
                {
                    var to = toDate.Value.Date;
                    query = query.Where(e =>
                        (e.ReportDate.HasValue && e.ReportDate.Value.Date <= to) ||
                        (e.DamageDate.HasValue && e.DamageDate.Value.Date <= to) ||
                        e.CreatedAt.Date <= to);
                }

                var totalCount = await query.CountAsync();

                if (!string.IsNullOrEmpty(sortBy))
                {
                    // Treat any sort order other than an explicit "asc" as descending.
                    bool desc = sortOrder == null || sortOrder.ToLower() != "asc";
                    query = sortBy switch
                    {
                        "spartaNumber" => desc ? query.OrderByDescending(e => e.SpartaNumber) : query.OrderBy(e => e.SpartaNumber),
                        "damageType" => desc ? query.OrderByDescending(e => e.DamageType) : query.OrderBy(e => e.DamageType),
                        "insurerClaimNumber" => desc ? query.OrderByDescending(e => e.InsurerClaimNumber) : query.OrderBy(e => e.InsurerClaimNumber),
                        "claimNumber" => desc ? query.OrderByDescending(e => e.ClaimNumber) : query.OrderBy(e => e.ClaimNumber),
                        "vehicleNumber" => desc ? query.OrderByDescending(e => e.VehicleNumber) : query.OrderBy(e => e.VehicleNumber),
                        "handler" => desc ? query.OrderByDescending(e => e.Handler) : query.OrderBy(e => e.Handler),
                        "client" => desc ? query.OrderByDescending(e => e.Client) : query.OrderBy(e => e.Client),
                        "reportDate" => desc ? query.OrderByDescending(e => e.ReportDate) : query.OrderBy(e => e.ReportDate),
                        "riskType" => desc ? query.OrderByDescending(e => e.RiskType) : query.OrderBy(e => e.RiskType),
                        "status" => desc ? query.OrderByDescending(e => e.Status) : query.OrderBy(e => e.Status),
                        _ => desc ? query.OrderByDescending(e => e.SpartaNumber) : query.OrderBy(e => e.SpartaNumber),
                    };
                }
                else
                {
                    query = query.OrderByDescending(e => e.SpartaNumber);
                }

                var events = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(e => new ClaimListItemDto
                    {
                        Id = e.Id.ToString(),
                        ClaimNumber = e.ClaimNumber,
                        SpartaNumber = e.SpartaNumber,
                        VehicleNumber = e.VehicleNumber,
                        VictimRegistrationNumber = e.VictimRegistrationNumber,
                        PerpetratorRegistrationNumber = e.PerpetratorRegistrationNumber,
                        Brand = e.Brand,
                        Model = e.Model,
                        Owner = e.Owner,
                        Status = e.Status,
                        ClaimStatusId = e.ClaimStatusId,
                        IsDraft = e.IsDraft,
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
                        InsurerClaimNumber = e.InsurerClaimNumber,
                        ReportDate = e.ReportDate,
                        RiskType = e.RiskType,
                        DamageType = e.DamageType,
                        ObjectTypeId = e.ObjectTypeId,
                        LeasingCompanyId = e.LeasingCompanyId,
                        LeasingCompany = e.LeasingCompany,
                        HandlerId = e.HandlerId,
                        Handler = e.Handler,
                        RegisteredById = e.RegisteredById,
                        RegisteredByName = e.RegisteredBy != null ? e.RegisteredBy.UserName : null
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
                    .Include(e => e.RegisteredBy)
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
                var id = Guid.NewGuid();
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var draftEvent = new Event
                {
                    Id = id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    RegisteredById = userId,
                    IsDraft = true
                };

                _context.Events.Add(draftEvent);
                await _context.SaveChangesAsync();

                return Ok(new { id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing event id");
                return StatusCode(500, new { error = "Failed to initialize event id" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ClaimDto>> CreateClaim([FromBody] ClaimUpsertDto eventDto)
        {
            try
            {
                var claimId = EnsureClaimId(eventDto.Id);
                eventDto.Id = claimId;

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                ApplicationUser? currentUser = null;
                bool isHandler = false;

                if (_userManager != null)
                {
                    currentUser = await _userManager.GetUserAsync(User);
                    if (currentUser != null)
                    {
                        isHandler = await _userManager.IsInRoleAsync(currentUser, "Admin") ||
                                   await _userManager.IsInRoleAsync(currentUser, "ClaimHandler");
                    }
                }

                CaseHandler? handler = null;
                var hasAssignedHandler = false;
                if (eventDto.HandlerId.HasValue)
                {
                    handler = await _context.CaseHandlers.FindAsync(eventDto.HandlerId.Value);
                    hasAssignedHandler = true;
                }
                else if (currentUser?.CaseHandlerId != null)
                {
                    handler = await _context.CaseHandlers.FindAsync(currentUser.CaseHandlerId.Value);
                    hasAssignedHandler = true;
                }

                var statusId = (hasAssignedHandler || isHandler)
                    ? (int)ClaimStatusCode.New
                    : (int)ClaimStatusCode.ToAssign;
                var statusEntity = await _context.ClaimStatuses.FindAsync(statusId);

                var existingEvent = await _context.Events
                    .AsSplitQuery()
                    .Include(e => e.Participants).ThenInclude(p => p.Drivers)
                    .Include(e => e.Damages)
                    .Include(e => e.Appeals)
                    .Include(e => e.ClientClaims)
                    .Include(e => e.Decisions)
                    .Include(e => e.Recourses)
                    .Include(e => e.Settlements)
                    .Include(e => e.Emails)
                    .Include(e => e.Notes)
                    .FirstOrDefaultAsync(e => e.Id == eventDto.Id.Value);

                if (existingEvent != null)
                {
                    await UpsertClaimAsync(existingEvent, eventDto);
                    existingEvent.UpdatedAt = DateTime.UtcNow;
                    existingEvent.IsDraft = false;

                    if (string.IsNullOrEmpty(existingEvent.RegisteredById))
                    {
                        existingEvent.RegisteredById = userId;
                    }

                    if (handler != null)
                    {
                        existingEvent.HandlerId = handler.Id;
                        existingEvent.Handler = handler.Name;
                        existingEvent.HandlerEmail = handler.Email;
                        existingEvent.HandlerPhone = handler.Phone;
                    }
                    else if (isHandler && currentUser != null)
                    {
                        existingEvent.Handler = currentUser.UserName;
                        existingEvent.HandlerEmail = currentUser.Email;
                    }

                    if (string.IsNullOrEmpty(existingEvent.SpartaNumber))
                    {
                        existingEvent.SpartaNumber = await GenerateNextSpartaNumber();
                    }

                    if (statusEntity != null)
                    {
                        if (!existingEvent.ClaimStatusId.HasValue)
                        {
                            existingEvent.ClaimStatusId = statusEntity.Id;
                        }
                        if (string.IsNullOrWhiteSpace(existingEvent.Status))
                        {
                            existingEvent.Status = statusEntity.Name;
                        }
                    }

                    await _context.SaveChangesAsync();

                    if (handler != null && hasAssignedHandler && _emailSender != null)
                    {
                        var baseUrl = (_config["App:BaseUrl"] ?? string.Empty).TrimEnd('/');
                        var claimIdValue = existingEvent.Id;
                        var claimIdentifier = existingEvent.ClaimNumber ?? existingEvent.SpartaNumber ?? claimIdValue.ToString();
                        var claimLink = $"{baseUrl}/claims/{claimIdValue}";
                        await _emailSender.SendEmailAsync(handler.Email, $"Claim assigned: {claimIdentifier}", $"Claim {claimIdentifier} has been assigned to you. View it at {claimLink}");
                    }

                    if (!isHandler && currentUser != null)
                    {
                        var claimIdentifier = existingEvent.ClaimNumber ?? existingEvent.SpartaNumber ?? existingEvent.Id.ToString();
                    _mobileNotificationStore?.Add(new MobileNotificationDto
                    {
                        Title = "Nowa szkoda",
                        Message = $"Dodano nowe zgłoszenie szkody {claimIdentifier}",
                        Type = "success",
                        ClaimId = claimIdentifier,
                        ActionType = "new_claim"
                    });

                    if (_pushSubscriptionStore != null && _pushNotificationService != null)
                    {
                        var subs = _pushSubscriptionStore.GetAll();
                        await _pushNotificationService.SendAsync(subs, "Nowa szkoda", $"Dodano nowe zgłoszenie szkody {claimIdentifier}");
                    }

                    if (_notificationService != null)
                    {
                        await _notificationService.NotifyAsync(existingEvent, currentUser, ClaimNotificationEvent.ClaimCreated);
                    }
                    }

                    await _eventDocumentStore.SaveAsync(existingEvent);

                    return Ok(MapEventToDto(existingEvent));
                }

                var eventEntity = new Event
                {
                    Id = eventDto.Id.Value,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    RegisteredById = userId,
                    IsDraft = false
                };

                await UpsertClaimAsync(eventEntity, eventDto);

                if (handler != null)
                {
                    eventEntity.HandlerId = handler.Id;
                    eventEntity.Handler = handler.Name;
                    eventEntity.HandlerEmail = handler.Email;
                    eventEntity.HandlerPhone = handler.Phone;
                }
                else if (isHandler && currentUser != null)
                {
                    eventEntity.Handler = currentUser.UserName;
                    eventEntity.HandlerEmail = currentUser.Email;
                }

                if (string.IsNullOrEmpty(eventEntity.SpartaNumber))
                {
                    eventEntity.SpartaNumber = await GenerateNextSpartaNumber();
                }

                if (statusEntity != null)
                {
                    if (!eventEntity.ClaimStatusId.HasValue)
                    {
                        eventEntity.ClaimStatusId = statusEntity.Id;
                    }
                    if (string.IsNullOrWhiteSpace(eventEntity.Status))
                    {
                        eventEntity.Status = statusEntity.Name;
                    }
                }

                _context.Events.Add(eventEntity);
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
                    .Include(e => e.RegisteredBy)
                    .FirstOrDefaultAsync(e => e.Id == eventEntity.Id);

                if (!isHandler && currentUser != null && createdEvent != null)
                {
                    var claimIdentifier = createdEvent.ClaimNumber ?? createdEvent.SpartaNumber ?? createdEvent.Id.ToString();
                    _mobileNotificationStore?.Add(new MobileNotificationDto
                    {
                        Title = "Nowa szkoda",
                        Message = $"Dodano nowe zgłoszenie szkody {claimIdentifier}",
                        Type = "success",
                        ClaimId = claimIdentifier,
                        ActionType = "new_claim"
                    });

                    if (_pushSubscriptionStore != null && _pushNotificationService != null)
                    {
                        var subs = _pushSubscriptionStore.GetAll();
                        await _pushNotificationService.SendAsync(subs, "Nowa szkoda", $"Dodano nowe zgłoszenie szkody {claimIdentifier}");
                    }

                    if (_notificationService != null)
                    {
                        await _notificationService.NotifyAsync(createdEvent, currentUser, ClaimNotificationEvent.ClaimCreated);
                    }
                }

                if (createdEvent != null)
                {
                    await _eventDocumentStore.SaveAsync(createdEvent);
                }

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
                var existing = await _context.Events
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.Id == id);
                var previousHandlerId = existing?.HandlerId;

                ApplicationUser? currentUser = null;
                bool isHandler = false;
                if (_userManager != null)
                {
                    currentUser = await _userManager.GetUserAsync(User);
                    if (currentUser != null)
                    {
                        isHandler = await _userManager.IsInRoleAsync(currentUser, "Admin") ||
                                   await _userManager.IsInRoleAsync(currentUser, "ClaimHandler");
                    }
                }

                CaseHandler? handler = null;
                if (eventDto.HandlerId.HasValue)
                {
                    handler = await _context.CaseHandlers.FindAsync(eventDto.HandlerId.Value);
                }
                else if (currentUser?.CaseHandlerId != null)
                {
                    handler = await _context.CaseHandlers.FindAsync(currentUser.CaseHandlerId.Value);
                }

                var isNew = existing == null;

                if (isNew)
                {
                    existing = new Event
                    {
                        Id = id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Events.Add(existing);
                }
                else
                {
                    existing.Participants = await _context.Participants
                        .Where(p => p.EventId == id)
                        .Include(p => p.Drivers)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.Participants)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                        foreach (var driver in entity.Drivers)
                        {
                            _context.Entry(driver).State = EntityState.Detached;
                        }
                    }

                    existing.Damages = await _context.Damages
                        .Where(d => d.EventId == id)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.Damages)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                    }

                    existing.Appeals = await _context.Appeals
                        .Where(a => a.EventId == id)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.Appeals)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                    }

                    existing.ClientClaims = await _context.ClientClaims
                        .Where(c => c.EventId == id)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.ClientClaims)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                    }

                    existing.Decisions = await _context.Decisions
                        .Where(d => d.EventId == id)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.Decisions)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                    }

                    existing.Recourses = await _context.Recourses
                        .Where(r => r.EventId == id)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.Recourses)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                    }

                    existing.Settlements = await _context.Settlements
                        .Where(s => s.EventId == id)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.Settlements)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                    }

                    existing.Notes = await _context.Notes
                        .Where(n => n.EventId == id)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.Notes)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                    }

                    existing.Emails = await _context.Emails
                        .Where(e => e.EventId == id)
                        .AsNoTracking()
                        .ToListAsync();
                    foreach (var entity in existing.Emails)
                    {
                        _context.Entry(entity).State = EntityState.Detached;
                    }

                    _context.Entry(existing).State = EntityState.Detached;
                }

                var originalStatus = existing.Status;

                await UpsertClaimAsync(existing, eventDto);

                if (handler != null)
                {
                    existing.HandlerId = handler.Id;
                    existing.Handler = handler.Name;
                    existing.HandlerEmail = handler.Email;
                    existing.HandlerPhone = handler.Phone;
                }
                else if (isHandler && currentUser != null)
                {
                    existing.Handler = currentUser.UserName;
                    existing.HandlerEmail = currentUser.Email;
                }

                await _context.SaveChangesAsync();

                if (_emailSender != null && handler != null && previousHandlerId == null && existing.HandlerId != null)
                {
                    var baseUrl = (_config["App:BaseUrl"] ?? string.Empty).TrimEnd('/');
                    var claimIdValue = existing.Id;
                    var claimIdentifier = existing.ClaimNumber ?? existing.SpartaNumber ?? claimIdValue.ToString();
                    var claimLink = $"{baseUrl}/claims/{claimIdValue}";
                    await _emailSender.SendEmailAsync(handler.Email, $"Claim assigned: {claimIdentifier}", $"Claim {claimIdentifier} has been assigned to you. View it at {claimLink}");
                }

                var updatedEvent = await _context.Events
                    .AsSplitQuery()
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
                    .Include(e => e.RegisteredBy)
                    .FirstOrDefaultAsync(e => e.Id == existing.Id);

                if (updatedEvent != null)
                {
                    await _eventDocumentStore.SaveAsync(updatedEvent);
                }

                if (!isHandler && _notificationService != null)
                {
                    await _notificationService.NotifyAsync(existing, currentUser, ClaimNotificationEvent.ClaimUpdated);
                    if (originalStatus != eventDto.Status)
                    {
                        await _notificationService.NotifyAsync(existing, currentUser, ClaimNotificationEvent.StatusChanged);
                    }
                }

                return NoContent();
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

        [HttpPost("{id}/attachments")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> UploadClaimAttachments(Guid id, [FromForm] List<IFormFile> files, [FromForm] string? description)
        {
            try
            {
                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { error = "No files provided" });
                }

                var results = new List<DocumentDto>();
                foreach (var file in files)
                {
                    var docDto = await _documentService.UploadAndCreateDocumentAsync(file, new CreateDocumentDto
                    {
                        File = file,
                        Category = "claims",
                        Description = description,
                        EventId = id,
                        RelatedEntityId = id,
                        RelatedEntityType = "Claim"
                    });
                    results.Add(docDto);
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading attachments for claim {ClaimId}", id);
                return StatusCode(500, new { error = "Failed to upload attachments" });
            }
        }

        private async Task UpsertClaimAsync(Event eventEntity, ClaimUpsertDto eventDto)
        {
            UpdateEventFromDto(eventDto, eventEntity);
            _context.Entry(eventEntity).State = EntityState.Modified;

            if (eventDto.Participants != null)
            {
                var dtoIds = eventDto.Participants
                    .Where(p => !string.IsNullOrEmpty(p.Id))
                    .Select(p => Guid.Parse(p.Id!))
                    .ToHashSet();
                var toRemove = eventEntity.Participants.Where(p => !dtoIds.Contains(p.Id)).ToList();
                foreach (var r in toRemove)
                {
                    foreach (var d in r.Drivers.ToList())
                    {
                        _context.Drivers.Remove(d);
                    }
                    _context.Participants.Remove(r);
                    eventEntity.Participants.Remove(r);
                }
                foreach (var pDto in eventDto.Participants)
                {
                    UpdateParticipantFromDto(eventEntity, pDto, _context);
                }
            }

            if (eventDto.Notes != null)
            {
                var dtoIds = eventDto.Notes
                    .Where(n => !string.IsNullOrEmpty(n.Id) && Guid.TryParse(n.Id, out _))
                    .Select(n => Guid.Parse(n.Id!))
                    .ToHashSet();

                var toRemove = eventEntity.Notes.Where(n => !dtoIds.Contains(n.Id)).ToList();
                foreach (var r in toRemove)
                {
                    _context.Notes.Remove(r);
                    eventEntity.Notes.Remove(r);
                }

                foreach (var nDto in eventDto.Notes)
                {
                    UpdateNoteFromDto(eventEntity, nDto, _context);
                }
            }

            if (eventDto.Emails != null)
            {
                _context.Emails.RemoveRange(eventEntity.Emails);
                eventEntity.Emails.Clear();
                foreach (var eDto in eventDto.Emails)
                {
                    var email = MapEmailDtoToModel(eDto, eventEntity.Id);
                    eventEntity.Emails.Add(email);
                    _context.Emails.Add(email);
                }
            }

            if (eventDto.Damages != null)
            {
                var dtoIds = eventDto.Damages
                    .Where(dmg => dmg.Id.HasValue)
                    .Select(dmg => dmg.Id!.Value)
                    .ToHashSet();
                var toRemove = eventEntity.Damages.Where(dmg => !dtoIds.Contains(dmg.Id)).ToList();
                foreach (var r in toRemove)
                {
                    _context.Damages.Remove(r);
                    eventEntity.Damages.Remove(r);
                }
                foreach (var dDto in eventDto.Damages)
                {
                    UpdateDamageFromDto(eventEntity, dDto, _context);
                }
            }

            if (eventDto.Decisions != null)
            {
                var dtoIds = eventDto.Decisions
                    .Select(d => Guid.TryParse(d.Id, out var gid) ? gid : (Guid?)null)
                    .Where(gid => gid.HasValue)
                    .Select(gid => gid!.Value)
                    .ToHashSet();
                var toRemove = eventEntity.Decisions.Where(d => !dtoIds.Contains(d.Id)).ToList();
                foreach (var r in toRemove)
                {
                    _context.Decisions.Remove(r);
                    eventEntity.Decisions.Remove(r);
                }
                foreach (var dDto in eventDto.Decisions)
                {
                    UpdateDecisionFromDto(eventEntity, dDto, _context);
                }
            }

            if (eventDto.DeletedAppealIds != null && eventDto.DeletedAppealIds.Any())
            {
                var toRemove = eventEntity.Appeals
                    .Where(a => eventDto.DeletedAppealIds.Contains(a.Id))
                    .ToList();
                foreach (var r in toRemove)
                {
                    _context.Appeals.Remove(r);
                    eventEntity.Appeals.Remove(r);
                }
            }

            if (eventDto.Appeals != null && eventDto.Appeals.Any())
            {
                foreach (var aDto in eventDto.Appeals)
                {
                    UpdateAppealFromDto(eventEntity, aDto, _context);
                }
            }

            if (eventDto.ClientClaims != null)
            {
                var dtoIds = eventDto.ClientClaims
                    .Select(c =>
                    {
                        if (!string.IsNullOrEmpty(c.Id) && Guid.TryParse(c.Id, out var parsed))
                            return (Guid?)parsed;
                        return null;
                    })
                    .Where(idv => idv.HasValue)
                    .Select(idv => idv!.Value)
                    .ToHashSet();
                var toRemove = eventEntity.ClientClaims.Where(c => !dtoIds.Contains(c.Id)).ToList();
                foreach (var r in toRemove)
                {
                    _context.ClientClaims.Remove(r);
                    eventEntity.ClientClaims.Remove(r);
                }
                foreach (var cDto in eventDto.ClientClaims)
                {
                    UpdateClientClaimFromDto(eventEntity, cDto, _context);
                }
            }

            if (eventDto.Recourses != null)
            {
                var dtoIds = eventDto.Recourses
                    .Where(rc => rc.Id.HasValue)
                    .Select(rc => rc.Id!.Value)
                    .ToHashSet();
                var toRemove = eventEntity.Recourses.Where(rc => !dtoIds.Contains(rc.Id)).ToList();
                foreach (var r in toRemove)
                {
                    _context.Recourses.Remove(r);
                    eventEntity.Recourses.Remove(r);
                }
                foreach (var rDto in eventDto.Recourses)
                {
                    UpdateRecourseFromDto(eventEntity, rDto, _context);
                }
            }

            if (eventDto.Settlements != null)
            {
                var dtoIds = eventDto.Settlements
                    .Where(s => s.Id.HasValue)
                    .Select(s => s.Id!.Value)
                    .ToHashSet();
                var toRemove = eventEntity.Settlements.Where(s => !dtoIds.Contains(s.Id)).ToList();
                foreach (var r in toRemove)
                {
                    _context.Settlements.Remove(r);
                    eventEntity.Settlements.Remove(r);
                }
                foreach (var sDto in eventDto.Settlements)
                {
                    UpdateSettlementFromDto(eventEntity, sDto, _context);
                }
            }

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

            var options = new JsonSerializerOptions
            {
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
            eventEntity.SearchData = JsonSerializer.Serialize(MapEventToDto(eventEntity), options);
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

        private static void UpdateEventFromDto(ClaimUpsertDto dto, Event entity)
        {
            entity.ClaimNumber = dto.ClaimNumber;
            entity.SpartaNumber = dto.SpartaNumber;
            entity.InsurerClaimNumber = dto.InsurerClaimNumber;
            entity.VehicleNumber = dto.VehicleNumber;
            entity.VictimRegistrationNumber = dto.VictimRegistrationNumber;
            entity.PerpetratorRegistrationNumber = dto.PerpetratorRegistrationNumber;
            entity.Brand = dto.Brand;
            entity.Model = dto.Model;
            entity.Owner = dto.Owner;
            entity.InsuranceCompanyId = dto.InsuranceCompanyId;
            entity.InsuranceCompany = dto.InsuranceCompany;
            entity.InsuranceCompanyPhone = dto.InsuranceCompanyPhone;
            entity.InsuranceCompanyEmail = dto.InsuranceCompanyEmail;
            entity.PolicyNumber = dto.PolicyNumber;
            entity.Status = dto.Status;
            entity.ClaimStatusId = dto.ClaimStatusId;
            entity.IsDraft = dto.IsDraft;
            entity.DamageDate = dto.DamageDate;
            entity.ReportDate = dto.ReportDate;
            entity.ReportDateToInsurer = dto.ReportDateToInsurer;
            entity.TotalClaim = dto.TotalClaim;
            entity.Payout = dto.Payout;
            entity.Currency = dto.Currency;
            entity.RiskType = dto.RiskType;
            entity.DamageType = dto.DamageType;
            entity.ObjectTypeId = dto.ObjectTypeId;
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

            if (!string.IsNullOrEmpty(dto.EventTime))
            {
                entity.EventTime = DateTime.Parse(dto.EventTime);
            }

            entity.EventLocation = dto.EventLocation;
            entity.EventDescription = dto.EventDescription;
            entity.Comments = dto.Comments;
            entity.Area = dto.Area;
            entity.WereInjured = dto.WereInjured;
            entity.StatementWithPerpetrator = dto.StatementWithPerpetrator;
            entity.PerpetratorFined = dto.PerpetratorFined;
            entity.ServicesCalled = dto.ServicesCalled;
            entity.DocumentCategories = dto.DocumentCategories;
            entity.PoliceUnitDetails = dto.PoliceUnitDetails;
            entity.PropertyDamageSubject = dto.PropertyDamageSubject;
            entity.DamageListing = dto.DamageListing;
            entity.InspectionContact = dto.InspectionContact;
            entity.PoliceDescription = dto.PoliceDescription;
            entity.AmbulanceDescription = dto.AmbulanceDescription;
            entity.FireDescription = dto.FireDescription;
            entity.TowDescription = dto.TowDescription;
            entity.InjuredData = dto.InjuredData;
            entity.PerpetratorData = dto.PerpetratorData;
            entity.VehicleType = dto.VehicleType;
            entity.SubcontractorName = dto.SubcontractorName;
            entity.SubcontractorPolicyNumber = dto.SubcontractorPolicyNumber;
            entity.SubcontractorInsurer = dto.SubcontractorInsurer;
            entity.ComplaintToSubcontractor = dto.ComplaintToSubcontractor;
            entity.ComplaintToSubcontractorDate = dto.ComplaintToSubcontractorDate;
            entity.ClaimFromSubcontractorPolicy = dto.ClaimFromSubcontractorPolicy;
            entity.ClaimFromSubcontractorPolicyDate = dto.ClaimFromSubcontractorPolicyDate;
            entity.ComplaintResponse = dto.ComplaintResponse;
            entity.ComplaintResponseDate = dto.ComplaintResponseDate;
            entity.TransportTypeId = dto.TransportTypeId;
            entity.TransportType = dto.TransportType;
            entity.CargoDescription = dto.CargoDescription;
            entity.Losses = dto.Losses;
            entity.Carrier = dto.Carrier;
            entity.CarrierPolicyNumber = dto.CarrierPolicyNumber;
            entity.InspectionContactName = dto.InspectionContactName;
            entity.InspectionContactPhone = dto.InspectionContactPhone;
            entity.InspectionContactEmail = dto.InspectionContactEmail;
            entity.DamageDescription = dto.DamageDescription;
            entity.Description = dto.Description;
        }

        private static void UpdateNoteFromDto(Event entity, NoteUpsertDto nDto, ApplicationDbContext context)
        {
            var hasId = Guid.TryParse(nDto.Id, out var noteId);
            var existing = hasId ? entity.Notes.FirstOrDefault(n => n.Id == noteId) : null;
            if (existing != null)
            {
                existing.Category = nDto.Category;
                existing.Title = nDto.Title;
                existing.Content = nDto.Content;
                existing.CreatedBy = nDto.CreatedBy;
                existing.UpdatedBy = nDto.CreatedBy;
                existing.IsPrivate = nDto.IsPrivate;
                existing.Priority = nDto.Priority;
                existing.Tags = nDto.Tags != null ? string.Join(",", nDto.Tags) : null;
                existing.UpdatedAt = DateTime.UtcNow;
                context.Notes.Update(existing);
            }
            else
            {
                var note = MapNoteDtoToModel(nDto, entity.Id);
                entity.Notes.Add(note);
                context.Notes.Add(note);
            }
        }

        private static void UpdateDamageFromDto(Event entity, DamageUpsertDto dDto, ApplicationDbContext context)
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
                context.Damages.Update(existing);
            }
            else
            {
                var damage = new Damage
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
                };
                entity.Damages.Add(damage);
                context.Damages.Add(damage);
            }
        }

        private static void UpdateDecisionFromDto(Event entity, DecisionDto dDto, ApplicationDbContext context)
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
                context.Decisions.Update(existing);
            }
            else
            {
                var decision = new Decision
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
                };
                entity.Decisions.Add(decision);
                context.Decisions.Add(decision);
            }
        }

        private static void UpdateAppealFromDto(Event entity, AppealUpsertDto aDto, ApplicationDbContext context)
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
                context.Appeals.Update(existing);
            }
            else
            {
                var appeal = new Appeal
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
                };
                entity.Appeals.Add(appeal);
                context.Appeals.Add(appeal);
            }
        }

        private static void UpdateClientClaimFromDto(Event entity, ClientClaimUpsertDto cDto, ApplicationDbContext context)
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
                context.ClientClaims.Update(existing);
            }
            else
            {
                var clientClaim = new ClientClaim
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
                };
                entity.ClientClaims.Add(clientClaim);
                context.ClientClaims.Add(clientClaim);
            }
        }

        private static void UpdateRecourseFromDto(Event entity, RecourseUpsertDto rDto, ApplicationDbContext context)
        {
            if (!rDto.FilingDate.HasValue || string.IsNullOrWhiteSpace(rDto.InsuranceCompany))
            {
                throw new ArgumentException("FilingDate and InsuranceCompany are required for recourse");
            }

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
                existing.IsJustified = rDto.IsJustified ?? existing.IsJustified;
                existing.FilingDate = rDto.FilingDate.Value;
                existing.InsuranceCompany = rDto.InsuranceCompany!;
                existing.ObtainDate = rDto.ObtainDate;
                existing.Amount = rDto.Amount;
                existing.CurrencyCode = rDto.CurrencyCode;
                existing.DocumentPath = rDto.DocumentPath;
                existing.DocumentName = rDto.DocumentName;
                existing.DocumentDescription = rDto.DocumentDescription;
                existing.UpdatedAt = DateTime.UtcNow;
                context.Recourses.Update(existing);
            }
            else
            {
                var recourse = new Recourse
                {
                    Id = hasId ? recourseId : Guid.NewGuid(),
                    EventId = entity.Id,
                    Status = rDto.Status,
                    InitiationDate = rDto.InitiationDate,
                    Description = rDto.Description,
                    Notes = rDto.Notes,
                    RecourseNumber = rDto.RecourseNumber,
                    RecourseAmount = rDto.RecourseAmount,
                    IsJustified = rDto.IsJustified ?? false,
                    FilingDate = rDto.FilingDate.Value,
                    InsuranceCompany = rDto.InsuranceCompany!,
                    ObtainDate = rDto.ObtainDate,
                    Amount = rDto.Amount,
                    CurrencyCode = rDto.CurrencyCode,
                    DocumentPath = rDto.DocumentPath,
                    DocumentName = rDto.DocumentName,
                    DocumentDescription = rDto.DocumentDescription,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                entity.Recourses.Add(recourse);
                context.Recourses.Add(recourse);
            }
        }

        private static void UpdateSettlementFromDto(Event entity, SettlementUpsertDto sDto, ApplicationDbContext context)
        {
            var hasId = sDto.Id.HasValue;
            var settlementId = sDto.Id ?? Guid.Empty;
            var existing = hasId ? entity.Settlements.FirstOrDefault(s => s.Id == settlementId) : null;
            if (existing != null)
            {
                existing.ExternalEntity = sDto.ExternalEntity;
                existing.CustomExternalEntity = sDto.CustomExternalEntity;
                existing.TransferDate = sDto.TransferDate;
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
                context.Settlements.Update(existing);
            }
            else
            {
                var settlement = new Settlement
                {
                    Id = hasId ? settlementId : Guid.NewGuid(),
                    EventId = entity.Id,
                    ExternalEntity = sDto.ExternalEntity,
                    CustomExternalEntity = sDto.CustomExternalEntity,
                    TransferDate = sDto.TransferDate,
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
                };
                entity.Settlements.Add(settlement);
                context.Settlements.Add(settlement);
            }
        }

        private static void UpdateParticipantFromDto(Event entity, ParticipantUpsertDto pDto, ApplicationDbContext context)
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
                existing.PolicyDealDate = pDto.PolicyDealDate;
                existing.PolicyStartDate = pDto.PolicyStartDate;
                existing.PolicyEndDate = pDto.PolicyEndDate;
                existing.PolicySumAmount = pDto.PolicySumAmount;
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
                    context.Drivers.Remove(d);
                    existing.Drivers.Remove(d);
                }

                if (pDto.Drivers != null)
                {
                    foreach (var dDto in pDto.Drivers)
                    {
                        UpdateDriverFromDto(existing, dDto, context);
                    }
                }
                context.Participants.Update(existing);
            }
            else
            {
                var participant = MapParticipantDtoToModel(pDto, entity.Id);
                participant.Drivers.Clear();
                foreach (var dDto in pDto.Drivers ?? Enumerable.Empty<DriverUpsertDto>())
                {
                    var driver = new Driver
                    {
                        Id = string.IsNullOrEmpty(dDto.Id) ? Guid.NewGuid() : Guid.Parse(dDto.Id),
                        EventId = entity.Id,
                        ParticipantId = participant.Id,
                        FirstName = dDto.FirstName,
                        LastName = dDto.LastName,
                        Phone = dDto.Phone,
                        Email = dDto.Email,
                        Address = dDto.Address,
                        City = dDto.City,
                        PostalCode = dDto.PostalCode,
                        Country = dDto.Country,
                        PersonalId = dDto.PersonalId,
                        LicenseNumber = dDto.LicenseNumber,
                        LicenseState = dDto.LicenseState,
                        LicenseExpirationDate = dDto.LicenseExpirationDate,
                        IsMainDriver = dDto.IsMainDriver,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    participant.Drivers.Add(driver);
                    context.Drivers.Add(driver);
                }
                entity.Participants.Add(participant);
                context.Participants.Add(participant);
            }
        }

        private static void UpdateDriverFromDto(Participant participant, DriverUpsertDto dDto, ApplicationDbContext context)
        {
            var hasDriverId = Guid.TryParse(dDto.Id, out var driverId);
            var driver = hasDriverId ? participant.Drivers.FirstOrDefault(dr => dr.Id == driverId) : null;
            if (driver != null)
            {
                driver.FirstName = dDto.FirstName;
                driver.LastName = dDto.LastName;
                driver.Phone = dDto.Phone;
                driver.Email = dDto.Email;
                driver.Address = dDto.Address;
                driver.City = dDto.City;
                driver.PostalCode = dDto.PostalCode;
                driver.Country = dDto.Country;
                driver.PersonalId = dDto.PersonalId;
                driver.LicenseNumber = dDto.LicenseNumber;
                driver.LicenseState = dDto.LicenseState;
                driver.LicenseExpirationDate = dDto.LicenseExpirationDate;
                driver.IsMainDriver = dDto.IsMainDriver;
                driver.UpdatedAt = DateTime.UtcNow;
                context.Drivers.Update(driver);
            }
            else
            {
                var newDriver = new Driver
                {
                    Id = hasDriverId ? driverId : Guid.NewGuid(),
                    EventId = participant.EventId,
                    ParticipantId = participant.Id,
                    FirstName = dDto.FirstName,
                    LastName = dDto.LastName,
                    Phone = dDto.Phone,
                    Email = dDto.Email,
                    Address = dDto.Address,
                    City = dDto.City,
                    PostalCode = dDto.PostalCode,
                    Country = dDto.Country,
                    PersonalId = dDto.PersonalId,
                    LicenseNumber = dDto.LicenseNumber,
                    LicenseState = dDto.LicenseState,
                    LicenseExpirationDate = dDto.LicenseExpirationDate,
                    IsMainDriver = dDto.IsMainDriver,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                participant.Drivers.Add(newDriver);
                context.Drivers.Add(newDriver);
            }
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
                PolicyDealDate = dto.PolicyDealDate,
                PolicyStartDate = dto.PolicyStartDate,
                PolicyEndDate = dto.PolicyEndDate,
                PolicySumAmount = dto.PolicySumAmount,
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
                Email = dto.Email,
                Address = dto.Address,
                City = dto.City,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                PersonalId = dto.PersonalId,
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
                Id = Guid.TryParse(dto.Id, out var noteId) ? noteId : Guid.NewGuid(),
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

        private ClaimDto MapEventToDto(Event e)
        {
            var baseUrl = (_config["App:BaseUrl"] ?? string.Empty).TrimEnd('/');
            var apiBaseUrl = baseUrl.EndsWith("/api") ? baseUrl : $"{baseUrl}/api";
            return new ClaimDto
            {
            Id = e.Id.ToString(),
            ClaimNumber = e.ClaimNumber,
            SpartaNumber = e.SpartaNumber,
            InsurerClaimNumber = e.InsurerClaimNumber,
            VehicleNumber = e.VehicleNumber,
            VictimRegistrationNumber = e.VictimRegistrationNumber,
            PerpetratorRegistrationNumber = e.PerpetratorRegistrationNumber,
            Brand = e.Brand,
            Model = e.Model,
            Owner = e.Owner,
            InsuranceCompanyId = e.InsuranceCompanyId,
            InsuranceCompany = e.InsuranceCompany,
            InsuranceCompanyPhone = e.InsuranceCompanyPhone,
            InsuranceCompanyEmail = e.InsuranceCompanyEmail,
            PolicyNumber = e.PolicyNumber,
            Status = e.Status,
            ClaimStatusId = e.ClaimStatusId,
            DamageDate = e.DamageDate,
            ReportDate = e.ReportDate,
            ReportDateToInsurer = e.ReportDateToInsurer,
            TotalClaim = e.TotalClaim,
            Payout = e.Payout,
            Currency = e.Currency,
            RiskType = e.RiskType,
            DamageType = e.DamageType,
            ObjectTypeId = e.ObjectTypeId,
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
            DocumentCategories = e.DocumentCategories?.Split(',', StringSplitOptions.RemoveEmptyEntries),
            PoliceUnitDetails = e.PoliceUnitDetails,
            PropertyDamageSubject = e.PropertyDamageSubject,
            DamageListing = e.DamageListing,
            InspectionContact = e.InspectionContact,
            PoliceDescription = e.PoliceDescription,
            AmbulanceDescription = e.AmbulanceDescription,
            FireDescription = e.FireDescription,
            TowDescription = e.TowDescription,
            InjuredData = e.InjuredData,
            PerpetratorData = e.PerpetratorData,
            VehicleType = e.VehicleType,
            SubcontractorName = e.SubcontractorName,
            SubcontractorPolicyNumber = e.SubcontractorPolicyNumber,
            SubcontractorInsurer = e.SubcontractorInsurer,
            ComplaintToSubcontractor = e.ComplaintToSubcontractor,
            ComplaintToSubcontractorDate = e.ComplaintToSubcontractorDate,
            ClaimFromSubcontractorPolicy = e.ClaimFromSubcontractorPolicy,
            ClaimFromSubcontractorPolicyDate = e.ClaimFromSubcontractorPolicyDate,
            ComplaintResponse = e.ComplaintResponse,
            ComplaintResponseDate = e.ComplaintResponseDate,
            TransportTypeId = e.TransportTypeId,
            TransportType = e.TransportType,
            CargoDescription = e.CargoDescription,
            Losses = e.Losses?.Split(',', StringSplitOptions.RemoveEmptyEntries),
            Carrier = e.Carrier,
            CarrierPolicyNumber = e.CarrierPolicyNumber,
            InspectionContactName = e.InspectionContactName,
            InspectionContactPhone = e.InspectionContactPhone,
            InspectionContactEmail = e.InspectionContactEmail,
            DamageDescription = e.DamageDescription,
            Description = e.Description,
            IsDraft = e.IsDraft,
            RegisteredById = e.RegisteredById,
            RegisteredByName = e.RegisteredBy != null ? e.RegisteredBy.UserName : null,
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
                PolicyDealDate = p.PolicyDealDate,
                PolicyStartDate = p.PolicyStartDate,
                PolicyEndDate = p.PolicyEndDate,
                PolicySumAmount = p.PolicySumAmount,
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
                    Email = d.Email,
                    Address = d.Address,
                    City = d.City,
                    PostalCode = d.PostalCode,
                    Country = d.Country,
                    PersonalId = d.PersonalId,
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
                CloudUrl = d.CloudUrl,
                FileSize = d.FileSize,
                ContentType = d.ContentType,
                Category = d.DocumentType,
                Description = d.Description,
                UploadedBy = d.UploadedBy,
                IsActive = !d.IsDeleted,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                DownloadUrl = $"{apiBaseUrl}/documents/{d.Id}/download",
                PreviewUrl = $"{apiBaseUrl}/documents/{d.Id}/preview",
                CanPreview = true

            }).ToList(),
            Damages = e.Damages.Select(d => new DamageDto
            {
                Id = d.Id.ToString(),
                EventId = d.EventId?.ToString(),
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
                ClaimNumber = c.ClaimNumber,
                ClaimDate = c.ClaimDate,
                ClaimType = c.ClaimType,
                ClaimAmount = c.ClaimAmount,
                Currency = c.Currency,
                Status = c.Status,
                Description = c.Description,
                DocumentPath = c.DocumentPath,
                DocumentName = c.DocumentName,
                DocumentDescription = c.DocumentDescription,
                ClaimNotes = c.ClaimNotes,
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
                ClaimId = s.ClaimId?.ToString(),
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
}
