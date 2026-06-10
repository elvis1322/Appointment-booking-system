// ============================================================
// [Member 2] - Employee List Page
// ============================================================

import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, Button, MenuItem,
  FormControl, InputLabel, Select, FormHelperText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Employee } from '../../types/staff.types';
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from '../../api/staffApi';

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

    const [chatTarget, setChatTarget] = useState<Employee | null>(null);
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
      setCreateError(err instanceof Error ? err.message : 'Gabim gjatë krijimit të punonjësit.');
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
      setUpdateError('Gabim gjatë ndryshimit.');
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
      alert('Gabim gjatë fshirjes.');
    }
    setDeleting(false);
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <Box sx={{ p: 4, width: '100%' }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Drejtoria e Stafit</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenCreate}>
          + Shto punonjës
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : employees.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary">
          Nuk u gjet asnjë punonjës në databazë.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: 'rgba(126, 87, 194, 0.15)' }}>
              <TableRow>
                <TableCell><strong>Emri &amp; Mbiemri</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Roli (Job Title)</strong></TableCell>
                <TableCell><strong>Telefoni</strong></TableCell>
                <TableCell><strong>Statusi</strong></TableCell>
                <TableCell align="right"><strong>Veprime</strong></TableCell>
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
                      label={emp.isActive ? 'Aktiv' : 'Jo Aktiv'}
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
                              title="Chat"
                          >
                              <ChatIcon fontSize="small" />
                          </IconButton>
                    <IconButton color="info" size="small" sx={{ mr: 1 }}
                      onClick={() => handleOpenEdit(emp)} title="Ndrysho">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small"
                      onClick={() => handleOpenDelete(emp)} title="Fshij">
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
          ➕ Shto punonjës të ri
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Emri"
            fullWidth
            value={createForm.firstName}
            onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
            error={fieldErrors.firstName}
            helperText={fieldErrors.firstName ? 'Emri është i detyrueshëm.' : ' '}
          />
          <TextField
            label="Mbiemri"
            fullWidth
            value={createForm.lastName}
            onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
            error={fieldErrors.lastName}
            helperText={fieldErrors.lastName ? 'Mbiemri është i detyrueshëm.' : ' '}
          />
          <TextField
            label="Email"
            fullWidth
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            error={fieldErrors.email}
            helperText={fieldErrors.email ? 'Email-i është i detyrueshëm.' : ' '}
          />
          <FormControl fullWidth error={fieldErrors.gjinia}>
            <InputLabel id="create-employee-gender-label">Gjinia</InputLabel>
            <Select
              labelId="create-employee-gender-label"
              label="Gjinia"
              value={createForm.gjinia}
              onChange={(e) => {
                setCreateForm({ ...createForm, gjinia: e.target.value });
                setFieldErrors((prev) => ({ ...prev, gjinia: false }));
              }}
            >
              <MenuItem value="M">Mashkull</MenuItem>
              <MenuItem value="F">Femër</MenuItem>
            </Select>
            {fieldErrors.gjinia && <FormHelperText>Gjinia është e detyrueshme.</FormHelperText>}
          </FormControl>
          <TextField
            label="Titulli i Punës"
            fullWidth
            value={createForm.jobTitle}
            onChange={(e) => setCreateForm({ ...createForm, jobTitle: e.target.value })}
          />
          <TextField
            label="Telefoni"
            fullWidth
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
          />
          {createError && <Typography color="error" variant="body2">{createError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseCreate} color="inherit" disabled={creating}>Anulo</Button>
          <Button onClick={handleCreate} variant="contained" color="primary" disabled={creating}>
            {creating ? 'Duke krijuar...' : 'Krijo punonjës'}
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
          ✏️ Ndrysho — {editTarget?.firstName} {editTarget?.lastName}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Titulli i Punës (Job Title)"
            fullWidth variant="outlined"
            value={updateForm.jobTitle}
            onChange={(e) => setUpdateForm({ ...updateForm, jobTitle: e.target.value })}
          />
          <TextField
            label="Telefoni"
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
            label={updateForm.isActive ? 'Aktiv' : 'Jo Aktiv'}
          />
          {updateError && <Typography color="error" variant="body2">{updateError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseEdit} color="inherit">Anulo</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary" disabled={updating}>
            {updating ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
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
          🗑️ Konfirmo Fshirjen
        </DialogTitle>
        <DialogContent>
          <Typography>
            A jeni i sigurt që dëshironi të fshini punonjësin{' '}
            <strong style={{ color: '#7e57c2' }}>
              "{deleteTarget?.firstName} {deleteTarget?.lastName}"
            </strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
    </Box>
  );
}
