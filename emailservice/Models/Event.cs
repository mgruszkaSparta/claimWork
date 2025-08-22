using System;
using System.ComponentModel.DataAnnotations;

namespace EmailService.Models;

public class Event
{
    [Key]
    public Guid Id { get; set; }
    [MaxLength(100)]
    public string? ClaimNumber { get; set; }
}
