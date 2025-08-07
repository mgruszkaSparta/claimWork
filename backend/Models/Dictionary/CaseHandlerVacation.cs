using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models.Dictionary
{
    [Table("CaseHandlerVacations", Schema = "dict")]
    public class CaseHandlerVacation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CaseHandlerId { get; set; }
        public CaseHandler? CaseHandler { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public int? SubstituteHandlerId { get; set; }
        public CaseHandler? SubstituteHandler { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
