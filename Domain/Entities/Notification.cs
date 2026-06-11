namespace Domain.Entities;

public class Notification : BaseEntity
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public required Guid UserId { get; set; }
    public User User { get; set; } = null!;
}