using System;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateVacationRequestDto
    {
        public string CaseHandlerId { get; set; } = string.Empty;
        public string SubstituteId { get; set; } = string.Empty;
        public List<string> ManagerIds { get; set; } = new();
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
