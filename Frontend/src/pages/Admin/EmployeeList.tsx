import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, Button, MenuItem, Menu,
  FormControl, InputLabel, Select, FormHelperText,
  Snackbar, Alert, Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Icon } from '@iconify/react';
import type { Employee } from '../../types/staff.types';
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from '../../api/staffApi';
import api from '../../api/axiosConfig';

import ChatIcon from '@mui/icons-material/Chat';
import ChatWindow from '../../components/chat/ChatWindow';

import { useAuth } from '../../context/AuthContext';

// Forma për Edit (nuk ndryshon userId — vetëm të dhënat e stafit)
const emptyUpdateForm = {
  jobTitle: '',
  phone: '',
  isActive: true,
};

const emptyCreateForm = {
  firstName: '',
  lastName: '',
  email: '',
  gjinia: '',
  jobTitle: '',
  phone: '',
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dialog state — Create
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  // Dialog state — Edit
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [updateForm, setUpdateForm] = useState(emptyUpdateForm);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Dialog state — Delete
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  const [chatTarget, setChatTarget] = useState<Employee | null>(null);
  const { t } = useTranslation();
  const { user } = useAuth();

  const fetchEmployees = () => {
    setLoading(true);
    getEmployees()
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    };

    const buildConversationId = (firstUserId: string, secondUserId: string) => {
        return [firstUserId, secondUserId].sort().join('_');
    };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenCreate = () => {
    setCreateForm(emptyCreateForm);
    setCreateError('');
    setFieldErrors({});
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setCreateError('');
    setFieldErrors({});
  };

  const handleCreate = async () => {
    const errors: Record<string, boolean> = {
      firstName: !createForm.firstName.trim(),
      lastName: !createForm.lastName.trim(),
      email: !createForm.email.trim(),
      gjinia: !createForm.gjinia,
    };

    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email.trim())) {
      setFieldErrors({ ...errors, email: true });
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const created = await createEmployee({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        gjinia: createForm.gjinia,
        jobTitle: createForm.jobTitle.trim() || null,
        phone: createForm.phone.trim() || null,
      });

      setEmployees((prev) => [created, ...prev]);
      handleCloseCreate();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : t('employeeList.errors.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  // ── EDIT ──────────────────────────────────────────────────
  const handleOpenEdit = (emp: Employee) => {
    setEditTarget(emp);
    setUpdateForm({
      jobTitle: emp.jobTitle ?? '',
      phone: emp.phone ?? '',
      isActive: emp.isActive,
    });
    setUpdateError('');
  };

  const handleCloseEdit = () => {
    setEditTarget(null);
    setUpdateError('');
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    setUpdating(true);
    try {
      const updated = await updateEmployee(editTarget.id, {
        jobTitle: updateForm.jobTitle || null,
        phone: updateForm.phone || null,
        isActive: updateForm.isActive,
      });
      setEmployees((prev) =>
        prev.map((e) => (e.id === editTarget.id ? updated : e))
      );
      handleCloseEdit();
    } catch {
      setUpdateError(t('employeeList.errors.updateFailed'));
    }
    setUpdating(false);
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleOpenDelete = (emp: Employee) => setDeleteTarget(emp);
  const handleCloseDelete = () => setDeleteTarget(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      handleCloseDelete();
    } catch {
      alert(t('employeeList.errors.deleteFailed'));
    }
    setDeleting(false);
  };

  // ── EXPORT ────────────────────────────────────────────────
  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setExportAnchor(null);
    setExporting(true);
    try {
      if (format === 'json') {
        const res = await api.get('/reports/employees/json');
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'employees.json'; a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const res = await api.get('/reports/employees/csv', { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click();
        URL.revokeObjectURL(url);
      } else {
        const res = await api.get('/reports/employees/excel', { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a'); a.href = url; a.download = 'employees.xlsx'; a.click();
        URL.revokeObjectURL(url);
      }
      setSnackbar({ open: true, message: `U eksportua si ${format.toUpperCase()} me sukses!`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Gabim gjatë eksportimit.', severity: 'error' });
    } finally {
      setExporting(false);
    }
  };


  // ── RENDER ────────────────────────────────────────────────
  return (
    <Box sx={{ p: 4, width: '100%' }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('employeeList.title')}</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
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
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
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
          
          <Button variant="contained" color="primary" startIcon={<Icon icon="solar:user-plus-bold" width={18} />} onClick={handleOpenCreate}
            sx={{ borderRadius: 2, fontWeight: 600 }}>
            {t('employeeList.addEmployee')}
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : employees.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary">
          {t('employeeList.noData')}
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: 'rgba(126, 87, 194, 0.15)' }}>
              <TableRow>
                <TableCell><strong>{t('employeeList.table.name')}</strong></TableCell>
                <TableCell><strong>{t('employeeList.table.email')}</strong></TableCell>
                <TableCell><strong>{t('employeeList.table.role')}</strong></TableCell>
                <TableCell><strong>{t('employeeList.table.phone')}</strong></TableCell>
                <TableCell><strong>{t('employeeList.table.status')}</strong></TableCell>
                <TableCell align="right"><strong>{t('employeeList.table.actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id} sx={(theme) => ({ '&:hover': { backgroundColor: theme.palette.action.hover } })}>
                  <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.jobTitle || '-'}</TableCell>
                  <TableCell>{emp.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.isActive ? t('employeeList.status.active') : t('employeeList.status.inactive')}
                      color={emp.isActive ? 'success' : 'error'}
                      size="small" variant="outlined"
                    />
                  </TableCell>
                      <TableCell align="right">
                          <IconButton
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() => setChatTarget(emp)}
                              title={t('employeeList.actions.chat')}
                          >
                              <ChatIcon fontSize="small" />
                          </IconButton>
                    <IconButton color="info" size="small" sx={{ mr: 1 }}
                      onClick={() => handleOpenEdit(emp)} title={t('employeeList.actions.edit')}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small"
                      onClick={() => handleOpenDelete(emp)} title={t('employeeList.actions.delete')}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ===== DIALOG - KRIJO PUNONJËS ===== */}
      <Dialog
        open={createOpen}
        onClose={handleCloseCreate}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { bgcolor: '#1e1e1e', borderRadius: 3 }
          }
        }}
      >
        <DialogTitle sx={{ color: '#7e57c2', fontWeight: 'bold' }}>
          {t('employeeList.dialog.createTitle')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('employeeList.form.firstName')}
            fullWidth
            value={createForm.firstName}
            onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
            error={fieldErrors.firstName}
            helperText={fieldErrors.firstName ? t('employeeList.form.firstNameRequired') : ' '}
          />
          <TextField
            label={t('employeeList.form.lastName')}
            fullWidth
            value={createForm.lastName}
            onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
            error={fieldErrors.lastName}
            helperText={fieldErrors.lastName ? t('employeeList.form.lastNameRequired') : ' '}
          />
          <TextField
            label={t('employeeList.form.email')}
            fullWidth
            value={createForm.email}
            onChange={(e) => {
              setCreateForm({ ...createForm, email: e.target.value });
              setFieldErrors((prev) => ({ ...prev, email: false }));
            }}
            error={fieldErrors.email}
            helperText={
              fieldErrors.email
                ? (!createForm.email.trim()
                  ? t('employeeList.form.emailRequired')
                  : t('employeeList.form.emailInvalid'))
                : ' '
            }
          />
          <FormControl fullWidth error={fieldErrors.gjinia}>
            <InputLabel id="create-employee-gender-label">{t('employeeList.form.gender')}</InputLabel>
            <Select
              labelId="create-employee-gender-label"
              label={t('employeeList.form.gender')}
              value={createForm.gjinia}
              onChange={(e) => {
                setCreateForm({ ...createForm, gjinia: e.target.value });
                setFieldErrors((prev) => ({ ...prev, gjinia: false }));
              }}
            >
              <MenuItem value="M">{t('employeeList.form.genderMale')}</MenuItem>
              <MenuItem value="F">{t('employeeList.form.genderFemale')}</MenuItem>
            </Select>
            {fieldErrors.gjinia && <FormHelperText>{t('employeeList.form.genderRequired')}</FormHelperText>}
          </FormControl>
          <TextField
            label={t('employeeList.form.jobTitle')}
            fullWidth
            value={createForm.jobTitle}
            onChange={(e) => setCreateForm({ ...createForm, jobTitle: e.target.value })}
          />
          <TextField
            label={t('employeeList.form.phone')}
            fullWidth
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
          />
          {createError && <Typography color="error" variant="body2">{createError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseCreate} color="inherit" disabled={creating}>{t('employeeList.dialog.cancel')}</Button>
          <Button onClick={handleCreate} variant="contained" color="primary" disabled={creating}>
            {creating ? t('employeeList.dialog.creating') : t('employeeList.dialog.createButton')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DIALOG - NDRYSHO PUNONJËSIN ===== */}
      <Dialog
        open={!!editTarget}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { bgcolor: '#1e1e1e', borderRadius: 3 }
          }
        }}
      >
        <DialogTitle sx={{ color: '#7e57c2', fontWeight: 'bold' }}>
          {t('employeeList.dialog.editTitle', { name: `${editTarget?.firstName} ${editTarget?.lastName}` })}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('employeeList.form.jobTitle')}
            fullWidth variant="outlined"
            value={updateForm.jobTitle}
            onChange={(e) => setUpdateForm({ ...updateForm, jobTitle: e.target.value })}
          />
          <TextField
            label={t('employeeList.form.phone')}
            fullWidth variant="outlined"
            value={updateForm.phone}
            onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={updateForm.isActive}
                onChange={(e) => setUpdateForm({ ...updateForm, isActive: e.target.checked })}
                color="primary"
              />
            }
            label={updateForm.isActive ? t('employeeList.status.active') : t('employeeList.status.inactive')}
          />
          {updateError && <Typography color="error" variant="body2">{updateError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseEdit} color="inherit">{t('employeeList.dialog.cancel')}</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary" disabled={updating}>
            {updating ? t('employeeList.dialog.saving') : t('employeeList.dialog.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DIALOG - KONFIRMO FSHIRJEN ===== */}
      <Dialog
        open={!!deleteTarget}
        onClose={handleCloseDelete}
        slotProps={{
          paper: {
            sx: { bgcolor: '#1e1e1e', borderRadius: 3, minWidth: 360 }
          }
        }}
      >
        <DialogTitle sx={{ color: '#f44336', fontWeight: 'bold' }}>
          {t('employeeList.dialog.deleteTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('employeeList.dialog.deleteConfirm', { name: `${deleteTarget?.firstName} ${deleteTarget?.lastName}` })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('employeeList.dialog.deleteWarning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDelete} color="inherit" disabled={deleting}>{t('employeeList.dialog.cancel')}</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? t('employeeList.dialog.deleting') : t('employeeList.dialog.deleteConfirmButton')}
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
                  {chatTarget && user?.id && chatTarget.userId && (
                      <ChatWindow
                          conversationId={buildConversationId(user.id, chatTarget.userId)}
                          senderId={user.id}
                          receiverId={chatTarget.userId}
                          title={`Chat with ${chatTarget.firstName} ${chatTarget.lastName}`}

                      />
                  )}
              </DialogContent>
          </Dialog>
      {/* Snackbar feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
