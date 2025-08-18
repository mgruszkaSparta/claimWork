using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models.Dictionary;
using Microsoft.EntityFrameworkCore;

namespace AutomotiveClaimsApi.Services
{
    public class CaseHandlerService : ICaseHandlerService
    {
        private readonly ApplicationDbContext _context;

        public CaseHandlerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<IEnumerable<CaseHandlerDto>>> GetCaseHandlersAsync()
        {
            try
            {
                var handlers = await _context.CaseHandlers
                    .OrderBy(h => h.Name)
                    .Select(h => new CaseHandlerDto
                    {
                        Id = h.Id,
                        Name = h.Name,
                        Code = h.Code,
                        Email = h.Email,
                        Phone = h.Phone,
                        Department = h.Department,
                        IsActive = h.IsActive
                    })
                    .ToListAsync();

                return ServiceResult<IEnumerable<CaseHandlerDto>>.Ok(handlers);
            }
            catch
            {
                return ServiceResult<IEnumerable<CaseHandlerDto>>.Fail("Failed to fetch case handlers", 500);
            }
        }

        public async Task<ServiceResult<CaseHandlerDto>> GetCaseHandlerAsync(int id)
        {
            try
            {
                var handler = await _context.CaseHandlers.FindAsync(id);
                if (handler == null)
                {
                    return ServiceResult<CaseHandlerDto>.Fail("Case handler not found", 404);
                }

                var dto = new CaseHandlerDto
                {
                    Id = handler.Id,
                    Name = handler.Name,
                    Code = handler.Code,
                    Email = handler.Email,
                    Phone = handler.Phone,
                    Department = handler.Department,
                    IsActive = handler.IsActive
                };

                return ServiceResult<CaseHandlerDto>.Ok(dto);
            }
            catch
            {
                return ServiceResult<CaseHandlerDto>.Fail("Failed to fetch case handler", 500);
            }
        }

        public async Task<ServiceResult<CaseHandlerDto>> CreateCaseHandlerAsync(CaseHandlerDto dto)
        {
            try
            {
                if (!string.IsNullOrEmpty(dto.Code) && await _context.CaseHandlers.AnyAsync(h => h.Code == dto.Code))
                {
                    return ServiceResult<CaseHandlerDto>.Fail("Case handler code already exists", 409);
                }

                var handler = new CaseHandler
                {
                    Name = dto.Name,
                    Code = dto.Code,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    Department = dto.Department,
                    IsActive = dto.IsActive
                };

                _context.CaseHandlers.Add(handler);
                await _context.SaveChangesAsync();

                dto.Id = handler.Id;
                return ServiceResult<CaseHandlerDto>.Created(dto);
            }
            catch
            {
                return ServiceResult<CaseHandlerDto>.Fail("Failed to create case handler", 500);
            }
        }

        public async Task<ServiceResult> UpdateCaseHandlerAsync(int id, CaseHandlerDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return ServiceResult.Fail("ID mismatch", 400);
                }

                var handler = await _context.CaseHandlers.FindAsync(id);
                if (handler == null)
                {
                    return ServiceResult.Fail("Case handler not found", 404);
                }

                if (!string.IsNullOrEmpty(dto.Code) && await _context.CaseHandlers.AnyAsync(h => h.Code == dto.Code && h.Id != id))
                {
                    return ServiceResult.Fail("Case handler code already exists", 409);
                }

                handler.Name = dto.Name;
                handler.Code = dto.Code;
                handler.Email = dto.Email;
                handler.Phone = dto.Phone;
                handler.Department = dto.Department;
                handler.IsActive = dto.IsActive;

                await _context.SaveChangesAsync();
                return ServiceResult.Ok();
            }
            catch
            {
                return ServiceResult.Fail("Failed to update case handler", 500);
            }
        }

        public async Task<ServiceResult> DeleteCaseHandlerAsync(int id)
        {
            try
            {
                var handler = await _context.CaseHandlers.FindAsync(id);
                if (handler == null || !handler.IsActive)
                {
                    return ServiceResult.Fail("Case handler not found", 404);
                }

                handler.IsActive = false;
                await _context.SaveChangesAsync();
                return ServiceResult.Ok();
            }
            catch
            {
                return ServiceResult.Fail("Failed to delete case handler", 500);
            }
        }
    }
}
