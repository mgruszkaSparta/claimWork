namespace AutomotiveClaimsApi.Models
{
    public class UserClient
    {
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        public int ClientId { get; set; }
        public Client Client { get; set; } = null!;
    }
}
