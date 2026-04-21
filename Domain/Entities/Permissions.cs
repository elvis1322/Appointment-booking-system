namespace Domain.Entities;
public class Permission : BaseEntity
{
    public Guid Id { get; set; }
    public required string Name { get; set; } // Psh: "USER_DELETE"
    public string? Description  { get; set; } // Psh: "Lejon fshirjen e përdoruesve"

    // Lidhja me tabelën ndërmjetëse
    public ICollection<RolePermission> RolePermissions { get; set; }= new List<RolePermission>();
}