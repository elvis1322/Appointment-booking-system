using Microsoft.Extensions.DependencyInjection;
using Application.Interfaces;
using Application.Services;
using Application.Services.Staff;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
       
        services.AddAuthServices();
        services.AddStaffServices();
        services.AddAppointmentServices();

        return services;
    }

    private static IServiceCollection AddAuthServices(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUADServices, UADServices>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<AuditLogService>();
        return services;
    }

    private static IServiceCollection AddStaffServices(this IServiceCollection services)
    {
        services.AddScoped<IStaffCatalogService, StaffCatalogService>();
        services.AddScoped<IStaffDirectoryService, StaffDirectoryService>();
        services.AddScoped<IStaffScheduleService, StaffScheduleService>();
        return services;
    }

    private static IServiceCollection AddAppointmentServices(this IServiceCollection services)
    {
        services.AddScoped<IAppointmentUserService, AppointmentUserService>();
        services.AddScoped<IAppointmentAdminService, AppointmentAdminService>();
        services.AddScoped<IOrderUserService, OrderUserService>();
        services.AddScoped<IOrderAdminService, OrderAdminService>();
        services.AddScoped<IPaymentUsersService, PaymentUserService>();
        services.AddScoped<IPaymentAdminService, PaymentAdminService>();
        services.AddScoped<IOrderItemService, OrderItemService>();
        services.AddScoped<IStripeService, StripeService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IReviewService, ReviewService>();
        return services;
    }
}