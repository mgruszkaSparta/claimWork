using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutomotiveClaimsApi.Models.Dictionary
{
    [Table("LeasingCompanies", Schema = "dict")]
    public class LeasingCompany
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Code { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
