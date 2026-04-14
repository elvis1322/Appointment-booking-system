
namespace Domain.Entities;
public class Role : BaseEntity
{
    public Guid Id { get; set; } // Këtu do të vijnë GUID-at nga RoleIds
    public required string Name{ get; set; } // "Admin", "Punonjes","Klient" etj.

    // Lidhja me tabelën ndërmjetëse
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; }= new List<RolePermission>();
}