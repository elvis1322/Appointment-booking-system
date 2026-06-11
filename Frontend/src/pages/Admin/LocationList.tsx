import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch,
  FormControlLabel, Chip, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import type { Location, Room } from '../../types/staff.types';
import {
  getLocations, createLocation, updateLocation, deleteLocation,
  getRoomsByLocation, createRoom, updateRoom, deleteRoom
} from '../../api/staffApi';

const emptyLocationForm = { name: '', addressLine: '', city: '', isActive: true };
const emptyRoomForm = { name: '', capacity: 0, isActive: true };

export default function LocationList() {
  const { t } = useTranslation();
  // --- LOCATIONS STATE ---
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(true);

  const [openLocDialog, setOpenLocDialog] = useState(false);
  const [locEditingId, setLocEditingId] = useState<string | null>(null);
  const [locForm, setLocForm] = useState(emptyLocationForm);
  const [locSaving, setLocSaving] = useState(false);
  const [locError, setLocError] = useState('');

  const [deleteLocTarget, setDeleteLocTarget] = useState<Location | null>(null);

  // --- ROOMS STATE ---
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [roomEditingId, setRoomEditingId] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [roomSaving, setRoomSaving] = useState(false);
  const [roomError, setRoomError] = useState('');

  const [deleteRoomTarget, setDeleteRoomTarget] = useState<Room | null>(null);

  // --- FETCH LOCATIONS ---
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = () => {
    setLoadingLoc(true);
    getLocations()
      .then(data => setLocations(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingLoc(false));
  };

  // --- FETCH ROOMS ---
  useEffect(() => {
    if (!selectedLocation) {
      setRooms([]);
      return;
    }
    setLoadingRooms(true);
    getRoomsByLocation(selectedLocation.id)
      .then(data => setRooms(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingRooms(false));
  }, [selectedLocation]);

  // ==========================================
  // LOCATIONS LOGIC
  // ==========================================
  const handleOpenLocCreate = () => {
    setLocEditingId(null);
    setLocForm(emptyLocationForm);
    setLocError('');
    setOpenLocDialog(true);
  };

  const handleOpenLocEdit = (loc: Location, e: React.MouseEvent) => {
    e.stopPropagation(); // Mos selecto rreshtin
    setLocEditingId(loc.id);
    setLocForm({
      name: loc.name,
      addressLine: loc.addressLine ?? '',
      city: loc.city ?? '',
      isActive: loc.isActive
    });
    setLocError('');
    setOpenLocDialog(true);
  };

  const handleSaveLoc = async () => {
    if (!locForm.name.trim()) { setLocError(t('locationList.errors.nameRequired')); return; }
    setLocSaving(true);
    try {
      const payload = {
        name: locForm.name,
        addressLine: locForm.addressLine || null,
        city: locForm.city || null,
        isActive: locForm.isActive
      };

      if (locEditingId) {
        const saved = await updateLocation(locEditingId, payload);
        setLocations(prev => prev.map(l => l.id === locEditingId ? saved : l));
        if (selectedLocation?.id === locEditingId) setSelectedLocation(saved);
      } else {
        const saved = await createLocation(payload);
        setLocations(prev => [...prev, saved]);
      }
      setOpenLocDialog(false);
    } catch {
      setLocError(t('locationList.errors.saveFailed'));
    }
    setLocSaving(false);
  };

  const handleConfirmDeleteLoc = async () => {
    if (!deleteLocTarget) return;
    try {
      await deleteLocation(deleteLocTarget.id);
      setLocations(prev => prev.filter(l => l.id !== deleteLocTarget.id));
      if (selectedLocation?.id === deleteLocTarget.id) setSelectedLocation(null);
      setDeleteLocTarget(null);
    } catch {
      alert(t('locationList.errors.deleteFailed'));
    }
  };

  // ==========================================
  // ROOMS LOGIC
  // ==========================================
  const handleOpenRoomCreate = () => {
    setRoomEditingId(null);
    setRoomForm(emptyRoomForm);
    setRoomError('');
    setOpenRoomDialog(true);
  };

  const handleOpenRoomEdit = (room: Room) => {
    setRoomEditingId(room.id);
    setRoomForm({
      name: room.name,
      capacity: room.capacity ?? 0,
      isActive: room.isActive
    });
    setRoomError('');
    setOpenRoomDialog(true);
  };

  const handleSaveRoom = async () => {
    if (!selectedLocation) return;
    if (!roomForm.name.trim()) { setRoomError(t('locationList.roomPane.errors.nameRequired')); return; }
    setRoomSaving(true);
    try {
      const payload = {
        locationId: selectedLocation.id,
        name: roomForm.name,
        capacity: roomForm.capacity > 0 ? roomForm.capacity : null,
        isActive: roomForm.isActive
      };

      if (roomEditingId) {
        const saved = await updateRoom(roomEditingId, payload);
        setRooms(prev => prev.map(r => r.id === roomEditingId ? saved : r));
      } else {
        const saved = await createRoom(payload);
        setRooms(prev => [...prev, saved]);
      }
      setOpenRoomDialog(false);
    } catch {
      setRoomError(t('locationList.roomPane.errors.saveFailed'));
    }
    setRoomSaving(false);
  };

  const handleConfirmDeleteRoom = async () => {
    if (!deleteRoomTarget) return;
    try {
      await deleteRoom(deleteRoomTarget.id);
      setRooms(prev => prev.filter(r => r.id !== deleteRoomTarget.id));
      setDeleteRoomTarget(null);
    } catch {
      alert(t('locationList.roomPane.errors.deleteFailed'));
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Typography  sx={{ fontWeight: 'bold', mb: 4 }} variant="h4">{t('locationList.title')}</Typography>

      <Grid container spacing={4}>

        {/* KOLONA E MAJTË - LOKACIONET */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }} elevation={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{t('locationList.locationsLabel')}</Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenLocCreate}>
                {t('locationList.addLocation')}
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loadingLoc ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : locations.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', p: 2 }}>{t('locationList.noData')}</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'rgba(126, 87, 194, 0.1)' }}>
                    <TableRow>
                      <TableCell><strong>{t('locationList.table.nameAddress')}</strong></TableCell>
                      <TableCell><strong>{t('locationList.table.status')}</strong></TableCell>
                      <TableCell align="right"><strong>{t('locationList.table.actions')}</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locations.map(loc => (
                      <TableRow
                        key={loc.id}
                        hover
                        onClick={() => setSelectedLocation(loc)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: selectedLocation?.id === loc.id ? 'rgba(126, 87, 194, 0.15)' : 'transparent',
                          '&:hover': { bgcolor: 'rgba(126, 87, 194, 0.05)' }
                        }}
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 'bold' }} variant="body2">
                            {loc.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {loc.addressLine} {loc.city ? `- ${loc.city}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={loc.isActive ? t('locationList.status.active') : t('locationList.status.inactive')} color={loc.isActive ? 'success' : 'default'} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="info" onClick={(e) => handleOpenLocEdit(loc, e)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteLocTarget(loc); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* KOLONA E DJATHTË - DHOMAT E ZGJEDHURA */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', minHeight: 300 }} elevation={4}>
            {!selectedLocation ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'text.secondary' }}>{t('locationList.roomPane.selectLocation')}</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontWeight: 'bold' }} variant="h6">
                    {t('locationList.roomPane.roomsOf', { name: selectedLocation.name })}
                  </Typography>
                  <Button variant="contained" color="secondary" size="small" startIcon={<AddIcon />} onClick={handleOpenRoomCreate}>
                    {t('locationList.roomPane.addRoom')}
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loadingRooms ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : rooms.length === 0 ? (
                  <Typography sx={{ color: 'text.secondary', textAlign: 'center', p: 2 }}>{t('locationList.roomPane.noRooms')}</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(126, 87, 194, 0.1)' }}>
                        <TableRow>
                          <TableCell><strong>{t('locationList.roomPane.table.room')}</strong></TableCell>
                          <TableCell><strong>{t('locationList.roomPane.table.capacity')}</strong></TableCell>
                          <TableCell><strong>{t('locationList.roomPane.table.status')}</strong></TableCell>
                          <TableCell align="right"><strong>{t('locationList.roomPane.table.actions')}</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rooms.map(room => (
                          <TableRow key={room.id} hover>
                            <TableCell>{room.name}</TableCell>
                            <TableCell>{room.capacity ? `${room.capacity} ${t('locationList.roomPane.capacitySuffix')}` : '-'}</TableCell>
                            <TableCell>
                              <Chip label={room.isActive ? t('locationList.status.active') : t('locationList.status.inactive')} color={room.isActive ? 'success' : 'default'} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" color="info" onClick={() => handleOpenRoomEdit(room)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => setDeleteRoomTarget(room)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Paper>
        </Grid>

      </Grid>

      {/* ======================================================== */}
      {/* DIALOGS FOR LOCATIONS */}
      <Dialog open={openLocDialog} onClose={() => setOpenLocDialog(false)} maxWidth="xs" fullWidth
         slotProps={{
  paper: {
    sx: {
      bgcolor: '#1e1e1e',
      borderRadius: 3
    }
  }
}}>
        <DialogTitle sx={{ color: '#7e57c2' }}>{locEditingId ? t('locationList.dialog.editTitle') : t('locationList.dialog.createTitle')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label={t('locationList.dialog.nameLabel')} fullWidth value={locForm.name}
            onChange={(e) => setLocForm({ ...locForm, name: e.target.value })} />
          <TextField label={t('locationList.dialog.addressLabel')} fullWidth value={locForm.addressLine}
            onChange={(e) => setLocForm({ ...locForm, addressLine: e.target.value })} />
          <TextField label={t('locationList.dialog.cityLabel')} fullWidth value={locForm.city}
            onChange={(e) => setLocForm({ ...locForm, city: e.target.value })} />
          <FormControlLabel control={
            <Switch checked={locForm.isActive} onChange={(e) => setLocForm({ ...locForm, isActive: e.target.checked })} color="primary" />
          } label={locForm.isActive ? t('locationList.status.active') : t('locationList.status.inactive')} />
          {locError && <Typography sx={{ color: 'error' }} variant="body2">{locError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenLocDialog(false)}>{t('locationList.dialog.cancel')}</Button>
          <Button onClick={handleSaveLoc} variant="contained" disabled={locSaving}>
            {locSaving ? t('locationList.dialog.saving') : t('locationList.dialog.saveButton')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteLocTarget} onClose={() => setDeleteLocTarget(null)}>
        <DialogTitle sx={{ color: '#f44336' }}>{t('locationList.dialog.deleteTitle')}</DialogTitle>
        <DialogContent><Typography>{t('locationList.dialog.deleteConfirm', { name: deleteLocTarget?.name })}</Typography></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteLocTarget(null)}>{t('locationList.dialog.deleteNo')}</Button>
          <Button onClick={handleConfirmDeleteLoc} variant="contained" color="error">{t('locationList.dialog.deleteYes')}</Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOGS FOR ROOMS */}
      <Dialog open={openRoomDialog} onClose={() => setOpenRoomDialog(false)} maxWidth="xs" fullWidth
         slotProps={{
  paper: {
    sx: {
      bgcolor: '#1e1e1e',
      borderRadius: 3
    }
  }
}}>
        <DialogTitle sx={{ color: '#7e57c2' }}>{roomEditingId ? t('locationList.roomPane.dialog.editTitle') : t('locationList.roomPane.dialog.createTitle')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label={t('locationList.roomPane.dialog.nameLabel')} fullWidth value={roomForm.name}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
          <TextField label={t('locationList.roomPane.dialog.capacityLabel')} type="number" fullWidth value={roomForm.capacity}
            onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} />
          <FormControlLabel control={
            <Switch checked={roomForm.isActive} onChange={(e) => setRoomForm({ ...roomForm, isActive: e.target.checked })} color="primary" />
          } label={roomForm.isActive ? t('locationList.status.active') : t('locationList.status.inactive')} />
          {roomError && <Typography sx={{ color: 'error' }} variant="body2">{roomError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenRoomDialog(false)}>{t('locationList.roomPane.dialog.cancel')}</Button>
          <Button onClick={handleSaveRoom} variant="contained" color="secondary" disabled={roomSaving}>
            {roomSaving ? t('locationList.roomPane.dialog.saving') : t('locationList.roomPane.dialog.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteRoomTarget} onClose={() => setDeleteRoomTarget(null)}>
        <DialogTitle sx={{ color: '#f44336' }}>{t('locationList.roomPane.dialog.deleteTitle')}</DialogTitle>
        <DialogContent><Typography>{t('locationList.roomPane.dialog.deleteConfirm', { name: deleteRoomTarget?.name })}</Typography></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteRoomTarget(null)}>{t('locationList.roomPane.dialog.deleteNo')}</Button>
          <Button onClick={handleConfirmDeleteRoom} variant="contained" color="error">{t('locationList.roomPane.dialog.deleteYes')}</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
