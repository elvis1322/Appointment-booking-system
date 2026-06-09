
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Domain.Entities.Constants;


namespace Persistence.Data;
public class AppointmentStatusSeed
{
    public static void SeedAppointmentStatus(ModelBuilder  modelBuilder){
    
   modelBuilder.Entity<AppointmentStatus>().HasData(
    new AppointmentStatus { Id = AppDefaults.AppointmentStatus.Pending, Name = "Pending" },
    new AppointmentStatus { Id = AppDefaults.AppointmentStatus.Confirmed, Name = "Confirmed" },
    new AppointmentStatus { Id = AppDefaults.AppointmentStatus.Cancelled, Name = "Cancelled" },
    new AppointmentStatus { Id = AppDefaults.AppointmentStatus.Completed, Name = "Completed" }
      );

    }

}