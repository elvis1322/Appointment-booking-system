using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

<<<<<<< HEAD
=======
/// <summary>Profil punonjësi 1:1 me përdoruesin që ka rol Employee (Member 1 – Users).</summary>
>>>>>>> origin/main
public class Employee : BaseEntity
{
    public Guid Id { get; set; }

<<<<<<< HEAD
    public Guid UserId { get; set; }

=======
    /// <summary>Duhet të jetë unik në DB (një User = një Employee).</summary>
    public Guid UserId { get; set; }
>>>>>>> origin/main
    public User User { get; set; } = null!;

    [MaxLength(150)]
    public string? JobTitle { get; set; }

    [MaxLength(30)]
    public string? Phone { get; set; }

    public bool IsActive { get; set; } = true;

<<<<<<< HEAD
    public ICollection<EmployeeServiceRelation> ServiceLinks { get; set; } = new List<EmployeeServiceRelation>();

    public ICollection<WorkingHour> WorkingHours { get; set; } = new List<WorkingHour>();

    public ICollection<DayOff> DaysOff { get; set; } = new List<DayOff>();

=======
    /// <summary>Hapi 6 – shërbimet që ofron punonjësi (many-to-many).</summary>
    public ICollection<EmployeeServiceRelation> ServiceLinks { get; set; } = new List<EmployeeServiceRelation>();

    /// <summary>Hapi 7 – orari javore i rregullt.</summary>
    public ICollection<WorkingHour> WorkingHours { get; set; } = new List<WorkingHour>();

    /// <summary>Hapi 8 – pushime / ditë të mbyllura.</summary>
    public ICollection<DayOff> DaysOff { get; set; } = new List<DayOff>();

    /// <summary>Hapi 9 – bllokë konkretë në kalendar.</summary>
>>>>>>> origin/main
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
