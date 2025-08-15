namespace AutomotiveClaimsApi.DTOs.Dictionary
{
    public class DictionaryItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int? SortOrder { get; set; }

        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Department { get; set; }
    }
}
