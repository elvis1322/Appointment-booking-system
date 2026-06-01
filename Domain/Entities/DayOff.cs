using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

<<<<<<< HEAD
=======
/// <summary>Ditë kur punonjësi nuk është në dispozicion (pushim, festë, etj.).</summary>
>>>>>>> origin/main
public class DayOff : BaseEntity
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

<<<<<<< HEAD
=======
    /// <summary>Dita e pushimit (pa orë lokale të përbërë – vetëm data).</summary>
>>>>>>> origin/main
    public DateOnly Date { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}
