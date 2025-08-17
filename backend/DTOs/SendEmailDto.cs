using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace AutomotiveClaimsApi.DTOs
{
    public class SendEmailDto
    {
        public string To { get; set; } = string.Empty;
        public string? Cc { get; set; }
        public string? Bcc { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public bool IsHtml { get; set; }
        public string? ClaimId { get; set; }
        public string? ClaimNumber { get; set; }
        public Guid? EventId { get; set; }
        public List<IFormFile> Attachments { get; set; } = new();
    }
}
