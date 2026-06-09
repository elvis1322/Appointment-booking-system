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
import type { Location, Room } from '../../types/staff.types';
import {
  getLocations, createLocation, updateLocation, deleteLocation,
  getRoomsByLocation, createRoom, updateRoom, deleteRoom
} from '../../api/staffApi';

const emptyLocationForm = { name: '', addressLine: '', city: '', isActive: true };
const emptyRoomForm = { name: '', capacity: 0, isActive: true };

export default function LocationList() {
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
    if (!locForm.name.trim()) { setLocError('Emri është i detyrueshëm!'); return; }
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
      setLocError('Gabim gjatë ruajtjes.');
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
      alert('Gabim gjatë fshirjes. Sigurohu që nuk ka dhoma të lidhura me këtë lokacion.');
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
    if (!roomForm.name.trim()) { setRoomError('Emri i dhomës është i detyrueshëm!'); return; }
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
      setRoomError('Gabim gjatë ruajtjes së dhomës.');
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
      alert('Gabim gjatë fshirjes së dhomës.');
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>Menaxhimi i Lokacioneve dhe Dhomave</Typography>

      <Grid container spacing={4}>

        {/* KOLONA E MAJTË - LOKACIONET */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }} elevation={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Lokacionet</Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenLocCreate}>
                Shto
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loadingLoc ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : locations.length === 0 ? (
              <Typography color="text.secondary" align="center" p={2}>Nuk ka asnjë lokacion.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'rgba(126, 87, 194, 0.1)' }}>
                    <TableRow>
                      <TableCell><strong>Emri & Adresa</strong></TableCell>
                      <TableCell><strong>Statusi</strong></TableCell>
                      <TableCell align="right"><strong>Veprime</strong></TableCell>
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
                          <Typography variant="body2" fontWeight="bold">{loc.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {loc.addressLine} {loc.city ? `- ${loc.city}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={loc.isActive ? 'Aktiv' : 'Jo Aktiv'} color={loc.isActive ? 'success' : 'default'} size="small" />
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', minHeight: 300 }} elevation={4}>
            {!selectedLocation ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Zgjidh një lokacion nga lista për t'i parë dhomat.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Dhomat e "{selectedLocation.name}"</Typography>
                  <Button variant="contained" color="secondary" size="small" startIcon={<AddIcon />} onClick={handleOpenRoomCreate}>
                    Shto Dhomë
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loadingRooms ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : rooms.length === 0 ? (
                  <Typography color="text.secondary" align="center" p={2}>Nuk ka asnjë dhomë në këtë lokacion.</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(126, 87, 194, 0.1)' }}>
                        <TableRow>
                          <TableCell><strong>Dhoma</strong></TableCell>
                          <TableCell><strong>Kapaciteti</strong></TableCell>
                          <TableCell><strong>Statusi</strong></TableCell>
                          <TableCell align="right"><strong>Veprime</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rooms.map(room => (
                          <TableRow key={room.id} hover>
                            <TableCell>{room.name}</TableCell>
                            <TableCell>{room.capacity ? `${room.capacity} persona` : '-'}</TableCell>
                            <TableCell>
                              <Chip label={room.isActive ? 'Aktiv' : 'Jo Aktiv'} color={room.isActive ? 'success' : 'default'} size="small" />
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
        PaperProps={{ sx: { bgcolor: '#1e1e1e', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#7e57c2' }}>{locEditingId ? 'Ndrysho Lokacionin' : 'Shto Lokacion të Ri'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Emri (p.sh. Klinika Qendrore)" fullWidth value={locForm.name}
            onChange={(e) => setLocForm({ ...locForm, name: e.target.value })} />
          <TextField label="Adresa" fullWidth value={locForm.addressLine}
            onChange={(e) => setLocForm({ ...locForm, addressLine: e.target.value })} />
          <TextField label="Qyteti" fullWidth value={locForm.city}
            onChange={(e) => setLocForm({ ...locForm, city: e.target.value })} />
          <FormControlLabel control={
            <Switch checked={locForm.isActive} onChange={(e) => setLocForm({ ...locForm, isActive: e.target.checked })} color="primary" />
          } label={locForm.isActive ? 'Aktiv' : 'Jo Aktiv'} />
          {locError && <Typography color="error" variant="body2">{locError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenLocDialog(false)}>Anulo</Button>
          <Button onClick={handleSaveLoc} variant="contained" disabled={locSaving}>
            {locSaving ? 'Duke ruajtur...' : 'Ruaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteLocTarget} onClose={() => setDeleteLocTarget(null)}>
        <DialogTitle sx={{ color: '#f44336' }}>Fshij Lokacionin?</DialogTitle>
        <DialogContent><Typography>A jeni i sigurt që dëshironi të fshini <b>{deleteLocTarget?.name}</b>?</Typography></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteLocTarget(null)}>Jo</Button>
          <Button onClick={handleConfirmDeleteLoc} variant="contained" color="error">Po, Fshij</Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOGS FOR ROOMS */}
      <Dialog open={openRoomDialog} onClose={() => setOpenRoomDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1e1e1e', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#7e57c2' }}>{roomEditingId ? 'Ndrysho Dhomën' : 'Shto Dhomë të Re'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Emri Dhomës (p.sh. Kabina 1)" fullWidth value={roomForm.name}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
          <TextField label="Kapaciteti (opsional)" type="number" fullWidth value={roomForm.capacity}
            onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} />
          <FormControlLabel control={
            <Switch checked={roomForm.isActive} onChange={(e) => setRoomForm({ ...roomForm, isActive: e.target.checked })} color="primary" />
          } label={roomForm.isActive ? 'Aktiv' : 'Jo Aktiv'} />
          {roomError && <Typography color="error" variant="body2">{roomError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenRoomDialog(false)}>Anulo</Button>
          <Button onClick={handleSaveRoom} variant="contained" color="secondary" disabled={roomSaving}>
            {roomSaving ? 'Duke ruajtur...' : 'Ruaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteRoomTarget} onClose={() => setDeleteRoomTarget(null)}>
        <DialogTitle sx={{ color: '#f44336' }}>Fshij Dhomën?</DialogTitle>
        <DialogContent><Typography>A jeni i sigurt që dëshironi të fshini <b>{deleteRoomTarget?.name}</b>?</Typography></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteRoomTarget(null)}>Jo</Button>
          <Button onClick={handleConfirmDeleteRoom} variant="contained" color="error">Po, Fshij</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
