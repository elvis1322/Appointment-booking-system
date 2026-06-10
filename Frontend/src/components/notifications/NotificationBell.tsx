import { useCallback, useEffect, useRef, useState } from "react";
import {
    Badge,
    Box,
    IconButton,
    Paper,
    Typography,
    Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { notificationConnection } from "../../services/signalr/notificationConnection";

type NotificationItem = {
    title: string;
    message: string;
    createdAt: string;
    data?: {
        conversationId?: string;
        senderId?: string;
        receiverId?: string;
    };
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const { t } = useTranslation();
    const location = useLocation();
    const notificationRef = useRef<HTMLDivElement>(null);

    const handleReceiveNotification = useCallback(
        (notification: NotificationItem) => {
            console.log("RECEIVED NOTIFICATION:", notification);

            if (notification.data) {
                const unreadChats = JSON.parse(
                    localStorage.getItem("unreadChats") || "{}"
                );

                if (notification.data.conversationId) {
                    unreadChats[notification.data.conversationId] = true;
                }

                if (notification.data.senderId && notification.data.receiverId) {
                    const fallbackConversationId = [
                        notification.data.senderId,
                        notification.data.receiverId,
                    ]
                        .sort()
                        .join("_");

                    unreadChats[fallbackConversationId] = true;
                }

                localStorage.setItem(
                    "unreadChats",
                    JSON.stringify(unreadChats)
                );

                window.dispatchEvent(new Event("unreadChatsChanged"));
            }

            setNotifications((prev) =>
                [notification, ...prev].slice(0, 20)
            );

            setUnreadCount((prev) => prev + 1);
        },
        []
    );

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        notificationConnection.off("ReceiveNotification");
        notificationConnection.on("ReceiveNotification", handleReceiveNotification);

        const startConnection = async () => {
            try {
                if (notificationConnection.state === "Disconnected") {
                    await notificationConnection.start();
                    console.log("Notification SignalR connected");
                }
            } catch (error) {
                console.error("Notification SignalR connection error:", error);
            }
        };

        startConnection();

        return () => {
            notificationConnection.off("ReceiveNotification", handleReceiveNotification);
        };
    }, [handleReceiveNotification]);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const translateNotification = (notification: NotificationItem) => {
        if (notification.title === "New appointment") {
            const parts = notification.message.split("|");

            if (parts[0] === "appointment_created" && parts.length === 4) {
                const clientName = parts[1];
                const employeeName = parts[2];
                const appointmentTime = parts[3];

                return {
                    title: t("notifications.newAppointmentTitle"),
                    message: t("notifications.appointmentCreatedMessage", {
                        clientName,
                        employeeName,
                        appointmentTime,
                    }),
                };
            }

            return {
                title: t("notifications.newAppointmentTitle"),
                message: notification.message,
            };
        }

        if (notification.title === "Appointment cancelled") {
            const parts = notification.message.split("|");

            if (parts[0] === "appointment_cancelled" && parts.length === 3) {
                const clientName = parts[1];
                const appointmentTime = parts[2];

                return {
                    title: t("notifications.appointmentCancelledTitle"),
                    message: t("notifications.appointmentCancelledMessage", {
                        clientName,
                        appointmentTime,
                    }),
                };
            }

            return {
                title: t("notifications.appointmentCancelledTitle"),
                message: notification.message,
            };
        }

        if (notification.title === "New chat message") {
            const parts = notification.message.split("|");
            const senderName = parts.length === 2 ? parts[1] : "";

            return {
                title: t("notifications.newChatMessageTitle"),
                message: t("notifications.newChatMessageMessage", {
                    senderName,
                }),
            };
        }

        return {
            title: notification.title,
            message: notification.message,
        };
    };

    const handleToggleNotifications = () => {
        setIsOpen((prev) => {
            const nextOpen = !prev;

            if (nextOpen) {
                setUnreadCount(0);
            }

            return nextOpen;
        });
    };

    return (
        <Box ref={notificationRef} sx={{ position: "relative", display: "inline-block" }}>
            <IconButton
                onClick={handleToggleNotifications}
                sx={{
                    color: "text.primary",
                    bgcolor: "action.hover",
                    "&:hover": {
                        bgcolor: "action.selected",
                    },
                }}
            >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            {isOpen && (
                <Paper
                    elevation={6}
                    sx={(theme) => ({
                        position: "absolute",
                        right: 0,
                        top: 48,
                        width: 320,
                        borderRadius: 3,
                        overflow: "hidden",
                        zIndex: 9999,
                        bgcolor: "background.paper",
                        color: "text.primary",
                        border: `1px solid ${theme.palette.divider}`,
                    })}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {t("notifications.title")}
                        </Typography>
                    </Box>

                    <Divider />

                    <Box sx={{ maxHeight: 340, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t("notifications.empty")}
                                </Typography>
                            </Box>
                        ) : (
                            notifications.map((notification, index) => {
                                const translatedNotification =
                                    translateNotification(notification);

                                return (
                                    <Box key={index}>
                                        <Box sx={{ p: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {translatedNotification.title}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {translatedNotification.message}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ display: "block", mt: 1 }}
                                            >
                                                {new Date(notification.createdAt).toLocaleString(
                                                    "sq-AL",
                                                    { hour12: false }
                                                )}
                                            </Typography>
                                        </Box>

                                        {index !== notifications.length - 1 && <Divider />}
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
}