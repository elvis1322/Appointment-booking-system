namespace Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Kush e bëri veprimin
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    // Çfarë lloj veprimi (psh: "INSERT", "UPDATE", "DELETE", "LOGIN")
    public string Action { get; set; } = string.Empty;

    // Emri i tabelës që u prek (psh: "Appointments", "Users")
    public string TableName { get; set; } = string.Empty;

    // Koha kur ndodhi
    public DateTime DateTime { get; set; } = DateTime.UtcNow;

    // Për siguri: Të dhënat e vjetra dhe të reja (opsionale, në format JSON)
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }

       public string? AffectedColumns { get; set; }
    public string? PrimaryKey { get; set; }
}