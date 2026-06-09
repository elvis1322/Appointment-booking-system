using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Data;

internal static class RefreshTokenConfiguration
{

    public static void ConfigureRefreshToken(this ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<RefreshToken>()
        .HasOne(rt => rt.User)
        .WithMany()
        .HasForeignKey(rt => rt.UserId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Appointment>()
         .HasOne(a => a.Status)
         .WithMany(s => s.Appointments)
         .HasForeignKey(a => a.StatusId);
    }
}