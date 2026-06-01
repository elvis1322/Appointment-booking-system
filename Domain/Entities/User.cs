using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;
public class User : BaseEntity
{
    public Guid Id { get; set; }
   
    public  required string FirstName { get; set; } = string.Empty;

    public  required string LastName { get; set; } = string.Empty;
    [EmailAddress]
    public  required string Email { get; set; }

   [MaxLength(1)] 
    public string? Gjinia { get; set; }
    
    public required  string PasswordHash { get; set; } // Ruajmë vlerën nga BCrypt
   
    // Lidhja me tabelën ndërmjetëse
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    // [Member 2] - 1:1 Link with Employee Profile
    public Employee? Employee { get; set; }
}