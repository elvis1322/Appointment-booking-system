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

        // Module 3: Appointments
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IAppointmentUserService, AppointmentUserService>();
        services.AddScoped<IAppointmentAdminService, AppointmentAdminService>();

      return services;
    }
}