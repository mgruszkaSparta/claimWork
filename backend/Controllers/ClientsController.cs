using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients([FromQuery] string? search = null)
        {
            var query = _context.Clients.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c =>
                    c.Name.Contains(search) ||
                    (c.FullName != null && c.FullName.Contains(search)) ||
                    (c.ShortName != null && c.ShortName.Contains(search)) ||
                    (c.Email != null && c.Email.Contains(search)) ||
                    (c.PhoneNumber != null && c.PhoneNumber.Contains(search)));
            }

            var clients = await query
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .Select(c => new ClientDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    FullName = c.FullName,
                    ShortName = c.ShortName,
                    TaxId = c.TaxId,
                    RegistrationNumber = c.RegistrationNumber,
                    PhoneNumber = c.PhoneNumber,
                    Email = c.Email,
                    Address = c.Address,
                    City = c.City,
                    PostalCode = c.PostalCode,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            return Ok(clients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            var client = await _context.Clients
                .Where(c => c.Id == id)
                .Select(c => new ClientDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    FullName = c.FullName,
                    ShortName = c.ShortName,
                    TaxId = c.TaxId,
                    RegistrationNumber = c.RegistrationNumber,
                    PhoneNumber = c.PhoneNumber,
                    Email = c.Email,
                    Address = c.Address,
                    City = c.City,
                    PostalCode = c.PostalCode,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (client == null)
            {
                return NotFound();
            }

            return Ok(client);
        }

        [HttpPost]
        public async Task<ActionResult<ClientDto>> CreateClient(CreateClientDto createClientDto)
        {
            var client = new Client
            {
                Name = createClientDto.Name,
                FullName = createClientDto.FullName,
                ShortName = createClientDto.ShortName,
                TaxId = createClientDto.TaxId,
                RegistrationNumber = createClientDto.RegistrationNumber,
                PhoneNumber = createClientDto.PhoneNumber,
                Email = createClientDto.Email,
                Address = createClientDto.Address,
                City = createClientDto.City,
                PostalCode = createClientDto.PostalCode,
                IsActive = createClientDto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            var clientDto = new ClientDto
            {
                Id = client.Id,
                Name = client.Name,
                FullName = client.FullName,
                ShortName = client.ShortName,
                TaxId = client.TaxId,
                RegistrationNumber = client.RegistrationNumber,
                PhoneNumber = client.PhoneNumber,
                Email = client.Email,
                Address = client.Address,
                City = client.City,
                PostalCode = client.PostalCode,
                IsActive = client.IsActive,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt
            };

            return CreatedAtAction(nameof(GetClient), new { id = client.Id }, clientDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, UpdateClientDto updateClientDto)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            client.Name = updateClientDto.Name ?? client.Name;
            client.FullName = updateClientDto.FullName ?? client.FullName;
            client.ShortName = updateClientDto.ShortName ?? client.ShortName;
            client.TaxId = updateClientDto.TaxId ?? client.TaxId;
            client.RegistrationNumber = updateClientDto.RegistrationNumber ?? client.RegistrationNumber;
            client.PhoneNumber = updateClientDto.PhoneNumber ?? client.PhoneNumber;
            client.Email = updateClientDto.Email ?? client.Email;
            client.Address = updateClientDto.Address ?? client.Address;
            client.City = updateClientDto.City ?? client.City;
            client.PostalCode = updateClientDto.PostalCode ?? client.PostalCode;
            client.IsActive = updateClientDto.IsActive ?? client.IsActive;
            client.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            client.IsActive = false;
            client.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
