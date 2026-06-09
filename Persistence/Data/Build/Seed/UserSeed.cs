using Domain.Entities;
using Domain.Entities.Constants;
using Microsoft.EntityFrameworkCore;
namespace Persistence.Data;
public class UserSeed
{
    public static void SeedUser( ModelBuilder modelBuilder)
    {
       
          var aUserId = AppDefaults.Users.AUserId;
        string admin123Hash = "$2a$11$ldvPqKZZWhMf5H9tltXeger8A.f3Dg3FZzzGP0mxITZEfWBJpMVkq";

        modelBuilder.Entity<User>().HasData(
            new User 
            { 
                Id = aUserId, 
                FirstName = "Admin", 
                LastName = "User",
                Email = "admin@elearning.com",
                Gjinia = "M",
                PasswordHash = admin123Hash, 
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
         modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = aUserId, RoleId = AppDefaults.Roles.AdminId }
        );
    }
}