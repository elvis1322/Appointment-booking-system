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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Seed();
    }
}