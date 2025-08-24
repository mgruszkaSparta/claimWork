using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace AutomotiveClaimsApi.Controllers
{
    /// <summary>
    /// Handles create, read, update and delete operations for risk types at `/api/RiskTypes`.
    /// </summary>
    /// <remarks>
    /// The read-only dictionary endpoint is exposed separately at `/api/dictionaries/risk-types`.
    /// </remarks>
    [ApiController]
    [Route("api/[controller]")]
    public class RiskTypesController : ControllerBase
    {
        private readonly IRiskTypeService _service;

        public RiskTypesController(IRiskTypeService service)
        {
            _service = service;
        }

        [HttpGet]

        public async Task<IActionResult> GetRiskTypes([FromQuery] int? claimObjectTypeId)
        {
            var result = await _service.GetRiskTypesAsync(claimObjectTypeId);
            if (!result.Success)

            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return Ok(result.Data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRiskType(int id)
        {
            var result = await _service.GetRiskTypeAsync(id);
        
            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRiskType(RiskTypeDto dto)
        {

            var result = await _service.CreateRiskTypeAsync(dto);
            if (!result.Success)

            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return CreatedAtAction(nameof(GetRiskType), new { id = result.Data!.Id }, result.Data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRiskType(int id, RiskTypeDto dto)
        {

            var result = await _service.UpdateRiskTypeAsync(id, dto);
            if (!result.Success)

            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRiskType(int id)
        {

            var result = await _service.DeleteRiskTypeAsync(id);
            if (!result.Success)

            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return NoContent();
        }
    }
}

