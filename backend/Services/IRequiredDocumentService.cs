using AutomotiveClaimsApi.DTOs;

namespace AutomotiveClaimsApi.Services
{
    public interface IRequiredDocumentService
    {
        Task<ServiceResult<IEnumerable<RequiredDocumentTypeDto>>> GetRequiredDocumentsAsync(int? claimObjectTypeId);
        Task<ServiceResult<RequiredDocumentTypeDto>> GetRequiredDocumentAsync(int id);
        Task<ServiceResult<RequiredDocumentTypeDto>> CreateRequiredDocumentAsync(RequiredDocumentTypeDto dto);
        Task<ServiceResult> UpdateRequiredDocumentAsync(int id, RequiredDocumentTypeDto dto);
        Task<ServiceResult> DeleteRequiredDocumentAsync(int id);
    }
}
