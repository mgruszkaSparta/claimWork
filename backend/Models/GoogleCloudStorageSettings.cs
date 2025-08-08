namespace AutomotiveClaimsApi.Models
{
    public class GoogleCloudStorageSettings
    {
        public bool Enabled { get; set; }
        public string ProjectId { get; set; } = string.Empty;
        public string BucketName { get; set; } = string.Empty;
        public string CredentialsPath { get; set; } = string.Empty;
    }
}
