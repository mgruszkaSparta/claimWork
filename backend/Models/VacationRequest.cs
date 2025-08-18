using System;
using System.Collections.Generic;

namespace AutomotiveClaimsApi.Models
{
    public enum VacationRequestStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public class VacationRequest
    {
        public Guid Id { get; set; }
        public string ClaimHandlerId { get; set; } = string.Empty;
        public string SubstituteId { get; set; } = string.Empty;
        public List<string> ManagerIds { get; set; } = new();
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public VacationRequestStatus Status { get; set; } = VacationRequestStatus.Pending;
    }
}
