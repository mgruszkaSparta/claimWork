using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface ICaseHandlerService
    {
        Task<ServiceResult<IEnumerable<CaseHandlerDto>>> GetCaseHandlersAsync();
        Task<ServiceResult<CaseHandlerDto>> GetCaseHandlerAsync(int id);
        Task<ServiceResult<CaseHandlerDto>> CreateCaseHandlerAsync(CaseHandlerDto dto);
        Task<ServiceResult> UpdateCaseHandlerAsync(int id, CaseHandlerDto dto);
        Task<ServiceResult> DeleteCaseHandlerAsync(int id);
    }
}
