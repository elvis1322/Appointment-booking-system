using API.Models.Mongo;
using MongoDB.Driver;

namespace API.Services.Mongo;

public class ChatMongoService
{
    private readonly IMongoCollection<ChatMessageDocument> _chatCollection;

    public ChatMongoService(IConfiguration configuration)
    {
        var settings = configuration
            .GetSection("MongoDbSettings")
            .Get<MongoDbSettings>();

        var client = new MongoClient(settings!.ConnectionString);

        var database = client.GetDatabase(settings.DatabaseName);

        _chatCollection = database.GetCollection<ChatMessageDocument>(
            settings.ChatMessagesCollectionName
        );
    }

    public async Task SaveMessageAsync(ChatMessageDocument message)
    {
        await _chatCollection.InsertOneAsync(message);
    }

    public async Task<List<ChatMessageDocument>> GetConversationAsync(
        string conversationId
    )
    {
        return await _chatCollection
            .Find(x => x.ConversationId == conversationId)
            .SortBy(x => x.SentAt)
            .ToListAsync();
    }
}