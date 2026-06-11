using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

/// <summary>Represents a file uploaded to the system.</summary>
public class UploadedFile : BaseEntity
{
    public Guid Id { get; set; }

    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ContentType { get; set; } = string.Empty;

    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    public long FileSize { get; set; }
}
