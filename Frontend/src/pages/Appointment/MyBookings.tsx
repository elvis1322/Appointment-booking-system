import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
    Alert, Dialog, DialogTitle, DialogContent, DialogActions, Rating, TextField
} from '@mui/material';
import { Icon } from '@iconify/react';
import { getAppointments, cancelAppointment } from '../../api/appointmentApi';
import { getMyOrders } from '../../api/orderApi';
import type { OrderResponseDto } from '../../api/orderApi';
import { createReview } from '../../api/reviewApi';
import type { AppointmentUserDto } from '../../types/appointment.types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ChatWindow from '../../components/chat/ChatWindow';
import { notificationConnection } from '../../services/signalr/notificationConnection';

export default function MyBookings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isUser = user?.roles?.includes('Client') || user?.roles?.includes('User');
    const { t, i18n } = useTranslation();

    const [appointments, setAppointments] = useState<AppointmentUserDto[]>([]);
    const [orders, setOrders] = useState<OrderResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const [reviewTarget, setReviewTarget] = useState<AppointmentUserDto | null>(null);
    const [rating, setRating] = useState<number | null>(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());

    const [chatTarget, setChatTarget] = useState<AppointmentUserDto | null>(null);

    const [unreadChats, setUnreadChats] = useState<Record<string, boolean>>({});

    const lastFetchTimeRef = useRef<number>(0);

    const fetchData = async (silent = false) => {
        const now = Date.now();
        if (silent && now - lastFetchTimeRef.current < 5000) {
            return; // Cooldown of 5 seconds to prevent spam
        }
        lastFetchTimeRef.current = now;

        try {
            if (!silent) setLoading(true);

            const [data, ordersData] = await Promise.all([
                getAppointments(),
                getMyOrders().catch(() => [])
            ]);

            setAppointments(data);
            setOrders(ordersData);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || t('bookings.messages.loadFailed', 'Failed to load bookings'));
            } else {
                setError(t('bookings.messages.loadFailed', 'Failed to load bookings'));
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchData();
        };

        loadData();

        // Background polling every 30 seconds
        const intervalId = setInterval(() => {
            fetchData(true);
        }, 30000);

        // Refetch when page becomes visible or focused
        const handleFocus = () => {
            if (document.visibilityState === 'visible') {
                fetchData(true);
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleFocus);

        // Real-time: listen for SYSTEM_UPDATE directly
        const handleSignalR = (notification: { title: string }) => {
            if (notification.title === 'SYSTEM_UPDATE') fetchData(true);
        };
        notificationConnection.on('ReceiveNotification', handleSignalR);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleFocus);
            notificationConnection.off('ReceiveNotification', handleSignalR);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const loadUnreadChats = () => {
            const storedUnreadChats = JSON.parse(
                localStorage.getItem("unreadChats") || "{}"
            );

            setUnreadChats(storedUnreadChats);
        };

        loadUnreadChats();

        window.addEventListener(
            "unreadChatsChanged",
            loadUnreadChats
        );

        return () => {
            window.removeEventListener(
                "unreadChatsChanged",
                loadUnreadChats
            );
        };
    }, []);

    const handleCancelClick = (id: string) => {
        setCancelTargetId(id);
    };

    const handleConfirmCancel = async () => {
        if (!cancelTargetId) return;

        setCancelling(true);
        setError(null);
        setSuccess(null);

        try {
            await cancelAppointment(cancelTargetId);
            setSuccess(t('bookings.messages.cancelSuccess', 'Booking cancelled successfully'));
            await fetchData();
            setCancelTargetId(null);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || t('bookings.messages.cancelFailed', 'Failed to cancel booking'));
            } else {
                setError(t('bookings.messages.cancelFailed', 'Failed to cancel booking'));
            }
        } finally {
            setCancelling(false);
        }
    };

    const handleReviewClick = (app: AppointmentUserDto) => {
        setReviewTarget(app);
        setRating(5);
        setComment('');
    };

    const handleSaveReview = async () => {
        if (!reviewTarget || !rating) return;

        setSubmittingReview(true);
        setError(null);
        setSuccess(null);

        try {
            await createReview({
                appointmentId: reviewTarget.id,
                rating,
                comment,
            });

            setSuccess(t('bookings.messages.reviewSuccess'));
            setRatedIds((prev) => new Set(prev).add(reviewTarget.id));
            setReviewTarget(null);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || t('bookings.messages.reviewFailed'));
            } else {
                setError(t('bookings.messages.reviewFailed'));
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'konfirmuar':
                return 'success';
            case 'pending':
            case 'në pritje':
            case 'pritje':
                return 'warning';
            case 'cancelled':
            case 'anuluar':
                return 'error';
            default:
                return 'default';
        }
    };

    const buildConversationId = (firstUserId: string, secondUserId: string) => {
        return [firstUserId, secondUserId].sort().join('_');
    };

    const handleOpenChat = (app: AppointmentUserDto) => {
        if (!user?.id || !app.employeeUserId) return;

        const conversationId = buildConversationId(
            user.id,
            app.employeeUserId
        );

        const updatedUnreadChats = { ...unreadChats };

        delete updatedUnreadChats[conversationId];

        setUnreadChats(updatedUnreadChats);

        localStorage.setItem(
            "unreadChats",
            JSON.stringify(updatedUnreadChats)
        );

        setChatTarget(app);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Box component="div" sx={{ mb: 4 }}>
                <Typography component="div" variant="h4" sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}>
                    {t('bookings.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t('bookings.subtitle')}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {loading ? (
                <Box component="div" sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                    <CircularProgress size={50} thickness={4} />
                </Box>
            ) : appointments.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: `1px dashed ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                    })}
                >
                    <Icon
                        icon="solar:calendar-broken"
                        width={60}
                        style={{
                            color: document.body.classList.contains('dark-theme')
                                ? 'rgba(255, 255, 255, 0.3)'
                                : '#1976d2',
                            marginBottom: '16px'
                        }}
                    />
                    <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                        {t('bookings.noBookingsTitle')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        {t('bookings.noBookingsDesc')}
                    </Typography>
                </Paper>
            ) : (
                <Box component="div" sx={{ width: '100%', mt: 3 }}>
                    <TableContainer
                        component={Paper}
                        sx={(theme) => ({
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                            background:
                                theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)'
                                    : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0) 100%)',
                            backdropFilter: 'blur(10px)',
                            overflow: 'hidden',
                        })}
                    >
                        <Table>
                            <TableHead sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('bookings.table.service')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('bookings.table.employee', 'Employee')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('bookings.table.dateTime')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('bookings.table.status')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                        {t('bookings.table.actions')}
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {appointments.map((app) => {
                                    const startDate = new Date(app.startTime);
                                    const locale = i18n.language === 'sq' ? 'sq-AL' : i18n.language === 'de' ? 'de-DE' : 'en-US';

                                    const formattedDate = startDate.toLocaleDateString(locale, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    });

                                    const formattedTime = startDate.toLocaleTimeString(locale, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    });

                                    const isCancelable =
                                        app.statusName?.toLowerCase() !== 'cancelled' &&
                                        app.statusName?.toLowerCase() !== 'completed';

                                    const isCompleted = app.statusName?.toLowerCase() === 'completed';

                                    const isActiveAppointment =
    app.statusName?.toLowerCase() !== 'cancelled' &&
    app.statusName?.toLowerCase() !== 'completed';
                                    const appointmentOrder = orders.find((o) => o.appointmentId === app.id);

                                    const isOrderPending =
                                        appointmentOrder &&
                                        appointmentOrder.status?.toLowerCase() === 'pending' &&
                                        app.statusName?.toLowerCase() !== 'cancelled';

                                    return (
                                        <TableRow key={app.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                {app.serviceName || t('bookings.table.defaultService')}
                                            </TableCell>

                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                {app.employeeName || '—'}
                                            </TableCell>

                                            <TableCell>
                                                <Box component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {formattedDate}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {t('bookings.table.timePrefix')}{formattedTime}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={t(`statuses.${app.statusName || 'Pending'}`)}
                                                    color={getStatusColor(app.statusName)}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                                                />
                                            </TableCell>

                                            <TableCell align="right">
                                                <Box component="div" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    {isActiveAppointment && user?.id && app.employeeUserId && (
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={
                                                                <Box
                                                                    sx={{
                                                                        position: "relative",
                                                                        display: "inline-flex",
                                                                    }}
                                                                >
                                                                    <Icon icon="solar:chat-round-bold" />

                                                                    {isActiveAppointment &&
                                                                        unreadChats[
                                                                        buildConversationId(
                                                                            user.id,
                                                                            app.employeeUserId
                                                                        )
                                                                        ] && (
                                                                            <Box
                                                                                sx={{
                                                                                    position: "absolute",
                                                                                    top: -3,
                                                                                    right: -4,
                                                                                    width: 8,
                                                                                    height: 8,
                                                                                    borderRadius: "50%",
                                                                                    bgcolor: "error.main",
                                                                                }}
                                                                            />
                                                                        )}
                                                                </Box>
                                                            }
                                                            onClick={() => handleOpenChat(app)}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            {t('bookings.actions.chat', 'Chat')}
                                                        </Button>
                                                    )}

                                                    {isOrderPending && (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<Icon icon="solar:card-bold" />}
                                                            onClick={() => navigate(`/payment/${appointmentOrder.id}`)}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            {t('payment.payNow')}
                                                        </Button>
                                                    )}

                                                    {isCancelable && (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<Icon icon="solar:close-circle-bold" />}
                                                            onClick={() => handleCancelClick(app.id)}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            {t('bookings.actions.cancel')}
                                                        </Button>
                                                    )}

                                                    {isUser && isCompleted && !ratedIds.has(app.id) && (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<Icon icon="solar:star-bold" />}
                                                            onClick={() => handleReviewClick(app)}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            {t('bookings.actions.rate')}
                                                        </Button>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            <Dialog open={!!cancelTargetId} onClose={() => setCancelTargetId(null)}>
                <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon="solar:danger-bold" width={24} />
                    {t('bookings.cancelDialog.title')}
                </DialogTitle>
                <DialogContent>
                    <Typography>{t('bookings.cancelDialog.desc')}</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCancelTargetId(null)} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>
                        {t('bookings.cancelDialog.keep')}
                    </Button>
                    <Button
                        onClick={handleConfirmCancel}
                        variant="contained"
                        color="error"
                        disabled={cancelling}
                        sx={{ borderRadius: 2 }}
                    >
                        {cancelling ? t('bookings.cancelDialog.cancelling') : t('bookings.cancelDialog.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!reviewTarget} onClose={() => setReviewTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon="solar:chat-round-like-bold" width={24} />
                    {t('bookings.reviewDialog.title')}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t('bookings.reviewDialog.desc')}
                    </Typography>

                    <Box component="div" sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Rating
                            value={rating}
                            onChange={(_, newValue) => setRating(newValue)}
                            size="large"
                            sx={{ color: 'primary.main' }}
                        />
                    </Box>

                    <TextField
                        label={t('bookings.reviewDialog.commentLabel')}
                        multiline
                        rows={4}
                        fullWidth
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('bookings.reviewDialog.commentPlaceholder')}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setReviewTarget(null)} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>
                        {t('bookings.reviewDialog.cancel')}
                    </Button>
                    <Button
                        onClick={handleSaveReview}
                        variant="contained"
                        color="primary"
                        disabled={submittingReview}
                        sx={{ borderRadius: 2 }}
                    >
                        {submittingReview ? t('bookings.reviewDialog.submitting') : t('bookings.reviewDialog.submit')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={!!chatTarget}
                onClose={() => setChatTarget(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 0 }}>
                    {chatTarget && user?.id && chatTarget.employeeUserId && (
                        <ChatWindow
                            conversationId={buildConversationId(user.id, chatTarget.employeeUserId)}
                            senderId={user.id}
                            receiverId={chatTarget.employeeUserId}
                            title={`${t('bookings.actions.chatWith', 'Chat with')} ${chatTarget.employeeName}`}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
}