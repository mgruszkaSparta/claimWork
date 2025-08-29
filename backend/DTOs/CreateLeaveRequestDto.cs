using System;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateLeaveRequestDto
    {
        public Guid EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string? EmployeeEmail { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? FirstDayDuration { get; set; }
        public string? LastDayDuration { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Priority { get; set; }
        public Guid? SubstituteId { get; set; }
        public string? SubstituteName { get; set; }
        public string? SubstituteAcceptanceStatus { get; set; }
        public string? TransferDescription { get; set; }
        public string? UrgentProjects { get; set; }
        public string? ImportantContacts { get; set; }
    }
}
