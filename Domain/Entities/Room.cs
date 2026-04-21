using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

/// <summary>Dhomë ose hapësirë brenda një <see cref="Location"/> (p.sh. kabina 1, salla pritjeje).</summary>
public class Room : BaseEntity
{
    public Guid Id { get; set; }

    /// <summary>FK te lokacioni prind.</summary>
    public Guid LocationId { get; set; }
    public Location Location { get; set; } = null!;

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Kapacitet opsional (numër karrigesh / persona njëkohësisht).</summary>
    [Range(1, 500)]
    public int? Capacity { get; set; }

    public bool IsActive { get; set; } = true;

    /// <summary>Orar në kalendar që lidhet me dhomën (shtoje kur ke <see cref="Schedule"/>).</summary>
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
