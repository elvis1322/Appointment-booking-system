using API.Models.Mongo;
using API.Services.Mongo;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace API.Hubs;

public class ChatHub : Hub
{
    private readonly ChatMongoService _chatMongoService;
    private readonly IHubContext<NotificationHub> _notificationHub;
    private readonly DataContext _context;

    public ChatHub(
        ChatMongoService chatMongoService,
        IHubContext<NotificationHub> notificationHub,
        DataContext context)
    {
        _chatMongoService = chatMongoService;
        _notificationHub = notificationHub;
        _context = context;
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task SendMessage(
        string conversationId,
        string senderId,
        string receiverId,
        string message)
    {
        var chatMessage = new ChatMessageDocument
        {
            ConversationId = conversationId,
            SenderId = senderId,
            ReceiverId = receiverId,
            Message = message,
            SentAt = DateTime.UtcNow
        };

        await _chatMongoService.SaveMessageAsync(chatMessage);

        await Clients
            .Group(conversationId)
            .SendAsync("ReceiveMessage", chatMessage);

        var senderGuid = Guid.Parse(senderId);

        var sender = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == senderGuid);

        var senderName = sender != null
            ? $"{sender.FirstName} {sender.LastName}"
            : "Someone";

        var chatNotification = new
        {
            title = "New chat message",
            message = $"chat_message_received|{senderName}",
            createdAt = DateTime.UtcNow,
            data = new
            {
                conversationId,
                senderId,
                receiverId
            }
        };

        await _notificationHub.Clients
            .Group($"user-{receiverId}")
            .SendAsync("ReceiveNotification", chatNotification);
    }
}