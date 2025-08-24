using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs.Dictionary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DictionariesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DictionariesController> _logger;

        public DictionariesController(ApplicationDbContext context, ILogger<DictionariesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("casehandlers")]
        public async Task<ActionResult<DictionaryResponseDto>> GetCaseHandlers()
        {
            try
            {
                var handlers = await _context.CaseHandlers
                    .Where(h => h.IsActive)
                    .OrderBy(h => h.Name)
                    .Select(h => new DictionaryItemDto
                    {
                        Id = h.Id.ToString(),
                        Name = h.Name,
                        Code = h.Code,
                        Email = h.Email,
                        Phone = h.Phone,
                        Department = h.Department,
                        IsActive = h.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = handlers,
                    TotalCount = handlers.Count,
                    Category = "CaseHandlers"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving case handlers");
                return StatusCode(500, new { error = "Failed to retrieve case handlers" });
            }
        }

        [HttpGet("countries")]
        public async Task<ActionResult<DictionaryResponseDto>> GetCountries()
        {
            try
            {
                var countries = await _context.Countries
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Name)
                    .Select(c => new DictionaryItemDto
                    {
                        Id = c.Id.ToString(),
                        Name = c.Name,
                        Code = c.Code,
                        IsActive = c.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = countries,
                    TotalCount = countries.Count,
                    Category = "Countries"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving countries");
                return StatusCode(500, new { error = "Failed to retrieve countries" });
            }
        }

        [HttpGet("currencies")]
        public async Task<ActionResult<DictionaryResponseDto>> GetCurrencies()
        {
            try
            {
                var currencies = await _context.Currencies
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Name)
                    .Select(c => new DictionaryItemDto
                    {
                        Id = c.Id.ToString(),
                        Name = c.Name,
                        Code = c.Code,
                        IsActive = c.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = currencies,
                    TotalCount = currencies.Count,
                    Category = "Currencies"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving currencies");
                return StatusCode(500, new { error = "Failed to retrieve currencies" });
            }
        }

        [HttpGet("claim-statuses")]
        public async Task<ActionResult<DictionaryResponseDto>> GetClaimStatuses()
        {
            try
            {
                var statuses = await _context.ClaimStatuses
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.Id)
                    .Select(s => new DictionaryItemDto
                    {
                        Id = s.Id.ToString(),
                        Name = s.Name,
                        Code = s.Code,
                        IsActive = s.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = statuses,
                    TotalCount = statuses.Count,
                    Category = "ClaimStatuses"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving claim statuses");
                return StatusCode(500, new { error = "Failed to retrieve claim statuses" });
            }
        }

        [HttpGet("vehicle-types")]
        public async Task<ActionResult<DictionaryResponseDto>> GetVehicleTypes()
        {
            try
            {
                var vehicleTypes = await _context.VehicleTypes
                    .Where(v => v.IsActive)
                    .OrderBy(v => v.Name)
                    .Select(v => new DictionaryItemDto
                    {
                        Id = v.Id.ToString(),
                        Name = v.Name,
                        Code = v.Code,
                        IsActive = v.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = vehicleTypes,
                    TotalCount = vehicleTypes.Count,
                    Category = "VehicleTypes"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicle types");
                return StatusCode(500, new { error = "Failed to retrieve vehicle types" });
            }
        }

        [HttpGet("priorities")]
        public async Task<ActionResult<DictionaryResponseDto>> GetPriorities()
        {
            try
            {
                var priorities = await _context.Priorities
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.SortOrder)
                    .Select(p => new DictionaryItemDto
                    {
                        Id = p.Id.ToString(),
                        Name = p.Name,
                        Code = p.Code,
                        IsActive = p.IsActive,
                        SortOrder = p.SortOrder
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = priorities,
                    TotalCount = priorities.Count,
                    Category = "Priorities"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving priorities");
                return StatusCode(500, new { error = "Failed to retrieve priorities" });
            }
        }

        [HttpGet("event-statuses")]
        public async Task<ActionResult<DictionaryResponseDto>> GetEventStatuses()
        {
            try
            {
                var eventStatuses = await _context.EventStatuses
                    .Where(e => e.IsActive)
                    .OrderBy(e => e.Name)
                    .Select(e => new DictionaryItemDto
                    {
                        Id = e.Id.ToString(),
                        Name = e.Name,
                        Code = e.Code,
                        IsActive = e.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = eventStatuses,
                    TotalCount = eventStatuses.Count,
                    Category = "EventStatuses"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving event statuses");
                return StatusCode(500, new { error = "Failed to retrieve event statuses" });
            }
        }

        [HttpGet("payment-methods")]
        public async Task<ActionResult<DictionaryResponseDto>> GetPaymentMethods()
        {
            try
            {
                var paymentMethods = await _context.PaymentMethods
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Name)
                    .Select(p => new DictionaryItemDto
                    {
                        Id = p.Id.ToString(),
                        Name = p.Name,
                        Code = p.Code,
                        IsActive = p.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = paymentMethods,
                    TotalCount = paymentMethods.Count,
                    Category = "PaymentMethods"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment methods");
                return StatusCode(500, new { error = "Failed to retrieve payment methods" });
            }
        }

        [HttpGet("contract-types")]
        public async Task<ActionResult<DictionaryResponseDto>> GetContractTypes()
        {
            try
            {
                var contractTypes = await _context.ContractTypes
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Name)
                    .Select(c => new DictionaryItemDto
                    {
                        Id = c.Id.ToString(),
                        Name = c.Name,
                        Code = c.Code,
                        IsActive = c.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = contractTypes,
                    TotalCount = contractTypes.Count,
                    Category = "ContractTypes"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contract types");
                return StatusCode(500, new { error = "Failed to retrieve contract types" });
            }
        }

        [HttpGet("risk-types")]
        public async Task<ActionResult<DictionaryResponseDto>> GetRiskTypes([FromQuery] int? claimObjectTypeId)
        {
            try
            {
                var query = _context.RiskTypes
                    .Where(r => r.IsActive);

                if (claimObjectTypeId.HasValue)
                {
                    query = query.Where(r => r.ClaimObjectTypeId == claimObjectTypeId.Value);
                }

                var riskTypes = await query
                    .OrderBy(r => r.Name)
                    .Select(r => new DictionaryItemDto
                    {
                        Id = r.Id.ToString(),
                        Name = r.Name,
                        Code = r.Code,
                        Description = r.Description,
                        IsActive = r.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = riskTypes,
                    TotalCount = riskTypes.Count,
                    Category = "RiskTypes"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving risk types");
                return StatusCode(500, new { error = "Failed to retrieve risk types" });
            }
        }

        [HttpGet("document-statuses")]
        public async Task<ActionResult<DictionaryResponseDto>> GetDocumentStatuses()
        {
            try
            {
                var documentStatuses = await _context.DocumentStatuses
                    .Where(d => d.IsActive)
                    .OrderBy(d => d.Name)
                    .Select(d => new DictionaryItemDto
                    {
                        Id = d.Id.ToString(),
                        Name = d.Name,
                        Code = d.Code,
                        IsActive = d.IsActive
                    })
                    .ToListAsync();

                var response = new DictionaryResponseDto
                {
                    Items = documentStatuses,
                    TotalCount = documentStatuses.Count,
                    Category = "DocumentStatuses"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document statuses");
                return StatusCode(500, new { error = "Failed to retrieve document statuses" });
            }
        }
    }
}
