using System.Collections.Generic;

namespace AutomotiveClaimsApi.DTOs.Dictionary
{
    public class DictionaryResponseDto
    {
        public List<DictionaryItemDto> Items { get; set; } = new List<DictionaryItemDto>();
        public int TotalCount { get; set; }
        public string? Category { get; set; }
    }
}
