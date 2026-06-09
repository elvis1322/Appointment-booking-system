using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Security.Claims;
using Stripe;
using QuestPDF.Infrastructure;
using Application.Helpers;
using Persistence.Data;


namespace API; 

public static class DependencyInjection
{
    public static IServiceCollection AddPresentationServices(this IServiceCollection services, IConfiguration config)
    {
       
        QuestPDF.Settings.License = LicenseType.Community;

        var stripeSettings = config.GetSection("Stripe");
        StripeConfiguration.ApiKey = stripeSettings["SecretKey"];

      
        services.AddJwtAuthentication(config);

 
        services.AddSignalR();
        services.AddHttpContextAccessor();
        services.AddCustomCors();


        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            });

        services.AddOpenApi();

    
    
        return services;
    }

 

    private static IServiceCollection AddCustomCors(this IServiceCollection services)
    {
        services.AddCors(options => {
            options.AddPolicy("AllowReact", policy => {
                policy.WithOrigins("http://localhost:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });
        return services;
    }

    private static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
    {
        var jwtSettingsSection = config.GetSection("JwtSettings");
        var jwtSettings = jwtSettingsSection.Get<JwtSettings>();
        services.Configure<JwtSettings>(jwtSettingsSection);

        if (jwtSettings != null) 
        {
            services.AddSingleton(jwtSettings);
        }

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings?.SecretKey ?? string.Empty)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                RoleClaimType = ClaimTypes.Role
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;

                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notifications"))
                    {
                        context.Token = accessToken;
                    }

                    return Task.CompletedTask;
                },
                OnTokenValidated = async context =>
                {
                    var dbContext = context.HttpContext.RequestServices.GetRequiredService<DataContext>();
                    var userIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier);

                    if (userIdClaim == null)
                    {
                        context.Fail("Token i pavlefshëm.");
                        return;
                    }

                    var userId = Guid.Parse(userIdClaim.Value);
                    var user = await dbContext.Users
                        .AsNoTracking()
                        .FirstOrDefaultAsync(u => u.Id == userId);

                    if (user == null)
                    {
                        context.Fail("Ky përdorues nuk ekziston më.");
                    }
                }
            };
        });

        return services;
    }
}