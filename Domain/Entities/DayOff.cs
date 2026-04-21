using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

/// <summary>Ditë kur punonjësi nuk është në dispozicion (pushim, festë, etj.).</summary>
public class DayOff : BaseEntity
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    /// <summary>Dita e pushimit (pa orë lokale të përbërë – vetëm data).</summary>
    public DateOnly Date { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}
