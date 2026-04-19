namespace Application.DTOs;

public class AuditLogDto
{
    public Guid Id { get; set; }
    public string? UserName { get; set; } // Emri i përdoruesit në vend të ID-së
    public string Action { get; set; }
    public string TableName { get; set; }
    public DateTime DateTime { get; set; }
      public string? KeyValues { get; set; } 
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? AffectedColumns { get; set; }
}