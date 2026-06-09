using API;
using Application;
using Persistence;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddPresentationServices(builder.Configuration);
builder.Services.AddPersistenceServices(builder.Configuration);  
builder.Services.AddApplicationServices();                       

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();


app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();



app.Run();