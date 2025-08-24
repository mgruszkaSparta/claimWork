using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IDamageTypeService
    {

   
        Task<ServiceResult<DamageTypeDto>> GetDamageTypeAsync(int id);
        Task<ServiceResult<IEnumerable<DamageTypeDto>>> GetDamageTypesAsync(int? riskTypeId);

        Task<ServiceResult<DamageTypeDto>> CreateDamageTypeAsync(DamageTypeDto dto);
        Task<ServiceResult> UpdateDamageTypeAsync(int id, DamageTypeDto dto);
        Task<ServiceResult> DeleteDamageTypeAsync(int id);
    }
}

