using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Persistence.Data;
using Application.Helpers;



var builder = WebApplication.CreateBuilder(args);


var jwtSettingsSection = builder.Configuration.GetSection("JwtSettings");
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.Configure<JwtSettings>(jwtSettingsSection);

if (jwtSettings != null) 
{
    builder.Services.AddSingleton(jwtSettings);
}
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings.SecretKey)),
        ValidateIssuer = false, // Vendose true nese e ke ne JwtSettings
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            // Marrim DataContext nga Shërbimet
            var dbContext = context.HttpContext.RequestServices.GetRequiredService<DataContext>();
            
            // Marrim ID-në e përdoruesit nga Claims e Token-it
            var userIdClaim = context.Principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                context.Fail("Token i pavlefshëm.");
                return;
            }

            var userId = Guid.Parse(userIdClaim.Value);

            // Kontrollojmë nëse përdoruesi ekziston ende në DB dhe a është aktiv
            var user = await dbContext.Users
                .AsNoTracking() // Për performancë më të mirë pasi është vetëm kontroll
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                // Nëse përdoruesi është fshirë nga tabela Users, dëboje menjëherë
                context.Fail("Ky përdorues nuk ekziston më.");
            }
            // Opsionale: mund të kontrollosh edhe fushën is_active këtu
            // else if (!user.is_active) { context.Fail("Llogaria është deaktvizuar."); }
        }
    };
});







builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});






builder.Services.AddControllers();

builder.Services.AddOpenApi();

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();



app.Run();
