
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Domain.Entities.Constants;


namespace Persistence.Data;
public class RoleSeed
{
    public static void SeedRole(ModelBuilder  modelBuilder){
    
     modelBuilder.Entity<Role>().HasData(
            new Role { Id = AppDefaults.Roles.AdminId, Name = "Admin" },
            new Role { Id = AppDefaults.Roles.EmployeeId, Name = "Employee" },
            new Role { Id = AppDefaults.Roles.ClientId, Name = "Client" }
        );

    }

}