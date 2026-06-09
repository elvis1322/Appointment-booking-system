namespace API.Middlewares;

public class AuditLogMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditLogMiddleware> _logger;

    public AuditLogMiddleware(RequestDelegate next, ILogger<AuditLogMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Regjistro kërkesën
        _logger.LogInformation($"HTTP {context.Request.Method} {context.Request.Path} thirrur nga {context.Connection.RemoteIpAddress}");

        await _next(context);
    }
}