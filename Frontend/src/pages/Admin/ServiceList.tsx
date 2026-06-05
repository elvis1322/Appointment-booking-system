import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Service, ServiceCategory } from '../../types/staff.types';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
} from '../../api/staffApi';

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
    if (!form.name.trim()) { setFormError('Emri është i detyrueshëm!'); return; }
    if (!form.serviceCategoryId) { setFormError('Zgjidhni një kategori!'); return; }
    if (form.durationMinutes <= 0) { setFormError('Kohëzgjatja duhet të jetë më e madhe se 0!'); return; }
    if (form.price < 0) { setFormError('Çmimi nuk mund të jetë negativ!'); return; }

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
      setFormError('Gabim gjatë ruajtjes.');
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
      alert('Gabim gjatë fshirjes.');
    }
    setDeleting(false);
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <Box sx={{ p: 4, width: '100%' }}>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Lista e Shërbimeve</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Shto Shërbim
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress color="primary" />
        </Box>
      ) : services.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary">
          Nuk u gjet asnjë shërbim në databazë.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: 'rgba(126, 87, 194, 0.15)' }}>
              <TableRow>
                <TableCell><strong>Emri Shërbimit</strong></TableCell>
                <TableCell><strong>Kategoria</strong></TableCell>
                <TableCell><strong>Kohëzgjatja</strong></TableCell>
                <TableCell><strong>Çmimi</strong></TableCell>
                <TableCell><strong>Statusi</strong></TableCell>
                <TableCell align="right"><strong>Veprime</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((svc) => (
                <TableRow key={svc.id} sx={(theme) => ({ '&:hover': { backgroundColor: theme.palette.action.hover } })}>
                  <TableCell>{svc.name}</TableCell>
                  <TableCell>{svc.serviceCategoryName || '-'}</TableCell>
                  <TableCell>{svc.durationMinutes} min</TableCell>
                  <TableCell>${svc.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={svc.isActive ? 'Aktiv' : 'Jo Aktiv'}
                      color={svc.isActive ? 'success' : 'error'}
                      size="small" variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="info" size="small" sx={{ mr: 1 }}
                      onClick={() => handleOpenEdit(svc)} title="Ndrysho shërbimin">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small"
                      onClick={() => handleOpenDelete(svc)} title="Fshij shërbimin">
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
        PaperProps={{ sx: { bgcolor: '#1e1e1e', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#7e57c2', fontWeight: 'bold' }}>
          {editingId ? '✏️ Ndrysho Shërbimin' : '➕ Shto Shërbim të Ri'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Emri i Shërbimit"
            fullWidth variant="outlined"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Kategoria</InputLabel>
            <Select
              value={form.serviceCategoryId}
              label="Kategoria"
              onChange={(e) => setForm({ ...form, serviceCategoryId: e.target.value })}
            >
              <MenuItem value=""><em>Zgjidh kategorinë...</em></MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Përshkrimi (opsional)"
            fullWidth variant="outlined" multiline rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Box display="flex" gap={2}>
            <TextField
              label="Kohëzgjatja (minuta)"
              type="number" fullWidth variant="outlined"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            />
            <TextField
              label="Çmimi ($)"
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
            label={form.isActive ? 'Aktiv' : 'Jo Aktiv'}
          />
          {formError && <Typography color="error" variant="body2">{formError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog} color="inherit">Anulo</Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={saving}>
            {saving ? 'Duke ruajtur...' : editingId ? 'Ruaj Ndryshimet' : 'Ruaj Shërbimin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DIALOG - KONFIRMO FSHIRJEN ===== */}
      <Dialog open={!!deleteTarget} onClose={handleCloseDelete}
        PaperProps={{ sx: { bgcolor: '#1e1e1e', borderRadius: 3, minWidth: 360 } }}>
        <DialogTitle sx={{ color: '#f44336', fontWeight: 'bold' }}>🗑️ Konfirmo Fshirjen</DialogTitle>
        <DialogContent>
          <Typography>
            A jeni i sigurt që dëshironi të fshini shërbimin{' '}
            <strong style={{ color: '#7e57c2' }}>"{deleteTarget?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Ky veprim nuk mund të zhbëhet.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDelete} color="inherit" disabled={deleting}>Anulo</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Duke fshirë...' : 'Po, Fshij'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
