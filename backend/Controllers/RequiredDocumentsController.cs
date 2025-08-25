using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/required-documents")]
    public class RequiredDocumentsController : ControllerBase
    {
        private readonly IRequiredDocumentService _service;

        public RequiredDocumentsController(IRequiredDocumentService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetRequiredDocuments([FromQuery] int? claimObjectTypeId)
        {
            var result = await _service.GetRequiredDocumentsAsync(claimObjectTypeId);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }
            return Ok(result.Data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequiredDocument(int id)
        {
            var result = await _service.GetRequiredDocumentAsync(id);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }
            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequiredDocument(RequiredDocumentTypeDto dto)
        {
            var result = await _service.CreateRequiredDocumentAsync(dto);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }
            return CreatedAtAction(nameof(GetRequiredDocument), new { id = result.Data!.Id }, result.Data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRequiredDocument(int id, RequiredDocumentTypeDto dto)
        {
            var result = await _service.UpdateRequiredDocumentAsync(id, dto);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRequiredDocument(int id)
        {
            var result = await _service.DeleteRequiredDocumentAsync(id);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }
            return NoContent();
        }
    }
}
