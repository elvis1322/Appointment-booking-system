using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class Service : BaseEntity
{
    public Guid Id { get; set; }

    public Guid ServiceCategoryId { get; set; }
    public ServiceCategory ServiceCategory { get; set; } = null!;

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Range(1, 24 * 60)]
    public int DurationMinutes { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<EmployeeServiceRelation> EmployeeLinks { get; set; } = new List<EmployeeServiceRelation>();
}
