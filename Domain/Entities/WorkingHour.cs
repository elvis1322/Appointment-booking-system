namespace Domain.Entities;

public class WorkingHour : BaseEntity
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public Guid? RoomId { get; set; }
    
    public Room? Room { get; set; }
}
