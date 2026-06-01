using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

<<<<<<< HEAD
=======
/// <summary>Lokacion fizik (filial, klinikë, adresë) ku ndodhen dhomat / zyrat.</summary>
>>>>>>> origin/main
public class Location : BaseEntity
{
    public Guid Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? AddressLine { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    public bool IsActive { get; set; } = true;

<<<<<<< HEAD
=======
    /// <summary>Dhomat nën këtë lokacion (hapja 4 – <see cref="Room"/>).</summary>
>>>>>>> origin/main
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}
