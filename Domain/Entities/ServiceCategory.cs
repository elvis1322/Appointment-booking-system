using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;
public class ServiceCategory:BaseEntity
{
    public Guid Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>Renditje në UI (numër më i vogël = më sipër në listë).</summary>
    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    /// <summary>Të gjithë shërbimet nën këtë kategori.</summary>
    public ICollection<Service> Services { get; set; } = new List<Service>();
}