using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace AutomotiveClaimsApi.DTOs
{
    public class UpdateSettlementDto
    {
        [StringLength(200)]
        public string? ExternalEntity { get; set; }

        [StringLength(200)]
        public string? CustomExternalEntity { get; set; }

        public DateTime? TransferDate { get; set; }

        [StringLength(100)]
        public string? SettlementNumber { get; set; }

        [StringLength(100)]
        public string? SettlementType { get; set; }

        [Required]
        [StringLength(100)]
        public string Status { get; set; } = string.Empty;

        public DateTime? SettlementDate { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal? Amount { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Settlement amount must be greater than 0")]
        public decimal? SettlementAmount { get; set; }

        [StringLength(10)]
        public string? Currency { get; set; } = "PLN";

        [StringLength(100)]
        public string? PaymentMethod { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public List<IFormFile>? Documents { get; set; }

        [StringLength(500)]
        public string? DocumentDescription { get; set; }
    }
}
