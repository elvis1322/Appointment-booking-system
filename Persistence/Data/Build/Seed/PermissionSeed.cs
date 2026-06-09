using Domain.Entities;
using Domain.Entities.Constants;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Data;

public class PermissionSeed
{
    public static void SeedPermission(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = AppDefaults.UserPermissions.UsersRead, Name = "Users:Read" },
            new Permission { Id = AppDefaults.UserPermissions.UsersUpdate, Name = "Users:Update" },
            new Permission { Id = AppDefaults.UserPermissions.UsersCreate, Name = "Users:Create" },
            new Permission { Id = AppDefaults.UserPermissions.UsersDelete, Name = "Users:Delete" },
            new Permission { Id = AppDefaults.UserPermissions.UsersCreateClient, Name = "Users:CreateClient" },
            new Permission { Id = AppDefaults.UserPermissions.UsersCreateEmployee, Name = "Users:CreateEmployee" },
       
       // Staff Permissions
            new Permission { Id = AppDefaults.StaffPermissions.StaffRead, Name = "Staff:Read" },
            new Permission { Id = AppDefaults.StaffPermissions.StaffCreate, Name = "Staff:Create" },
            new Permission { Id = AppDefaults.StaffPermissions.StaffUpdate, Name = "Staff:Update" },
            new Permission { Id = AppDefaults.StaffPermissions.StaffDelete, Name = "Staff:Delete" },

            // Service Permissions
            new Permission { Id = AppDefaults.ServicePermissions.ServicesRead, Name = "Services:Read" },
            new Permission { Id = AppDefaults.ServicePermissions.ServicesCreate, Name = "Services:Create" },
            new Permission { Id = AppDefaults.ServicePermissions.ServicesUpdate, Name = "Services:Update" },
            new Permission { Id = AppDefaults.ServicePermissions.ServicesDelete, Name = "Services:Delete" },

            // Schedule Permissions
            new Permission { Id = AppDefaults.SchedulePermissions.SchedulesRead, Name = "Schedules:Read" },
            new Permission { Id = AppDefaults.SchedulePermissions.SchedulesUpdate, Name = "Schedules:Update" }


       //Appotments Permissions
            ,
            new Permission { Id = AppDefaults.AppointmentPermissions.AppointmentsRead, Name = "Appointments:Read" },
            new Permission { Id = AppDefaults.AppointmentPermissions.AppointmentsCreate, Name = "Appointments:Create" },
            new Permission { Id = AppDefaults.AppointmentPermissions.AppointmentsUpdate, Name = "Appointments:Update" },
            new Permission { Id = AppDefaults.AppointmentPermissions.AppointmentsDelete, Name = "Appointments:Delete" },

            // ORDERS
        new Permission { Id = AppDefaults.OrdersPermissions.OrdersRead, Name = "Orders:Read" },
        new Permission { Id = AppDefaults.OrdersPermissions.OrdersCreate, Name = "Orders:Create" },
        new Permission { Id = AppDefaults.OrdersPermissions.OrdersUpdate, Name = "Orders:Update" },
        new Permission { Id = AppDefaults.OrdersPermissions.OrdersDelete, Name = "Orders:Delete" },

        // ORDER ITEMS
        new Permission { Id = AppDefaults.OrderItemPermissions.OrderItemsRead, Name = "OrderItems:Read" },
        new Permission { Id = AppDefaults.OrderItemPermissions.OrderItemsCreate, Name = "OrderItems:Create" },
        new Permission { Id = AppDefaults.OrderItemPermissions.OrderItemsUpdate, Name = "OrderItems:Update" },
        new Permission { Id = AppDefaults.OrderItemPermissions.OrderItemsDelete, Name = "OrderItems:Delete" },

        // PAYMENTS
        new Permission { Id = AppDefaults.PaymentPermissions.PaymentsRead, Name = "Payments:Read" },
        new Permission { Id = AppDefaults.PaymentPermissions.PaymentsCreate, Name = "Payments:Create" },
        new Permission { Id = AppDefaults.PaymentPermissions.PaymentsUpdate, Name = "Payments:Update" },
        new Permission { Id = AppDefaults.PaymentPermissions.PaymentsDelete, Name = "Payments:Delete" },

        // INVOICES
        new Permission { Id = AppDefaults.InvoicePermissions.InvoicesRead, Name = "Invoices:Read" },
        new Permission { Id = AppDefaults.InvoicePermissions.InvoicesCreate, Name = "Invoices:Create" },
        new Permission { Id = AppDefaults.InvoicePermissions.InvoicesUpdate, Name = "Invoices:Update" },
        new Permission { Id = AppDefaults.InvoicePermissions.InvoicesDelete, Name = "Invoices:Delete" },

        // REVIEWS
        new Permission { Id = AppDefaults.ReviewPermissions.ReviewsRead, Name = "Reviews:Read" },
        new Permission { Id = AppDefaults.ReviewPermissions.ReviewsCreate, Name = "Reviews:Create" },
        new Permission { Id = AppDefaults.ReviewPermissions.ReviewsUpdate, Name = "Reviews:Update" },
        new Permission { Id = AppDefaults.ReviewPermissions.ReviewsDelete, Name = "Reviews:Delete" }
       
        );
    }
}