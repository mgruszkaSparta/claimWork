using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IRiskTypeService
    {
        Task<ServiceResult<IEnumerable<RiskTypeDto>>> GetRiskTypesAsync(int? claimObjectTypeId);
        Task<ServiceResult<RiskTypeDto>> GetRiskTypeAsync(Guid id);
        Task<ServiceResult<RiskTypeDto>> CreateRiskTypeAsync(RiskTypeDto dto);
        Task<ServiceResult> UpdateRiskTypeAsync(Guid id, RiskTypeDto dto);
        Task<ServiceResult> DeleteRiskTypeAsync(Guid id);
    }
}

