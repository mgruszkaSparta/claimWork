using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace AutomotiveClaimsApi.DTOs
{
public class CreateEmailDto
{
  public List<string>? ClaimIds { get; set; }
  public int? EventId { get; set; }
  public string? ClaimNumber { get; set; }
  public string? ThreadId { get; set; }
  public string? MessageId { get; set; }
  public string? InReplyTo { get; set; }
  public string? References { get; set; }
  
  [EmailAddress]
  public string? From { get; set; }

  public string? To { get; set; }

  public string? Cc { get; set; }

  public string? Bcc { get; set; }

  [StringLength(500)]
  public string? Subject { get; set; }

  public string? Body { get; set; }
  
  public string? BodyHtml { get; set; }
  
  public bool IsHtml { get; set; } = true;
  
  public string? Priority { get; set; }
  
  public string Direction { get; set; } = string.Empty; // Inbound, Outbound
  
  public string Status { get; set; } = "Draft";
  
  public DateTime? SentAt { get; set; }
  
  public DateTime? ReceivedAt { get; set; }
  
  public bool IsRead { get; set; } = false;
  
  public bool IsImportant { get; set; } = false;
  
  public bool IsArchived { get; set; } = false;
  
  public string? Tags { get; set; }
  
  public string? Category { get; set; }
  
  public List<IFormFile> Attachments { get; set; } = new();
}
}
