using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AutomotiveClaimsApi.Services
{
    public class RequiredDocumentService : IRequiredDocumentService
    {
        private readonly ApplicationDbContext _context;

        public RequiredDocumentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<IEnumerable<RequiredDocumentTypeDto>>> GetRequiredDocumentsAsync(int? claimObjectTypeId)
        {
            try
            {
                var query = _context.RequiredDocumentTypes.Where(rd => rd.IsActive);
                if (claimObjectTypeId.HasValue)
                {
                    query = query.Where(rd => rd.ClaimObjectTypeId == claimObjectTypeId);
                }

                var items = await query
                    .OrderBy(rd => rd.Name)
                    .Select(rd => new RequiredDocumentTypeDto
                    {
                        Id = rd.Id,
                        Name = rd.Name,
                        Description = rd.Description,
                        Category = rd.Category,
                        ClaimObjectTypeId = rd.ClaimObjectTypeId,
                        IsRequired = rd.IsRequired,
                        IsActive = rd.IsActive,
                        CreatedAt = rd.CreatedAt,
                        UpdatedAt = rd.UpdatedAt
                    })
                    .ToListAsync();

                return ServiceResult<IEnumerable<RequiredDocumentTypeDto>>.Ok(items);
            }
            catch
            {
                return ServiceResult<IEnumerable<RequiredDocumentTypeDto>>.Fail("Failed to fetch required documents", 500);
            }
        }

        public async Task<ServiceResult<RequiredDocumentTypeDto>> GetRequiredDocumentAsync(int id)
        {
            try
            {
                var rd = await _context.RequiredDocumentTypes.Where(r => r.Id == id && r.IsActive).FirstOrDefaultAsync();
                if (rd == null)
                {
                    return ServiceResult<RequiredDocumentTypeDto>.Fail("Required document not found", 404);
                }

                var dto = new RequiredDocumentTypeDto
                {
                    Id = rd.Id,
                    Name = rd.Name,
                    Description = rd.Description,
                    Category = rd.Category,
                    ClaimObjectTypeId = rd.ClaimObjectTypeId,
                    IsRequired = rd.IsRequired,
                    IsActive = rd.IsActive,
                    CreatedAt = rd.CreatedAt,
                    UpdatedAt = rd.UpdatedAt
                };

                return ServiceResult<RequiredDocumentTypeDto>.Ok(dto);
            }
            catch
            {
                return ServiceResult<RequiredDocumentTypeDto>.Fail("Failed to fetch required document", 500);
            }
        }

        public async Task<ServiceResult<RequiredDocumentTypeDto>> CreateRequiredDocumentAsync(RequiredDocumentTypeDto dto)
        {
            try
            {
                var entity = new RequiredDocumentType
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    Category = dto.Category,
                    ClaimObjectTypeId = dto.ClaimObjectTypeId,
                    IsRequired = dto.IsRequired,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.RequiredDocumentTypes.Add(entity);
                await _context.SaveChangesAsync();

                dto.Id = entity.Id;
                dto.CreatedAt = entity.CreatedAt;
                dto.UpdatedAt = entity.UpdatedAt;

                return ServiceResult<RequiredDocumentTypeDto>.Created(dto);
            }
            catch
            {
                return ServiceResult<RequiredDocumentTypeDto>.Fail("Failed to create required document", 500);
            }
        }

        public async Task<ServiceResult> UpdateRequiredDocumentAsync(int id, RequiredDocumentTypeDto dto)
        {
            try
            {
                var entity = await _context.RequiredDocumentTypes.FindAsync(id);
                if (entity == null || !entity.IsActive)
                {
                    return ServiceResult.Fail("Required document not found", 404);
                }

                entity.Name = dto.Name;
                entity.Description = dto.Description;
                entity.Category = dto.Category;
                entity.ClaimObjectTypeId = dto.ClaimObjectTypeId;
                entity.IsRequired = dto.IsRequired;
                entity.IsActive = dto.IsActive;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult.Ok();
            }
            catch
            {
                return ServiceResult.Fail("Failed to update required document", 500);
            }
        }

        public async Task<ServiceResult> DeleteRequiredDocumentAsync(int id)
        {
            try
            {
                var entity = await _context.RequiredDocumentTypes.FindAsync(id);
                if (entity == null || !entity.IsActive)
                {
                    return ServiceResult.Fail("Required document not found", 404);
                }

                entity.IsActive = false;
                entity.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return ServiceResult.Ok();
            }
            catch
            {
                return ServiceResult.Fail("Failed to delete required document", 500);
            }
        }
    }
}
