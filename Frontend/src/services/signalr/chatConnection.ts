import * as signalR from "@microsoft/signalr";

export const chatConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5213/hubs/chat")
    .withAutomaticReconnect()
    .build();