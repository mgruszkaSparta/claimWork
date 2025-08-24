using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IRiskTypeService
    {
        Task<ServiceResult<IEnumerable<RiskTypeDto>>> GetRiskTypesAsync(int? claimObjectTypeId);
        Task<ServiceResult<RiskTypeDto>> GetRiskTypeAsync(int id);
        Task<ServiceResult<RiskTypeDto>> CreateRiskTypeAsync(RiskTypeDto dto);
        Task<ServiceResult> UpdateRiskTypeAsync(int id, RiskTypeDto dto);
        Task<ServiceResult> DeleteRiskTypeAsync(int id);
    }
}

