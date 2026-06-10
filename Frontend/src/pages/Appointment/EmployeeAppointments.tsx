import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
    Alert, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axiosConfig';
import type { AppointmentUserDto } from '../../types/appointment.types';

function getStatusColor(s?: string): 'default' | 'warning' | 'success' | 'error' | 'info' {
    switch (s?.toLowerCase()) {
        case 'confirmed': return 'success';
        case 'cancelled': return 'error';
        case 'completed': return 'info';
        case 'pending': return 'warning';
        default: return 'default';
    }
}

const STATUS_MAP: Record<string, string> = {
    Pending: '11111111-1111-1111-1111-111111111111',
    Confirmed: '22222222-2222-2222-2222-222222222222',
    Cancelled: '33333333-3333-3333-3333-333333333333',
    Completed: '44444444-4444-4444-4444-444444444444',
};

export default function EmployeeAppointments() {
    const { t, i18n } = useTranslation();

    const [appointments, setAppointments] = useState<AppointmentUserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Confirmation modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = () => {
            api.get('/EmployeeAppointments/MyAppointments')
                .then((res) => setAppointments(res.data.data))
                .catch(() => setError(t('employeeAppointments.loadFailed', 'Failed to load appointments.')))
                .finally(() => setLoading(false));
        };

        fetchAppointments();
    }, [t]);

    // --- Status change (Confirm / Cancel / Complete) ---
    const handleStatusChange = async (id: string, status: string) => {
        setUpdatingId(id);
        setError(null);
        try {
            await api.put(`/EmployeeAppointments/${id}/status`, {
                statusId: STATUS_MAP[status],
            });
            setAppointments((prev) =>
                prev.map((a) => (a.id === id ? { ...a, statusName: status } : a))
            );
            setSuccess(t('employeeAppointments.statusUpdated', 'Status updated successfully.'));
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError(t('employeeAppointments.statusFailed', 'Failed to update status.'));
        } finally {
            setUpdatingId(null);
        }
    };

    // --- Confirm action ---
    const openConfirmModal = (id: string) => {
        setPendingActionId(id);
        setConfirmModalOpen(true);
    };

    const handleConfirmAppointment = async () => {
        if (!pendingActionId) return;
        setConfirmModalOpen(false);
        await handleStatusChange(pendingActionId, 'Confirmed');
        setPendingActionId(null);
    };

    // --- Delete action ---
    const openDeleteModal = (id: string) => {
        setPendingActionId(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteAppointment = async () => {
        if (!pendingActionId) return;
        setDeleteModalOpen(false);
        setUpdatingId(pendingActionId);
        setError(null);
        try {
            await api.delete(`/EmployeeAppointments/${pendingActionId}`);
            setAppointments((prev) => prev.filter((a) => a.id !== pendingActionId));
            setSuccess(t('employeeAppointments.deleteSuccess', 'Appointment deleted successfully.'));
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError(t('employeeAppointments.deleteFailed', 'Failed to delete appointment.'));
        } finally {
            setUpdatingId(null);
            setPendingActionId(null);
        }
    };

    // Dashboard counts
    const pending = appointments.filter((a) => a.statusName?.toLowerCase() === 'pending').length;
    const confirmed = appointments.filter((a) => a.statusName?.toLowerCase() === 'confirmed').length;
    const cancelled = appointments.filter((a) => a.statusName?.toLowerCase() === 'cancelled').length;

    const locale = i18n.language === 'sq' ? 'sq-AL' : i18n.language === 'de' ? 'de-DE' : 'en-US';

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Icon icon="solar:calendar-mark-bold-duotone" width={36} style={{ color: '#1976d2' }} />
                <Box>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {t('employeeAppointments.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t('employeeAppointments.subtitle')}
                    </Typography>
                </Box>
            </Box>

            {/* Dashboard stat cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', flex: '1 1 140px' }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('employeeAppointments.total', 'Total')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {appointments.length}
                    </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', flex: '1 1 140px' }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('employeeAppointments.pending', 'Pending')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        {pending}
                    </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', flex: '1 1 140px' }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('employeeAppointments.confirmed', 'Confirmed')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {confirmed}
                    </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', flex: '1 1 140px' }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('employeeAppointments.cancelled', 'Cancelled')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {cancelled}
                    </Typography>
                </Paper>
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

            {/* Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress size={48} thickness={4} />
                </Box>
            ) : appointments.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Icon icon="solar:calendar-broken" width={60} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 16 }} />
                    <Typography variant="h6">{t('employeeAppointments.noData')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('employeeAppointments.noDataDesc')}
                    </Typography>
                </Paper>
            ) : (
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeAppointments.table.service')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeAppointments.table.client', 'Client')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeAppointments.table.start')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeAppointments.table.end')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeAppointments.table.status')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                        {t('employeeAppointments.table.actions')}
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {appointments.map((app) => {
                                    const isCancelled = app.statusName?.toLowerCase() === 'cancelled';
                                    const isCompleted = app.statusName?.toLowerCase() === 'completed';
                                    const isConfirmed = app.statusName?.toLowerCase() === 'confirmed';
                                    const isLocked = isCompleted || isCancelled;

                                    return (
                                        <TableRow key={app.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                {app.serviceName || '—'}
                                            </TableCell>

                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                {app.userName || '—'}
                                            </TableCell>

                                            <TableCell>
                                                {new Date(app.startTime).toLocaleString(locale, { hour12: false })}
                                            </TableCell>

                                            <TableCell>
                                                {new Date(app.endTime).toLocaleString(locale, { hour12: false })}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={t(`statuses.${app.statusName || 'Pending'}`)}
                                                    size="small"
                                                    color={getStatusColor(app.statusName)}
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </TableCell>

                                            <TableCell align="right">
                                                {updatingId === app.id ? (
                                                    <CircularProgress size={22} />
                                                ) : isLocked ? (
                                                    <Tooltip title={t('employeeAppointments.lockedTooltip')}>
                                                        <span>
                                                            <Icon icon="solar:lock-bold" width={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                                        </span>
                                                    </Tooltip>
                                                ) : (
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                        {/* Confirm button — only for Pending */}
                                                        {!isConfirmed && (
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="success"
                                                                startIcon={<Icon icon="solar:check-circle-bold" />}
                                                                onClick={() => openConfirmModal(app.id)}
                                                                sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}
                                                            >
                                                                {t('employeeAppointments.actions.confirm', 'Confirm')}
                                                            </Button>
                                                        )}

                                                        {/* Delete button */}
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="error"
                                                            startIcon={<Icon icon="solar:trash-bin-2-bold" />}
                                                            onClick={() => openDeleteModal(app.id)}
                                                            sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}
                                                        >
                                                            {t('employeeAppointments.actions.delete', 'Delete')}
                                                        </Button>
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* ── Confirm Appointment Modal ─────────────────────────── */}
            <Dialog
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: 4, p: 1, minWidth: 340 } } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
                    <Icon icon="solar:check-circle-bold" width={26} style={{ color: '#22c55e' }} />
                    {t('employeeAppointments.confirmModal.title', 'Confirm Appointment')}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('employeeAppointments.confirmModal.message', 'Are you sure you want to confirm this appointment?')}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setConfirmModalOpen(false)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        {t('employeeAppointments.confirmModal.no', 'Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleConfirmAppointment}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                        {t('employeeAppointments.confirmModal.yes', 'Yes, Confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Appointment Modal ──────────────────────────── */}
            <Dialog
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: 4, p: 1, minWidth: 340 } } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
                    <Icon icon="solar:trash-bin-2-bold" width={26} style={{ color: '#ef4444' }} />
                    {t('employeeAppointments.deleteModal.title', 'Delete Appointment')}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('employeeAppointments.deleteModal.message', 'Are you sure you want to delete this appointment? This action cannot be undone.')}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setDeleteModalOpen(false)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        {t('employeeAppointments.deleteModal.no', 'Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteAppointment}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                        {t('employeeAppointments.deleteModal.yes', 'Yes, Delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}