import * as signalR from "@microsoft/signalr";

export const notificationConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5213/hubs/notifications", {
        accessTokenFactory: () => localStorage.getItem("token") || "",
    })
    .withAutomaticReconnect()
    .build();