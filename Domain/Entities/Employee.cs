using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class Employee : BaseEntity
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    [MaxLength(150)]
    public string? JobTitle { get; set; }

    [MaxLength(30)]
    public string? Phone { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<EmployeeServiceRelation> ServiceLinks { get; set; } = new List<EmployeeServiceRelation>();

    public ICollection<WorkingHour> WorkingHours { get; set; } = new List<WorkingHour>();

    public ICollection<DayOff> DaysOff { get; set; } = new List<DayOff>();

    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
