using Domain.Entities;
using Domain.Entities.Constants;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Data;

public class RolePermissionSeed
{
    public static void SeedRolePermission(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RolePermission>().HasData(
            //Member 1
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersDelete },
           new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersCreateClient },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.UserPermissions.UsersCreateEmployee },
        
          //Member 2
          // Admin has all Staff, Service and Schedule permissions
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.StaffPermissions.StaffRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.StaffPermissions.StaffCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.StaffPermissions.StaffUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.StaffPermissions.StaffDelete },

            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.ServicePermissions.ServicesRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.ServicePermissions.ServicesCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.ServicePermissions.ServicesUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.ServicePermissions.ServicesDelete },

            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.SchedulePermissions.SchedulesRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.SchedulePermissions.SchedulesUpdate },
        
        
            // Appointments permissions

            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.AppointmentPermissions.AppointmentsRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.AppointmentPermissions.AppointmentsCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.AppointmentPermissions.AppointmentsUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.AppointmentPermissions.AppointmentsDelete },

             // ORDERS
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.OrdersPermissions.OrdersRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.OrdersPermissions.OrdersCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.OrdersPermissions.OrdersUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.OrdersPermissions.OrdersDelete },

            // ORDER ITEMS
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.OrderItemPermissions.OrderItemsRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.OrderItemPermissions.OrderItemsCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.OrderItemPermissions.OrderItemsUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.OrderItemPermissions.OrderItemsDelete },

            // PAYMENTS
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.PaymentPermissions.PaymentsRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.PaymentPermissions.PaymentsCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.PaymentPermissions.PaymentsUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.PaymentPermissions.PaymentsDelete },

            // INVOICES
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.InvoicePermissions.InvoicesRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.InvoicePermissions.InvoicesCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.InvoicePermissions.InvoicesUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.InvoicePermissions.InvoicesDelete },

            // REVIEWS
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.ReviewPermissions.ReviewsRead },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.ReviewPermissions.ReviewsCreate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.ReviewPermissions.ReviewsUpdate },
            new RolePermission { RoleId = AppDefaults.Roles.AdminId, PermissionId = AppDefaults.ReviewPermissions.ReviewsDelete }
        


     );
    }
}