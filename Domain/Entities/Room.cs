using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class Room : BaseEntity
{
    public Guid Id { get; set; }

    public Guid LocationId { get; set; }
    
    public Location Location { get; set; } = null!;

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(1, 500)]
    public int? Capacity { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
