using API.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationsController(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTestNotification()
    {
        var notification = new
        {
            title = "Test notification",
            message = "SignalR notification is working.",
            createdAt = DateTime.UtcNow
        };

        await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification);

        return Ok(notification);
    }
}