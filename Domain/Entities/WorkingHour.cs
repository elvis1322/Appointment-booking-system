namespace Domain.Entities;

/// <summary>Orari i rregullt javor (p.sh. e hënë 09:00–17:00) për një punonjës.</summary>
public class WorkingHour : BaseEntity
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    /// <summary>.NET <see cref="DayOfWeek"/>: e diel = 0, e hënë = 1, … e shtunë = 6.</summary>
    public DayOfWeek DayOfWeek { get; set; }

    /// <summary>Ora e fillimit (vetëm koha, e njëjtë çdo javë për këtë ditë).</summary>
    public TimeSpan StartTime { get; set; }

    /// <summary>Duhet të jetë pas <see cref="StartTime"/>; kontrollo në shërbim (business logic).</summary>
    public TimeSpan EndTime { get; set; }

    /// <summary>Dhomë opsionale nëse orari është i lidhur me një hapësirë konkrete.</summary>
    public Guid? RoomId { get; set; }
    public Room? Room { get; set; }
}
