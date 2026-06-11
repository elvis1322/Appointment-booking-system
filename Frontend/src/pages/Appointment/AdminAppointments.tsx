import { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell,TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Alert, Select, MenuItem, IconButton, Tooltip, Dialog,DialogTitle, DialogContent, DialogActions, Button, Menu,} from '@mui/material';
import { Icon } from '@iconify/react';
import {adminGetAllAppointments,adminChangeAppointmentStatus,adminDeleteAppointment,type AppointmentStatus} from '../../api/appointmentApi';
import type { AppointmentAdminDto } from '../../types/appointment.types';
import { useTranslation } from 'react-i18next';
import { notificationConnection } from '../../services/signalr/notificationConnection';
import { exportData } from '../../api/reportsApi';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

function getStatusColor(status?: string): 'default' | 'warning' | 'error' | 'success' | 'info' {
  switch (status?.toLowerCase()) {
    case 'confirmed': return 'success';
    case 'cancelled': return 'error';
    case 'completed': return 'info';
    case 'pending': return 'warning';
    default: return 'default';
  }
}

export default function AdminAppointments() {
  const { t, i18n } = useTranslation();
  const [appointments, setAppointments] = useState<AppointmentAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentAdminDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState(false);

  const lastFetchTimeRef = useRef<number>(0);

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setExportAnchor(null);
    setExporting(true);
    try {
      await exportData('appointments', format);
    } catch {
      setError('Export dështoi. Provoni përsëri.');
    } finally {
      setExporting(false);
    }
  };

  const fetchData = async (silent = false) => {
    const now = Date.now();
    if (silent && now - lastFetchTimeRef.current < 5000) return;
    lastFetchTimeRef.current = now;

    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await adminGetAllAppointments();
      setAppointments(data);
    } catch {
      setError(t('adminAppointments.loadFailed', 'Failed to load appointments.'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Background polling every 30 seconds
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 30000);

    // Refetch only when tab becomes visible
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    // Real-time: listen for SYSTEM_UPDATE directly (no NotificationBell changes needed)
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

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    setUpdatingId(id);
    setError(null);
    try {
      const updated = await adminChangeAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, statusName: updated.statusName } : a));
      setSuccess(t('adminAppointments.statusUpdated', 'Status updated successfully.'));
      setTimeout(() => setSuccess(null), 3000);
      fetchData(true);
    } catch {
      setError(t('adminAppointments.statusFailed', 'Failed to update status.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteAppointment(deleteTarget.id);
      setAppointments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setSuccess(t('adminAppointments.deleteSuccess', 'Appointment deleted.'));
      setTimeout(() => setSuccess(null), 3000);
      setDeleteTarget(null);
      fetchData(true);
    } catch {
      setError(t('adminAppointments.deleteFailed', 'Failed to delete appointment.'));
    } finally {
      setDeleting(false);
    }
  };

  const pending = appointments.filter((a) => a.statusName?.toLowerCase() === 'pending').length;
  const confirmed = appointments.filter((a) => a.statusName?.toLowerCase() === 'confirmed').length;
  const cancelled = appointments.filter((a) => a.statusName?.toLowerCase() === 'cancelled').length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Icon icon="solar:calendar-bold-duotone" width={36} style={{ color: '#1976d2' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {t('adminAppointments.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('adminAppointments.subtitle')}
          </Typography>
        </Box>
        {/* Export Button */}
        <Button
          variant="outlined"
          startIcon={<Icon icon="solar:export-bold" width={18} />}
          endIcon={<Icon icon="solar:alt-arrow-down-bold" width={14} />}
          onClick={(e) => setExportAnchor(e.currentTarget)}
          disabled={exporting}
          sx={{ borderRadius: 2, fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {exporting ? t('export.exportingBtn', 'Duke eksportuar...') : t('export.exportBtn', 'Eksporto')}
        </Button>
        <Menu
          anchorEl={exportAnchor}
          open={Boolean(exportAnchor)}
          onClose={() => setExportAnchor(null)}
        >
          <MenuItem onClick={() => handleExport('excel')}>
            <Icon icon="vscode-icons:file-type-excel" width={18} style={{ marginRight: 8 }} />
            {t('export.downloadExcel', 'Shkarko Excel (.xlsx)')}
          </MenuItem>
          <MenuItem onClick={() => handleExport('csv')}>
            <Icon icon="vscode-icons:file-type-csv" width={18} style={{ marginRight: 8 }} />
            {t('export.downloadCsv', 'Shkarko CSV (.csv)')}
          </MenuItem>
          <MenuItem onClick={() => handleExport('json')}>
            <Icon icon="vscode-icons:file-type-json" width={18} style={{ marginRight: 8 }} />
            {t('export.downloadJson', 'Shkarko JSON (.json)')}
          </MenuItem>
        </Menu>
      </Box>

      {/* Summary Cards */}
      {!loading && (
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 140px' })}>
            <Typography variant="body2" color="text.secondary">{t('adminAppointments.total', 'Total')}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{appointments.length}</Typography>
          </Paper>
          <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 140px' })}>
            <Typography variant="body2" color="text.secondary">{t('adminAppointments.pending', 'Pending')}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>{pending}</Typography>
          </Paper>
          <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 140px' })}>
            <Typography variant="body2" color="text.secondary">{t('adminAppointments.confirmed', 'Confirmed')}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>{confirmed}</Typography>
          </Paper>
          <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 140px' })}>
            <Typography variant="body2" color="text.secondary">{t('adminAppointments.cancelled', 'Cancelled')}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>{cancelled}</Typography>
          </Paper>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : appointments.length === 0 ? (
        <Paper elevation={0} sx={(theme) => ({ p: 6, textAlign: 'center', borderRadius: 3, border: `1px dashed ${theme.palette.divider}` })}>
          <Icon icon="solar:calendar-broken" width={60} style={{ color: (document.body.classList.contains('dark-theme') ? 'rgba(255,255,255,0.3)' : '#1976d2'), marginBottom: 16 }} />
          <Typography variant="h6" sx={{ color: 'text.primary' }}>{t('adminAppointments.noData')}</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={(theme) => ({ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` })}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminAppointments.table.userName')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminAppointments.table.id')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminAppointments.table.service')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminAppointments.table.employee', 'Employee')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminAppointments.table.start')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminAppointments.table.end')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminAppointments.table.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('adminAppointments.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((app) => (
                  <TableRow key={app.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {app.userName || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        {app.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {app.serviceName || '—'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {app.employeeName || '—'}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const locale = i18n.language === 'sq' ? 'sq-AL' : i18n.language === 'de' ? 'de-DE' : 'en-US';
                        return new Date(app.startTime).toLocaleString(locale, { hour12: false });
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const locale = i18n.language === 'sq' ? 'sq-AL' : i18n.language === 'de' ? 'de-DE' : 'en-US';
                        return new Date(app.endTime).toLocaleString(locale, { hour12: false });
                      })()}
                    </TableCell>
                    <TableCell>
                      {updatingId === app.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Select
                          size="small"
                          value={app.statusName || 'Pending'}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as AppointmentStatus)}
                          sx={{ borderRadius: 2, fontSize: '0.8rem', minWidth: 130 }}
                        >
                          {STATUSES.map((s) => (
                            <MenuItem key={s} value={s}>
                              <Chip
                                label={t(`statuses.${s}`)}
                                size="small"
                                color={getStatusColor(s)}
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('adminAppointments.delete')}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => setDeleteTarget(app)}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" width={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon="solar:danger-bold" width={24} />
          {t('adminAppointments.deleteDialog.title')}
        </DialogTitle>
        <DialogContent>
          <Typography>{t('adminAppointments.deleteDialog.desc')}</Typography>
          {deleteTarget && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
              ID: {deleteTarget.id}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>
            {t('adminAppointments.deleteDialog.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleting} sx={{ borderRadius: 2 }}>
            {deleting ? t('adminAppointments.deleteDialog.deleting') : t('adminAppointments.deleteDialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
