using Microsoft.Extensions.DependencyInjection;
using Application.Interfaces;
using Application.Services;
using Domain.Interfaces;
using Persistence.Repositories;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
      
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUADServices, UADServices>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        // Module 3: Appointments & Payments
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IAppointmentUserService, AppointmentUserService>();
        services.AddScoped<IAppointmentAdminService, AppointmentAdminService>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IPaymentUsersService, PaymentUserService>();
        services.AddScoped<IPaymentAdminService, PaymentAdminService>();
        services.AddScoped<IStripeService, StripeService>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IOrderUserService, OrderUserService>();
        services.AddScoped<IOrderAdminService, OrderAdminService>();
        services.AddScoped<IOrderItemRepository, OrderItemRepository>();
        services.AddScoped<IOrderItemService, OrderItemService>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IReviewService, ReviewService>();

      return services;
    }
}