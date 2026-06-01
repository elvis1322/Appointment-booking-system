namespace Application.DTOs.Staff;

public class WorkingHourResponseDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public Guid? RoomId { get; set; }
}

public class CreateUpdateWorkingHourDto
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public Guid? RoomId { get; set; }
}

public class DayOffResponseDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public DateOnly Date { get; set; }
    public string? Reason { get; set; }
}

public class CreateUpdateDayOffDto
{
    public DateOnly Date { get; set; }
    public string? Reason { get; set; }
}

public class ScheduleResponseDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public DateOnly Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public Guid? RoomId { get; set; }
    public string? Notes { get; set; }
}

public class CreateUpdateScheduleDto
{
    public DateOnly Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public Guid? RoomId { get; set; }
    public string? Notes { get; set; }
}
