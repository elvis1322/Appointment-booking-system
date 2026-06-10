import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { chatConnection } from "../../services/signalr/chatConnection";

type ChatMessage = {
    id?: string;
    conversationId?: string;
    senderId: string;
    receiverId: string;
    message: string;
    isRead?: boolean;
    sentAt: string;
};

interface ChatWindowProps {
    conversationId: string;
    senderId: string;
    receiverId: string;
    title?: string;
}

export default function ChatWindow({
    conversationId,
    senderId,
    receiverId,
    title = "Private Chat",
}: ChatWindowProps) {
    const theme = useTheme();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState("");
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const isSendingRef = useRef(false);

    const isDark = theme.palette.mode === "dark";

    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                setLoadingHistory(true);

                const response = await fetch(
                    `http://localhost:5213/api/ChatHistory/${conversationId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to load chat history");
                }

                const history: ChatMessage[] = await response.json();
                setMessages(history);
            } catch (err) {
                console.error("Chat history error:", err);
                setError("Could not load chat history.");
            } finally {
                setLoadingHistory(false);
            }
        };

        loadChatHistory();
    }, [conversationId]);

    useEffect(() => {
        const receiveMessageHandler = (newMessage: ChatMessage) => {
            if (newMessage.conversationId !== conversationId) return;

            setMessages((prev) => [...prev, newMessage]);
        };

        const startConnection = async () => {
            try {
                if (chatConnection.state === "Disconnected") {
                    await chatConnection.start();
                }

                let retries = 0;

                while (
                    chatConnection.state !== "Connected" &&
                    retries < 20
                ) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, 100)
                    );

                    retries++;
                }

                if (chatConnection.state !== "Connected") {
                    throw new Error(
                        "SignalR connection failed."
                    );
                }

                await chatConnection.invoke(
                    "JoinConversation",
                    conversationId
                );

                chatConnection.off("ReceiveMessage");
                chatConnection.on(
                    "ReceiveMessage",
                    receiveMessageHandler
                );
            } catch (error) {
                console.error("Chat SignalR error:", error);

                setError(
                    "Could not connect to real-time chat."
                );
            }
        };

        startConnection();

        return () => {
            chatConnection.off("ReceiveMessage", receiveMessageHandler);

            if (chatConnection.state === "Connected") {
                chatConnection
                    .invoke("LeaveConversation", conversationId)
                    .catch(() => { });
            }
        };
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const sendMessage = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) return;

        if (isSendingRef.current) return;

        isSendingRef.current = true;

        try {
            if (chatConnection.state !== "Connected") {
                return;
            }

            await chatConnection.invoke(
                "SendMessage",
                conversationId,
                senderId,
                receiverId,
                trimmedMessage
            );

            setMessage("");
        } catch (error) {
            console.error("Send message error:", error);
            setError("Message could not be sent.");
        } finally {
            isSendingRef.current = false;
        }
    };

    return (
        <div
            style={{
                background: isDark ? "#1f1f1f" : "#ffffff",
                color: isDark ? "white" : "#111827",
                padding: "16px",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "100%",
                height: "70vh",
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                boxShadow: isDark
                    ? "0 4px 20px rgba(0,0,0,0.4)"
                    : "0 4px 20px rgba(0,0,0,0.08)",
            }}
        >
            <h3
                style={{
                    margin: 0,
                    paddingBottom: "12px",
                    borderBottom: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                }}
            >
                {title}
            </h3>

            {error && (
                <div
                    style={{
                        background: isDark ? "#4a1f1f" : "#fee2e2",
                        color: isDark ? "#ffb3b3" : "#b91c1c",
                        padding: "8px",
                        borderRadius: "6px",
                        marginBottom: "10px",
                        fontSize: "14px",
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                    padding: "12px",
                    marginBottom: "12px",
                    borderRadius: "8px",
                    background: isDark ? "#151515" : "#f9fafb",
                }}
            >
                {loadingHistory ? (
                    <div style={{ color: isDark ? "#aaa" : "#6b7280" }}>
                        Loading chat history...
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ color: isDark ? "#aaa" : "#6b7280" }}>
                        No messages yet.
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.senderId === senderId;

                        return (
                            <div
                                key={msg.id || index}
                                style={{
                                    display: "flex",
                                    justifyContent: isMine
                                        ? "flex-end"
                                        : "flex-start",
                                    marginBottom: "8px",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "75%",
                                        padding: "8px 10px",
                                        borderRadius: "10px",
                                        background: isMine
                                            ? "#1976d2"
                                            : isDark
                                                ? "#333"
                                                : "#e5e7eb",
                                        color: isMine
                                            ? "white"
                                            : isDark
                                                ? "white"
                                                : "#111827",
                                    }}
                                >
                                    <div>{msg.message}</div>

                                    {msg.sentAt && (
                                        <div
                                            style={{
                                                fontSize: "10px",
                                                opacity: 0.7,
                                                marginTop: "4px",
                                                textAlign: "right",
                                            }}
                                        >
                                            {new Date(
                                                msg.sentAt
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                <div ref={bottomRef} />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder="Write message..."
                    style={{
                        padding: "10px",
                        flex: 1,
                        borderRadius: "8px",
                        border: `1px solid ${isDark ? "#444" : "#d1d5db"}`,
                        background: isDark ? "#111" : "white",
                        color: isDark ? "white" : "#111827",
                    }}
                />

                <button
                    type="button"
                    onClick={sendMessage}
                    disabled={isSendingRef.current}
                    style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#1976d2",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}