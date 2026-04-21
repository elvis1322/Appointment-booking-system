using System.ComponentModel.DataAnnotations;

public class UserAdminDTO
{
    public Guid Id { get; set; }
     public Guid RoleId { get; set; }

    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? RoleName { get; set; }    
    public required string Email { get; set; }

   [MaxLength(1)] 
    public string? Gjinia { get; set; }= string.Empty;
  
}