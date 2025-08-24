using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AutomotiveClaimsApi.Services
{
    public class DamageTypeService : IDamageTypeService
    {
        private readonly ApplicationDbContext _context;

        public DamageTypeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<IEnumerable<DamageTypeDto>>> GetDamageTypesAsync(int? riskTypeId)
        {
            try
            {
                var query = _context.DamageTypes
                    .Include(dt => dt.RiskType)
                    .Where(dt => dt.IsActive);

                if (riskTypeId.HasValue)
                {
                    query = query.Where(dt => dt.RiskTypeId == riskTypeId.Value);
                }

                var damageTypes = await query
                    .OrderBy(dt => dt.Name)
                    .Select(dt => new DamageTypeDto
                    {
                        Id = dt.Id,
                        Name = dt.Name,
                        Code = dt.Code,
                        Description = dt.Description,
                        RiskTypeId = dt.RiskTypeId,
                        RiskTypeName = dt.RiskType != null ? dt.RiskType.Name : null,
                        IsActive = dt.IsActive,
                        CreatedAt = dt.CreatedAt,
                        UpdatedAt = dt.UpdatedAt
                    })
                    .ToListAsync();

                return ServiceResult<IEnumerable<DamageTypeDto>>.Ok(damageTypes);
            }
            catch
            {
                return ServiceResult<IEnumerable<DamageTypeDto>>.Fail("Failed to fetch damage types", 500);
            }
        }

        public async Task<ServiceResult<DamageTypeDto>> GetDamageTypeAsync(int id)
        {
            try
            {
                var damageType = await _context.DamageTypes
                    .Include(dt => dt.RiskType)
                    .FirstOrDefaultAsync(dt => dt.Id == id && dt.IsActive);

                if (damageType == null)
                {
                    return ServiceResult<DamageTypeDto>.Fail("Damage type not found", 404);
                }

                var dto = new DamageTypeDto
                {
                    Id = damageType.Id,
                    Name = damageType.Name,
                    Code = damageType.Code,
                    Description = damageType.Description,
                    RiskTypeId = damageType.RiskTypeId,
                    RiskTypeName = damageType.RiskType?.Name,
                    IsActive = damageType.IsActive,
                    CreatedAt = damageType.CreatedAt,
                    UpdatedAt = damageType.UpdatedAt
                };

                return ServiceResult<DamageTypeDto>.Ok(dto);
            }
            catch
            {
                return ServiceResult<DamageTypeDto>.Fail("Failed to fetch damage type", 500);
            }
        }

        public async Task<ServiceResult<DamageTypeDto>> CreateDamageTypeAsync(DamageTypeDto dto)
        {
            try
            {
                var riskExists = await _context.RiskTypes
                    .AnyAsync(rt => rt.Id == dto.RiskTypeId && rt.IsActive);
                if (!riskExists)
                {
                    return ServiceResult<DamageTypeDto>.Fail("Risk type not found or inactive", 400);
                }

                if (await _context.DamageTypes.AnyAsync(dt => dt.Code == dto.Code && dt.RiskTypeId == dto.RiskTypeId))
                {
                    return ServiceResult<DamageTypeDto>.Fail("Damage type code already exists", 409);
                }

                var damageType = new Models.DamageType
                {
                    Name = dto.Name,
                    Code = dto.Code,
                    Description = dto.Description,
                    RiskTypeId = dto.RiskTypeId,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.DamageTypes.Add(damageType);
                await _context.SaveChangesAsync();

                var riskTypeName = await _context.RiskTypes
                    .Where(rt => rt.Id == dto.RiskTypeId)
                    .Select(rt => rt.Name)
                    .FirstOrDefaultAsync();

                var result = new DamageTypeDto
                {
                    Id = damageType.Id,
                    Name = damageType.Name,
                    Code = damageType.Code,
                    Description = damageType.Description,
                    RiskTypeId = damageType.RiskTypeId,
                    RiskTypeName = riskTypeName,
                    IsActive = damageType.IsActive,
                    CreatedAt = damageType.CreatedAt,
                    UpdatedAt = damageType.UpdatedAt
                };

                return ServiceResult<DamageTypeDto>.Created(result);
            }
            catch
            {
                return ServiceResult<DamageTypeDto>.Fail("Failed to create damage type", 500);
            }
        }

        public async Task<ServiceResult> UpdateDamageTypeAsync(int id, DamageTypeDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return ServiceResult.Fail("ID mismatch", 400);
                }

                var damageType = await _context.DamageTypes.FindAsync(id);
                if (damageType == null || !damageType.IsActive)
                {
                    return ServiceResult.Fail("Damage type not found", 404);
                }

                if (!await _context.RiskTypes.AnyAsync(rt => rt.Id == dto.RiskTypeId && rt.IsActive))
                {
                    return ServiceResult.Fail("Risk type not found or inactive", 400);
                }

                if (await _context.DamageTypes.AnyAsync(dt => dt.Code == dto.Code && dt.RiskTypeId == dto.RiskTypeId && dt.Id != id))
                {
                    return ServiceResult.Fail("Damage type code already exists", 409);
                }

                damageType.Name = dto.Name;
                damageType.Code = dto.Code;
                damageType.Description = dto.Description;
                damageType.RiskTypeId = dto.RiskTypeId;
                damageType.IsActive = dto.IsActive;
                damageType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult.Ok();
            }
            catch
            {
                return ServiceResult.Fail("Failed to update damage type", 500);
            }
        }

        public async Task<ServiceResult> DeleteDamageTypeAsync(int id)
        {
            try
            {
                var damageType = await _context.DamageTypes.FindAsync(id);
                if (damageType == null || !damageType.IsActive)
                {
                    return ServiceResult.Fail("Damage type not found", 404);
                }

                damageType.IsActive = false;
                damageType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult.Ok();
            }
            catch
            {
                return ServiceResult.Fail("Failed to delete damage type", 500);
            }
        }
    }
}

