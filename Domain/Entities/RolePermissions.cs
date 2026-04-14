namespace Domain.Entities;
public class RolePermission:BaseEntity
{
    public required Guid RoleId { get; set; }
    public Role Role { get; set; }= null!;

    public required Guid PermissionId { get; set; }
    public Permission Permission { get; set; }= null!;
}