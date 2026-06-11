import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions,
  Grid, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import type { ServiceCategory } from '../../types/staff.types';
import {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from '../../api/staffApi';

const emptyForm = {
  name: '',
  description: '',
  sortOrder: 0,
  isActive: true,
};

export default function ServiceCategoryList() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dialog state — Create / Edit
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Dialog state — Delete
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getServiceCategories()
      .then((data) => {
        setCategories(data);
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
  const handleOpenEdit = (cat: ServiceCategory) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormError('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError(t('serviceCategoryList.errors.nameRequired')); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      const saved = editingId
        ? await updateServiceCategory(editingId, payload)
        : await createServiceCategory(payload);

      if (editingId) {
        setCategories((prev) => prev.map((c) => c.id === editingId ? saved : c));
      } else {
        setCategories((prev) => [...prev, saved]);
      }
      handleCloseDialog();
    } catch {
      setFormError(t('serviceCategoryList.errors.saveFailed'));
    }
    setSaving(false);
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleOpenDelete = (cat: ServiceCategory) => setDeleteTarget(cat);
  const handleCloseDelete = () => setDeleteTarget(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteServiceCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      handleCloseDelete();
    } catch (err: unknown) {
      // 409 Conflict — kategoria ka shërbime të lidhura
      const axiosErr = err as { response?: { status: number; data?: string } };
      if (axiosErr?.response?.status === 409) {
        alert(axiosErr.response.data || t('serviceCategoryList.errors.deleteLinked'));
      } else {
        alert(t('serviceCategoryList.errors.deleteFailed'));
      }
    }
    setDeleting(false);
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <Box sx={{ p: 4, width: '100%' }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography sx={{ fontWeight: 'bold' }} variant="h4">
          {t('serviceCategoryList.title')}
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          {t('serviceCategoryList.addButton')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : categories.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', p: 2 }} variant="body1">
          {t('serviceCategoryList.noData')}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {categories.map((cat) => (
            <Grid  size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
              <Card
                elevation={4}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(126, 87, 194, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">{cat.name}</Typography>
                    <Chip
                      label={cat.isActive ? t('serviceCategoryList.status.active') : t('serviceCategoryList.status.inactive')}
                      color={cat.isActive ? 'success' : 'error'}
                      size="small" variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {cat.description || t('serviceCategoryList.noDescription')}
                  </Typography>
                  {cat.sortOrder > 0 && (
           <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
                      {t('serviceCategoryList.sortOrderLabel')} {cat.sortOrder}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                  <IconButton color="info" size="small" onClick={() => handleOpenEdit(cat)} title={t('serviceCategoryList.actions.edit')}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleOpenDelete(cat)} title={t('serviceCategoryList.actions.delete')}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ===== DIALOG - SHTO / NDRYSHO KATEGORI ===== */}
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
          {editingId ? t('serviceCategoryList.dialog.editTitle') : t('serviceCategoryList.dialog.createTitle')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('serviceCategoryList.form.name')}
            fullWidth variant="outlined"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label={t('serviceCategoryList.form.description')}
            fullWidth variant="outlined" multiline rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            label={t('serviceCategoryList.form.sortOrder')}
            type="number" fullWidth variant="outlined"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            helperText={t('serviceCategoryList.form.sortOrderHelp')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                color="primary"
              />
            }
            label={form.isActive ? t('serviceCategoryList.status.active') : t('serviceCategoryList.status.inactive')}
          />
          {formError && <Typography sx={{ color: 'error' }} variant="body2">{formError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog} color="inherit">{t('serviceCategoryList.dialog.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={saving}>
            {saving ? t('serviceCategoryList.dialog.saving') : editingId ? t('serviceCategoryList.dialog.saveChanges') : t('serviceCategoryList.dialog.createButton')}
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
      minWidth: 380
    }
  }
}}>
      <DialogTitle sx={{ color: '#f44336', fontWeight: 'bold' }}>{t('serviceCategoryList.dialog.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('serviceCategoryList.dialog.deleteConfirm', { name: deleteTarget?.name })}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {t('serviceCategoryList.dialog.deleteWarning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDelete} color="inherit" disabled={deleting}>{t('serviceCategoryList.dialog.cancel')}</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? t('serviceCategoryList.dialog.deleting') : t('serviceCategoryList.dialog.deleteConfirmButton')}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
