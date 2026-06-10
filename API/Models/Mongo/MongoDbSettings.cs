namespace API.Models.Mongo;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = string.Empty;

    public string DatabaseName { get; set; } = string.Empty;

    public string ChatMessagesCollectionName { get; set; } = "chat_messages";
}