using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

/// <summary>
/// Bllok në kalendar për një ditë të caktuar (ndryshe nga <see cref="WorkingHour"/> që përsëritet çdo javë).
/// Përdoret për turne, override orari, ose paraqitje në UI kalendar.
/// </summary>
public class Schedule : BaseEntity
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateOnly Date { get; set; }

    /// <summary>Krahasuar me <see cref="EndTime"/>, duhet të jetë më herët – verifiko në shërbim.</summary>
    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public Guid? RoomId { get; set; }
    public Room? Room { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
