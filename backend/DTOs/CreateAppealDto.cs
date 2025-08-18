using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace AutomotiveClaimsApi.DTOs
{
    public class CreateAppealDto
    {
        [Required]
        public Guid EventId { get; set; }

        [Required]
        public DateTime FilingDate { get; set; }


        public DateTime? ExtensionDate { get; set; }

        public DateTime? DecisionDate { get; set; }


        [StringLength(500)]
        public string? Reason { get; set; }

        [StringLength(100)]
        public string? Status { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        public List<IFormFile>? Documents { get; set; }

        [StringLength(500)]
        public string? DocumentDescription { get; set; }
    }
}
