namespace Domain.Entities;
public class Notification : BaseEntity
{
    public Guid Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public required Guid UserId { get; set; }
    public User User { get; set; }= null!;
}