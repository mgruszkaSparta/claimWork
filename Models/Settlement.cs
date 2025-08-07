using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Settlement
    {
        [Key]
        public Guid Id { get; set; }

        // Other properties and methods can be added here
    }
}
