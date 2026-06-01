using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

<<<<<<< HEAD
=======
/// <summary>Shërbim i rezervueshëm (p.sh. vizitë, prerje flokësh) brenda një kategorie.</summary>
>>>>>>> origin/main
public class Service : BaseEntity
{
    public Guid Id { get; set; }

<<<<<<< HEAD
=======
    /// <summary>FK te kategoria; EF e mbush kur bën Include.</summary>
>>>>>>> origin/main
    public Guid ServiceCategoryId { get; set; }
    public ServiceCategory ServiceCategory { get; set; } = null!;

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

<<<<<<< HEAD
=======
    /// <summary>Kohëzgjatja e slotit në minuta (për Member 3 / appointments).</summary>
>>>>>>> origin/main
    [Range(1, 24 * 60)]
    public int DurationMinutes { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;

<<<<<<< HEAD
=======
    /// <summary>Lidhje many-to-many me punonjës përmes EmployeeServiceRelation.</summary>
>>>>>>> origin/main
    public ICollection<EmployeeServiceRelation> EmployeeLinks { get; set; } = new List<EmployeeServiceRelation>();
}
