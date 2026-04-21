using Domain.Entities;
using Domain.Entities.Constants;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
namespace Persistence.Data;

public static class ModelBuilderExtensions
{
    public static void Seed(this ModelBuilder modelBuilder)
    {
        // 1. Konfigurimi i Primary Keys
        modelBuilder.Entity<UserRole>().HasKey(ur => new { ur.UserId, ur.RoleId });
        modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.RoleId, rp.PermissionId });

        // 2. Seed Rolet
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = AppDefaults.Roles.AdminId, Name = "Admin" },
            new Role { Id = AppDefaults.Roles.EmployeeId, Name = "Employee" },
            new Role { Id = AppDefaults.Roles.ClientId, Name = "Client" }
        );

        // 3. Seed Permissions
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = AppDefaults.UserPermissions.UsersRead, Name = "Users:Read" },
            new Permission { Id = AppDefaults.UserPermissions.UsersUpdate, Name = "Users:Update" },
                  new Permission { Id = AppDefaults.UserPermissions.UsersCreate, Name = "Users:Create" },
            new Permission { Id = AppDefaults.UserPermissions.UsersDelete, Name = "Users:Delete" }
        );

        // 4. Lidhja Role-Permission
        modelBuilder.Entity<RolePermission>().HasData(
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersDelete }
        );

        // 5. Seed User Admin
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
                CreatedAt= new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                
            }
        );

        // 6. Lidhja User-Role
        modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = aUserId, RoleId = AppDefaults.Roles.AdminId }
        );
    }
}