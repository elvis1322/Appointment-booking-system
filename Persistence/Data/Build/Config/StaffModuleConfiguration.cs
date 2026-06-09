using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Data;

/// <summary>Hapi 11 – lidhjet, çelësat, indekset dhe sjellja në fshirje për modulin Staff/Services.</summary>
internal static class StaffModuleConfiguration
{
    public static void ConfigureStaffModule(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Location>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.AddressLine).HasMaxLength(500);
            e.Property(x => x.City).HasMaxLength(100);
        });

        modelBuilder.Entity<Room>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200);
            e.HasIndex(x => new { x.LocationId, x.Name });
            e.HasOne(x => x.Location)
                .WithMany(l => l.Rooms)
                .HasForeignKey(x => x.LocationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ServiceCategory>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(2000);
        });

        modelBuilder.Entity<Service>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.HasOne(x => x.ServiceCategory)
                .WithMany(c => c.Services)
                .HasForeignKey(x => x.ServiceCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Employee>(e =>
        {
            // [Member 2] - Strict 1:1 relationship with User
            e.HasOne(x => x.User)
                .WithOne(u => u.Employee)
                .HasForeignKey<Employee>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EmployeeServiceRelation>(e =>
        {
            e.ToTable("EmployeeServices");
            e.HasKey(x => new { x.EmployeeId, x.ServiceId });
            e.HasOne(x => x.Employee)
                .WithMany(x => x.ServiceLinks)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Service)
                .WithMany(x => x.EmployeeLinks)
                .HasForeignKey(x => x.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkingHour>(e =>
        {
            e.HasIndex(x => new { x.EmployeeId, x.DayOfWeek, x.StartTime });
            e.HasOne(x => x.Employee)
                .WithMany(x => x.WorkingHours)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Room)
                .WithMany()
                .HasForeignKey(x => x.RoomId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DayOff>(e =>
        {
            e.HasIndex(x => new { x.EmployeeId, x.Date }).IsUnique();
            e.HasOne(x => x.Employee)
                .WithMany(x => x.DaysOff)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Schedule>(e =>
        {
            e.HasIndex(x => new { x.EmployeeId, x.Date, x.StartTime });
            e.HasOne(x => x.Employee)
                .WithMany(x => x.Schedules)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Room)
                .WithMany(r => r.Schedules)
                .HasForeignKey(x => x.RoomId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
