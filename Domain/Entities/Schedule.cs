using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class Schedule : BaseEntity
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateOnly Date { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public Guid? RoomId { get; set; }
    public Room? Room { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
