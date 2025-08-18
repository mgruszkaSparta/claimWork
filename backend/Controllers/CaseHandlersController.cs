using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CaseHandlersController : ControllerBase
    {
        private readonly ICaseHandlerService _service;

        public CaseHandlersController(ICaseHandlerService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetCaseHandlers()
        {
            var result = await _service.GetCaseHandlersAsync();
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return Ok(result.Data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCaseHandler(int id)
        {
            var result = await _service.GetCaseHandlerAsync(id);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCaseHandler(CaseHandlerDto dto)
        {
            var result = await _service.CreateCaseHandlerAsync(dto);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return CreatedAtAction(nameof(GetCaseHandler), new { id = result.Data!.Id }, result.Data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCaseHandler(int id, CaseHandlerDto dto)
        {
            var result = await _service.UpdateCaseHandlerAsync(id, dto);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCaseHandler(int id)
        {
            var result = await _service.DeleteCaseHandlerAsync(id);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            return NoContent();
        }
    }
}
