using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IDamageTypeService
    {
        Task<ServiceResult<IEnumerable<DamageTypeDto>>> GetDamageTypesAsync(Guid? riskTypeId);
        Task<ServiceResult<DamageTypeDto>> GetDamageTypeAsync(Guid id);
        Task<ServiceResult<DamageTypeDto>> CreateDamageTypeAsync(DamageTypeDto dto);
        Task<ServiceResult> UpdateDamageTypeAsync(Guid id, DamageTypeDto dto);
        Task<ServiceResult> DeleteDamageTypeAsync(Guid id);
    }
}

