using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

<<<<<<< HEAD
=======
/// <summary>Dhomë ose hapësirë brenda një <see cref="Location"/> (p.sh. kabina 1, salla pritjeje).</summary>
>>>>>>> origin/main
public class Room : BaseEntity
{
    public Guid Id { get; set; }

<<<<<<< HEAD
    public Guid LocationId { get; set; }
    
=======
    /// <summary>FK te lokacioni prind.</summary>
    public Guid LocationId { get; set; }
>>>>>>> origin/main
    public Location Location { get; set; } = null!;

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

<<<<<<< HEAD
=======
    /// <summary>Kapacitet opsional (numër karrigesh / persona njëkohësisht).</summary>
>>>>>>> origin/main
    [Range(1, 500)]
    public int? Capacity { get; set; }

    public bool IsActive { get; set; } = true;

<<<<<<< HEAD
=======
    /// <summary>Orar në kalendar që lidhet me dhomën (shtoje kur ke <see cref="Schedule"/>).</summary>
>>>>>>> origin/main
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
