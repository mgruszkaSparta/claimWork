using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateDecisionDto
    {
        [Required]
        public DateTime DecisionDate { get; set; }

        [StringLength(100)]
        public string? Status { get; set; }

        public decimal? Amount { get; set; }

        [StringLength(10)]
        public string? Currency { get; set; }

        [StringLength(200)]
        public string? CompensationTitle { get; set; }

        public List<IFormFile>? Documents { get; set; }

        [StringLength(500)]
        public string? DocumentDescription { get; set; }
    }
}
