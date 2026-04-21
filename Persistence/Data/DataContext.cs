using Domain.Entities;
using Domain.Entities.Constants;
using Microsoft.EntityFrameworkCore;

using System.Security.Claims;    // Shto këtë për ClaimTypes
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Persistence.Data;

public class DataContext : DbContext
{
    // public DataContext(DbContextOptions<DataContext> options)
       public DataContext(DbContextOptions<DataContext> options) 
        : base(options)
    {
       
    }
   
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    // Member 2 – Services, staff, locations, schedule 
    public DbSet<ServiceCategory> ServiceCategories { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<EmployeeServiceRelation> EmployeeServices { get; set; }
    public DbSet<WorkingHour> WorkingHours { get; set; }
    public DbSet<DayOff> DaysOff { get; set; }
    public DbSet<Schedule> Schedules { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
       
        base.OnModelCreating(modelBuilder);
        modelBuilder.Seed();
        
         base.OnModelCreating(modelBuilder);
    // Konfigurimi i Composite Key për tabelën lidhëse
    modelBuilder.Entity<EmployeeServiceRelation>()
        .HasKey(es => new { es.EmployeeId, es.ServiceId });
    // (Opsionale) Mund të shtosh edhe konfigurime të tjera këtu
    }
}