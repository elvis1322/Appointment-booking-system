using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

/// <summary>Shërbim i rezervueshëm (p.sh. vizitë, prerje flokësh) brenda një kategorie.</summary>
public class Service : BaseEntity
{
    public Guid Id { get; set; }

    /// <summary>FK te kategoria; EF e mbush kur bën Include.</summary>
    public Guid ServiceCategoryId { get; set; }
    public ServiceCategory ServiceCategory { get; set; } = null!;

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>Kohëzgjatja e slotit në minuta (për Member 3 / appointments).</summary>
    [Range(1, 24 * 60)]
    public int DurationMinutes { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;

    /// <summary>Lidhje many-to-many me punonjës përmes EmployeeServiceRelation.</summary>
    public ICollection<EmployeeServiceRelation> EmployeeLinks { get; set; } = new List<EmployeeServiceRelation>();
}
