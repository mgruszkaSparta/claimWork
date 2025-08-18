using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.Models
{
    public class SmtpSettings
    {
        [Key]
        public int Id { get; set; }

        public string Host { get; set; } = string.Empty;
        public int Port { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public int Timeout { get; set; } = 30000;
        public bool UseDefaultCredentials { get; set; } = false;
        public string ImapServer { get; set; } = string.Empty;
        public int ImapPort { get; set; } = 993;
    }
}
