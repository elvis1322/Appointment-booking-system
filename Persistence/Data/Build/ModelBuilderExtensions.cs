using Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace Persistence.Data;

public static class ModelBuilderExtensions
{
    public static void Seed(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserRole>().HasKey(ur => new { ur.UserId, ur.RoleId });
        //Rolet
        RoleSeed.SeedRole(modelBuilder);
       //Permissions
        PermissionSeed.SeedPermission(modelBuilder);

        modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.RoleId, rp.PermissionId });

        //Mi jap Rolit Permissions
        RolePermissionSeed.SeedRolePermission(modelBuilder);
        //Useri i par
        UserSeed.SeedUser(modelBuilder);
        //Statusat e appoitments
        AppointmentStatusSeed.SeedAppointmentStatus(modelBuilder);

    }
}