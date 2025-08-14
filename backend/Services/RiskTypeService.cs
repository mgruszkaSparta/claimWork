using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AutomotiveClaimsApi.Services
{
    public class RiskTypeService : IRiskTypeService
    {
        private readonly ApplicationDbContext _context;

        public RiskTypeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<IEnumerable<RiskTypeDto>>> GetRiskTypesAsync(int? claimObjectTypeId)
        {
            try
            {
                var query = _context.RiskTypes.Where(rt => rt.IsActive);

                if (claimObjectTypeId.HasValue)
                {
                    query = query.Where(rt => rt.ClaimObjectTypeId == claimObjectTypeId);
                }

                var riskTypes = await query
                    .OrderBy(rt => rt.Name)
                    .Select(rt => new RiskTypeDto
                    {
                        Id = rt.Id,
                        Code = rt.Code,
                        Name = rt.Name,
                        Description = rt.Description,
                        IsActive = rt.IsActive,
                        CreatedAt = rt.CreatedAt,
                        UpdatedAt = rt.UpdatedAt
                    })
                    .ToListAsync();

                return ServiceResult<IEnumerable<RiskTypeDto>>.Ok(riskTypes);
            }
            catch
            {
                return ServiceResult<IEnumerable<RiskTypeDto>>.Fail("Failed to fetch risk types", 500);
            }
        }

        public async Task<ServiceResult<RiskTypeDto>> GetRiskTypeAsync(Guid id)
        {
            try
            {
                var riskType = await _context.RiskTypes
                    .Where(rt => rt.Id == id && rt.IsActive)
                    .FirstOrDefaultAsync();

                if (riskType == null)
                {
                    return ServiceResult<RiskTypeDto>.Fail("Risk type not found", 404);
                }

                var dto = new RiskTypeDto
                {
                    Id = riskType.Id,
                    Code = riskType.Code,
                    Name = riskType.Name,
                    Description = riskType.Description,
                    IsActive = riskType.IsActive,
                    CreatedAt = riskType.CreatedAt,
                    UpdatedAt = riskType.UpdatedAt
                };

                return ServiceResult<RiskTypeDto>.Ok(dto);
            }
            catch
            {
                return ServiceResult<RiskTypeDto>.Fail("Failed to fetch risk type", 500);
            }
        }

        public async Task<ServiceResult<RiskTypeDto>> CreateRiskTypeAsync(RiskTypeDto dto)
        {
            try
            {
                if (await _context.RiskTypes.AnyAsync(rt => rt.Code == dto.Code))
                {
                    return ServiceResult<RiskTypeDto>.Fail("Risk type code already exists", 409);
                }

                var riskType = new Models.RiskType
                {
                    Id = Guid.NewGuid(),
                    Code = dto.Code,
                    Name = dto.Name,
                    Description = dto.Description,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.RiskTypes.Add(riskType);
                await _context.SaveChangesAsync();

                var result = new RiskTypeDto
                {
                    Id = riskType.Id,
                    Code = riskType.Code,
                    Name = riskType.Name,
                    Description = riskType.Description,
                    IsActive = riskType.IsActive,
                    CreatedAt = riskType.CreatedAt,
                    UpdatedAt = riskType.UpdatedAt
                };

                return ServiceResult<RiskTypeDto>.Created(result);
            }
            catch
            {
                return ServiceResult<RiskTypeDto>.Fail("Failed to create risk type", 500);
            }
        }

        public async Task<ServiceResult> UpdateRiskTypeAsync(Guid id, RiskTypeDto dto)
        {
            try
            {
                var riskType = await _context.RiskTypes.FindAsync(id);
                if (riskType == null || !riskType.IsActive)
                {
                    return ServiceResult.Fail("Risk type not found", 404);
                }

                if (await _context.RiskTypes.AnyAsync(rt => rt.Code == dto.Code && rt.Id != id))
                {
                    return ServiceResult.Fail("Risk type code already exists", 409);
                }

                riskType.Code = dto.Code;
                riskType.Name = dto.Name;
                riskType.Description = dto.Description;
                riskType.IsActive = dto.IsActive;
                riskType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult.Ok();
            }
            catch
            {
                return ServiceResult.Fail("Failed to update risk type", 500);
            }
        }

        public async Task<ServiceResult> DeleteRiskTypeAsync(Guid id)
        {
            try
            {
                var riskType = await _context.RiskTypes.FindAsync(id);
                if (riskType == null || !riskType.IsActive)
                {
                    return ServiceResult.Fail("Risk type not found", 404);
                }

                riskType.IsActive = false;
                riskType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult.Ok();
            }
            catch
            {
                return ServiceResult.Fail("Failed to delete risk type", 500);
            }
        }
    }
}

