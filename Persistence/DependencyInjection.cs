using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration; 
using Microsoft.EntityFrameworkCore; 
using Domain.Interfaces;
using Persistence.Repositories;
using Persistence.Data;


namespace Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration config)
    {
      
        services.AddDbContext<DataContext>(options =>
        {
            options.UseSqlite(config.GetConnectionString("DefaultConnection"));
        });

        services.AddAuthRepositories();
        services.AddStaffRepositories();
        services.AddAppointmentRepositories();

        return services;
    }

    private static IServiceCollection AddAuthRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        return services;
    }

    private static IServiceCollection AddStaffRepositories(this IServiceCollection services)
    {
        services.AddScoped<IStaffCatalogRepository, StaffCatalogRepository>();
        services.AddScoped<IStaffDirectoryRepository, StaffDirectoryRepository>();
        services.AddScoped<IStaffScheduleRepository, StaffScheduleRepository>();
        return services;
    }

    private static IServiceCollection AddAppointmentRepositories(this IServiceCollection services)
    {
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IOrderItemRepository, OrderItemRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        return services;
    }
}