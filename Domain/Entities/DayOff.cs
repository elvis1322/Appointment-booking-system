using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class DayOff : BaseEntity
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateOnly Date { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}
