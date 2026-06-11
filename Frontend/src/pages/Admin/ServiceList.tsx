import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Menu, FormControl, InputLabel,
  Switch, FormControlLabel, Snackbar, Alert, Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Icon } from '@iconify/react';
import type { Service, ServiceCategory } from '../../types/staff.types';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
} from '../../api/staffApi';
import api from '../../api/axiosConfig';

const emptyForm = {
  serviceCategoryId: '',
  name: '',
  description: '',
  durationMinutes: 30,
  price: 0,
  isActive: true,
};

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dialog state — Create / Edit
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Dialog state — Delete
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([getServices(), getServiceCategories()])
      .then(([svcData, catData]) => {
        setServices(svcData);
        setCategories(catData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // ── CREATE ────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setOpenDialog(true);
  };

  // ── EDIT ──────────────────────────────────────────────────
  const handleOpenEdit = (svc: Service) => {
    setEditingId(svc.id);
    setForm({
      serviceCategoryId: svc.serviceCategoryId,
      name: svc.name,
      description: svc.description ?? '',
      durationMinutes: svc.durationMinutes,
      price: svc.price,
      isActive: svc.isActive,
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormError('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError(t('serviceList.errors.nameRequired')); return; }
    if (!form.serviceCategoryId) { setFormError(t('serviceList.errors.categoryRequired')); return; }
    if (form.durationMinutes <= 0) { setFormError(t('serviceList.errors.durationPositive')); return; }
    if (form.price < 0) { setFormError(t('serviceList.errors.priceNonNegative')); return; }

    setSaving(true);
    try {
      const saved = editingId
        ? await updateService(editingId, form)
        : await createService(form);

      if (editingId) {
        setServices((prev) => prev.map((s) => s.id === editingId ? saved : s));
      } else {
        setServices((prev) => [...prev, saved]);
      }
      handleCloseDialog();
    } catch {
      setFormError(t('serviceList.errors.saveFailed'));
    }
    setSaving(false);
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleOpenDelete = (svc: Service) => setDeleteTarget(svc);
  const handleCloseDelete = () => setDeleteTarget(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      handleCloseDelete();
    } catch {
      alert(t('serviceList.errors.deleteFailed'));
    }
    setDeleting(false);
  };

  // ── EXPORT ────────────────────────────────────────────────
  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setExportAnchor(null);
    setExporting(true);
    try {
      if (format === 'json') {
        const res = await api.get('/reports/services/json');
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'services.json'; a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const res = await api.get('/reports/services/csv', { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a'); a.href = url; a.download = 'services.csv'; a.click();
        URL.revokeObjectURL(url);
      } else {
        const res = await api.get('/reports/services/excel', { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a'); a.href = url; a.download = 'services.xlsx'; a.click();
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
        <Typography sx={{ fontWeight: 'bold' }} variant="h4">
          {t('serviceList.title')}
        </Typography>
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

          <Button variant="contained" color="primary" startIcon={<Icon icon="solar:add-circle-bold" width={18} />} onClick={handleOpenCreate}
            sx={{ borderRadius: 2, fontWeight: 600 }}>
            {t('serviceList.addService')}
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : services.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', p: 2 }} variant="body1">
          {t('serviceList.noData')}
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: 'rgba(126, 87, 194, 0.15)' }}>
              <TableRow>
                <TableCell><strong>{t('serviceList.table.name')}</strong></TableCell>
                <TableCell><strong>{t('serviceList.table.category')}</strong></TableCell>
                <TableCell><strong>{t('serviceList.table.duration')}</strong></TableCell>
                <TableCell><strong>{t('serviceList.table.price')}</strong></TableCell>
                <TableCell><strong>{t('serviceList.table.status')}</strong></TableCell>
                <TableCell align="right"><strong>{t('serviceList.table.actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((svc) => (
                <TableRow key={svc.id} sx={(theme) => ({ '&:hover': { backgroundColor: theme.palette.action.hover } })}>
                  <TableCell>{svc.name}</TableCell>
                  <TableCell>{svc.serviceCategoryName || '-'}</TableCell>
                  <TableCell>{svc.durationMinutes} {t('serviceList.minutesSuffix')}</TableCell>
                  <TableCell>${svc.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={svc.isActive ? t('serviceList.status.active') : t('serviceList.status.inactive')}
                      color={svc.isActive ? 'success' : 'error'}
                      size="small" variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="info" size="small" sx={{ mr: 1 }}
                      onClick={() => handleOpenEdit(svc)} title={t('serviceList.actions.edit')}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small"
                      onClick={() => handleOpenDelete(svc)} title={t('serviceList.actions.delete')}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ===== DIALOG - SHTO / NDRYSHO SHËRBIM ===== */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth
         slotProps={{
  paper: {
    sx: {
      bgcolor: '#1e1e1e',
      borderRadius: 3
    }
  }
}}>
        <DialogTitle sx={{ color: '#7e57c2', fontWeight: 'bold' }}>
          {editingId ? t('serviceList.dialog.editTitle') : t('serviceList.dialog.createTitle')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('serviceList.form.name')}
            fullWidth variant="outlined"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>{t('serviceList.form.category')}</InputLabel>
            <Select
              value={form.serviceCategoryId}
              label={t('serviceList.form.category')}
              onChange={(e) => setForm({ ...form, serviceCategoryId: e.target.value })}
            >
              <MenuItem value=""><em>{t('serviceList.form.categoryPlaceholder')}</em></MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('serviceList.form.description')}
            fullWidth variant="outlined" multiline rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={t('serviceList.form.duration')}
              type="number" fullWidth variant="outlined"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            />
            <TextField
              label={t('serviceList.form.price')}
              type="number" fullWidth variant="outlined"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                color="primary"
              />
            }
            label={form.isActive ? t('serviceList.status.active') : t('serviceList.status.inactive')}
          />
          {formError && <Typography color="error" variant="body2">{formError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog} color="inherit">{t('serviceList.dialog.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={saving}>
            {saving ? t('serviceList.dialog.saving') : editingId ? t('serviceList.dialog.saveChanges') : t('serviceList.dialog.createButton')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DIALOG - KONFIRMO FSHIRJEN ===== */}
      <Dialog open={!!deleteTarget} onClose={handleCloseDelete}
        slotProps={{
  paper: {
    sx: {
      bgcolor: '#1e1e1e',
      borderRadius: 3,
      minWidth: 360
    }
  }
}}>
        <DialogTitle sx={{ color: '#f44336', fontWeight: 'bold' }}>{t('serviceList.dialog.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('serviceList.dialog.deleteConfirm', { name: deleteTarget?.name })}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {t('serviceList.dialog.deleteWarning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDelete} color="inherit" disabled={deleting}>{t('serviceList.dialog.cancel')}</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? t('serviceList.dialog.deleting') : t('serviceList.dialog.deleteConfirmButton')}
          </Button>
        </DialogActions>
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
