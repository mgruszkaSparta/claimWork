using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IDamageTypeService
    {
        Task<ServiceResult<IEnumerable<DamageTypeDto>>> GetDamageTypesAsync(Guid? riskTypeId);
        Task<ServiceResult<DamageTypeDto>> GetDamageTypeAsync(int id);
        Task<ServiceResult<DamageTypeDto>> CreateDamageTypeAsync(DamageTypeDto dto);
        Task<ServiceResult> UpdateDamageTypeAsync(int id, DamageTypeDto dto);
        Task<ServiceResult> DeleteDamageTypeAsync(int id);
    }
}

