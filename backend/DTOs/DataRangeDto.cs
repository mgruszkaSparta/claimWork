
namespace AutomotiveClaimsApi.DTOs
{
    public class DataRangeDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int ClientId { get; set; }
    }

    public class CreateDataRangeDto
    {
        public string UserId { get; set; } = string.Empty;
        public int ClientId { get; set; }
    }
}
