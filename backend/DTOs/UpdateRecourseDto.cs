using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateRecourseDto
    {
        [Required]
        public bool IsJustified { get; set; }

        [Required]
        public DateTime FilingDate { get; set; }

        [Required]
        [StringLength(200)]
        public string InsuranceCompany { get; set; } = string.Empty;

        public DateTime? ObtainDate { get; set; }

        public decimal? Amount { get; set; }

        [StringLength(3)]
        public string? CurrencyCode { get; set; }

        [StringLength(500)]
        public string? DocumentDescription { get; set; }

        public List<IFormFile>? Documents { get; set; }
    }
}
