using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/damage-types")]
    public class DamageTypesController : ControllerBase
    {
        private readonly IDamageTypeService _service;

        public DamageTypesController(IDamageTypeService service)
        {
            _service = service;
        }

        [HttpGet]

        public async Task<IActionResult> GetDamageTypes([FromQuery] Guid? riskTypeId = null)

        {
            var result = await _service.GetDamageTypesAsync(riskTypeId);
            if (!result.Success)
            {

                return StatusCode(result.StatusCode, new { error = result.Error });

            }

            return Ok(result.Data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDamageType(int id)
        {
            var result = await _service.GetDamageTypeAsync(id);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDamageType(DamageTypeDto dto)
        {
            var result = await _service.CreateDamageTypeAsync(dto);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return CreatedAtAction(nameof(GetDamageType), new { id = result.Data!.Id }, result.Data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDamageType(int id, DamageTypeDto dto)
        {
            var result = await _service.UpdateDamageTypeAsync(id, dto);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDamageType(int id)
        {
            var result = await _service.DeleteDamageTypeAsync(id);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return NoContent();
        }
    }
}

