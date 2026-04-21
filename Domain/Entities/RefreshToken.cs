namespace Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid Id { get; set; } 
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public bool IsUsed { get; set; }
    public bool IsRevoked { get; set; } // Për ta anuluar nëse dikush vjedh llogarinë
    public bool IsActive { get; set; }
    public  required Guid UserId { get; set; }
    public User User { get; set; } = null!;
}