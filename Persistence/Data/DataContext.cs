using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Persistence.Data;

public class DataContext : DbContext
{

    private readonly IHttpContextAccessor _httpContextAccessor;


    public DataContext(DbContextOptions<DataContext> options, IHttpContextAccessor httpContextAccessor)
        : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    // Tabelat në Database
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
    //Member 3 - Appointments
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<AppointmentStatus> AppointmentStatuses { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Review> Reviews { get; set; }



    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {

        var auditEntries = this.HandleBeforeSaveChanges(_httpContextAccessor);

        var result = await base.SaveChangesAsync(cancellationToken);


        await this.HandleAfterSaveChangesAsync(auditEntries);

        return result;


    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ConfigureAudit();


        modelBuilder.ConfigureRefreshToken();


        modelBuilder.ConfigureStaffModule();

        modelBuilder.Seed();
    }
}