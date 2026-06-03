// ============================================================
// [Member 2] - Staff Schedule Page
// ============================================================

import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Employee, WorkingHour, DayOff } from '../../types/staff.types';
import {
  getEmployees,
  getWorkingHours,
  createWorkingHour,
  updateWorkingHour,
  deleteWorkingHour,
  getDaysOff,
  createDayOff,
  updateDayOff,
  deleteDayOff,
} from '../../api/staffApi';

const daysOfWeekMap = ['E Diel', 'E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë'];

const emptyWorkingHourForm = { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' };
const emptyDayOffForm = { date: new Date().toISOString().split('T')[0], reason: '' };

export default function StaffSchedule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  // Working Hours State
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loadingHours, setLoadingHours] = useState<boolean>(false);
  const [openWHDialog, setOpenWHDialog] = useState(false);
  const [whEditingId, setWhEditingId] = useState<string | null>(null);
  const [whForm, setWhForm] = useState(emptyWorkingHourForm);
  const [whSaving, setWhSaving] = useState(false);
  const [whError, setWhError] = useState('');

  // Days Off State
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [loadingDaysOff, setLoadingDaysOff] = useState<boolean>(false);
  const [openDODialog, setOpenDODialog] = useState(false);
  const [doEditingId, setDoEditingId] = useState<string | null>(null);
  const [doForm, setDoForm] = useState(emptyDayOffForm);
  const [doSaving, setDoSaving] = useState(false);
  const [doError, setDoError] = useState('');

  // Delete State
  const [deleteWHTarget, setDeleteWHTarget] = useState<WorkingHour | null>(null);
  const [deleteDOTarget, setDeleteDOTarget] = useState<DayOff | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Marrja e listës së punonjësve
  useEffect(() => {
    getEmployees()
      .then((data) => setEmployees(data))
      .catch((err) => console.error(err));
  }, []);

  // Marrja e të dhënave kur zgjidhet punonjësi ose ndërrohet Tab-i
  useEffect(() => {
    if (!selectedEmployeeId) {
      setWorkingHours([]);
      setDaysOff([]);
      return;
    }
    if (activeTab === 0) {
      setLoadingHours(true);
      getWorkingHours(selectedEmployeeId)
        .then((data) => { setWorkingHours(data); setLoadingHours(false); })
        .catch(() => setLoadingHours(false));
    } else {
      setLoadingDaysOff(true);
      getDaysOff(selectedEmployeeId)
        .then((data) => { setDaysOff(data); setLoadingDaysOff(false); })
        .catch(() => setLoadingDaysOff(false));
    }
  }, [selectedEmployeeId, activeTab]);

  // ── WORKING HOURS ─────────────────────────────────────────
  const handleOpenWHCreate = () => {
    setWhEditingId(null);
    setWhForm(emptyWorkingHourForm);
    setWhError('');
    setOpenWHDialog(true);
  };

  const handleOpenWHEdit = (wh: WorkingHour) => {
    setWhEditingId(wh.id);
    setWhForm({
      dayOfWeek: wh.dayOfWeek,
      startTime: wh.startTime.substring(0, 5),
      endTime: wh.endTime.substring(0, 5),
    });
    setWhError('');
    setOpenWHDialog(true);
  };

  const handleSaveWH = async () => {
    if (!selectedEmployeeId) return;
    if (whForm.startTime >= whForm.endTime) {
      setWhError('Ora e fillimit duhet të jetë para mbarimit!');
      return;
    }
    setWhSaving(true);
    try {
      const payload = {
        dayOfWeek: whForm.dayOfWeek,
        startTime: whForm.startTime + ':00',
        endTime: whForm.endTime + ':00',
      };
      const saved = whEditingId
        ? await updateWorkingHour(whEditingId, payload)
        : await createWorkingHour(selectedEmployeeId, payload);

      if (whEditingId) {
        setWorkingHours((prev) => prev.map((wh) => wh.id === whEditingId ? saved : wh));
      } else {
        setWorkingHours((prev) => [...prev, saved]);
      }
      setOpenWHDialog(false);
    } catch {
      setWhError('Gabim gjatë ruajtjes.');
    }
    setWhSaving(false);
  };

  const handleConfirmDeleteWH = async () => {
    if (!deleteWHTarget) return;
    setDeleting(true);
    try {
      await deleteWorkingHour(deleteWHTarget.id);
      setWorkingHours((prev) => prev.filter((wh) => wh.id !== deleteWHTarget.id));
      setDeleteWHTarget(null);
    } catch {
      alert('Gabim gjatë fshirjes.');
    }
    setDeleting(false);
  };

  // ── DAYS OFF ──────────────────────────────────────────────
  const handleOpenDOCreate = () => {
    setDoEditingId(null);
    setDoForm(emptyDayOffForm);
    setDoError('');
    setOpenDODialog(true);
  };

  const handleOpenDOEdit = (doItem: DayOff) => {
    setDoEditingId(doItem.id);
    setDoForm({ date: doItem.date, reason: doItem.reason ?? '' });
    setDoError('');
    setOpenDODialog(true);
  };

  const handleSaveDO = async () => {
    if (!selectedEmployeeId) return;
    if (!doForm.date) { setDoError('Vendosni datën!'); return; }
    setDoSaving(true);
    try {
      const payload = { date: doForm.date, reason: doForm.reason || null };
      const saved = doEditingId
        ? await updateDayOff(doEditingId, payload)
        : await createDayOff(selectedEmployeeId, payload);

      if (doEditingId) {
        setDaysOff((prev) => prev.map((d) => d.id === doEditingId ? saved : d));
      } else {
        setDaysOff((prev) => [...prev, saved]);
      }
      setOpenDODialog(false);
    } catch {
      setDoError('Gabim gjatë ruajtjes.');
    }
    setDoSaving(false);
  };

  const handleConfirmDeleteDO = async () => {
    if (!deleteDOTarget) return;
    setDeleting(true);
    try {
      await deleteDayOff(deleteDOTarget.id);
      setDaysOff((prev) => prev.filter((d) => d.id !== deleteDOTarget.id));
      setDeleteDOTarget(null);
    } catch {
      alert('Gabim gjatë fshirjes.');
    }
    setDeleting(false);
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <Box sx={{ p: 4, width: '100%' }}>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Menaxhimi i Orareve</Typography>
        <Box>
          {activeTab === 0 ? (
            <Button variant="contained" color="primary" startIcon={<AddIcon />}
              onClick={handleOpenWHCreate} disabled={!selectedEmployeeId}>
              Shto Orar
            </Button>
          ) : (
            <Button variant="contained" color="secondary" startIcon={<AddIcon />}
              onClick={handleOpenDOCreate} disabled={!selectedEmployeeId}>
              Shto Ditë Pushimi
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Majtas: Zgjedhja e punonjësit */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }} elevation={4}>
            <Typography variant="h6" mb={2}>Punonjësi</Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Zgjidh Punonjësin</InputLabel>
              <Select
                value={selectedEmployeeId}
                label="Zgjidh Punonjësin"
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <MenuItem value=""><em>Zgjidh...</em></MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Djathtas: Detajet (Tabs) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }} elevation={4}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Oraret (Javore)" />
              <Tab label="Ditët Pushim" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {!selectedEmployeeId ? (
                <Typography color="text.secondary" align="center">
                  Zgjidhni një punonjës për të parë orarin.
                </Typography>
              ) : activeTab === 0 ? (
                /* TAB 1: ORARET */
                loadingHours
                  ? <Box display="flex" justifyContent="center"><CircularProgress /></Box>
                  : workingHours.length === 0
                    ? <Typography color="text.secondary">Nuk ka orar të regjistruar.</Typography>
                    : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: 'rgba(126, 87, 194, 0.1)' }}>
                            <TableRow>
                              <TableCell><strong>Dita</strong></TableCell>
                              <TableCell><strong>Fillimi</strong></TableCell>
                              <TableCell><strong>Mbarimi</strong></TableCell>
                              <TableCell align="right"><strong>Veprime</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {workingHours.map((wh) => (
                              <TableRow key={wh.id} hover>
                                <TableCell>{daysOfWeekMap[wh.dayOfWeek]}</TableCell>
                                <TableCell>{wh.startTime}</TableCell>
                                <TableCell>{wh.endTime}</TableCell>
                                <TableCell align="right">
                                  <IconButton color="info" size="small" onClick={() => handleOpenWHEdit(wh)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton color="error" size="small" onClick={() => setDeleteWHTarget(wh)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )
              ) : (
                /* TAB 2: DITËT PUSHIM */
                loadingDaysOff
                  ? <Box display="flex" justifyContent="center"><CircularProgress /></Box>
                  : daysOff.length === 0
                    ? <Typography color="text.secondary">Nuk ka ditë pushimi të regjistruara.</Typography>
                    : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: 'rgba(126, 87, 194, 0.1)' }}>
                            <TableRow>
                              <TableCell><strong>Data</strong></TableCell>
                              <TableCell><strong>Arsyeja</strong></TableCell>
                              <TableCell align="right"><strong>Veprime</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {daysOff.map((d) => (
                              <TableRow key={d.id} hover>
                                <TableCell>{d.date}</TableCell>
                                <TableCell>{d.reason || '-'}</TableCell>
                                <TableCell align="right">
                                  <IconButton color="info" size="small" onClick={() => handleOpenDOEdit(d)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton color="error" size="small" onClick={() => setDeleteDOTarget(d)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* DIALOG: WORKING HOUR */}
      <Dialog open={openWHDialog} onClose={() => setOpenWHDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1e1e1e', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#7e57c2' }}>
          {whEditingId ? 'Ndrysho Orarin' : 'Shto Orar të Ri'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Dita</InputLabel>
            <Select
              value={whForm.dayOfWeek}
              label="Dita"
              onChange={(e) => setWhForm({ ...whForm, dayOfWeek: Number(e.target.value) })}
            >
              {daysOfWeekMap.map((day, i) => (
                <MenuItem key={i} value={i}>{day}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" gap={2}>
            <TextField label="Fillimi" type="time" fullWidth value={whForm.startTime}
              onChange={(e) => setWhForm({ ...whForm, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }} />
            <TextField label="Mbarimi" type="time" fullWidth value={whForm.endTime}
              onChange={(e) => setWhForm({ ...whForm, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }} />
          </Box>
          {whError && <Typography color="error" variant="body2">{whError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenWHDialog(false)}>Anulo</Button>
          <Button onClick={handleSaveWH} variant="contained" disabled={whSaving}>
            {whSaving ? 'Duke ruajtur...' : 'Ruaj'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: DAY OFF */}
      <Dialog open={openDODialog} onClose={() => setOpenDODialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1e1e1e', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#7e57c2' }}>
          {doEditingId ? 'Ndrysho Ditën' : 'Shto Ditë Pushimi'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Data" type="date" fullWidth value={doForm.date}
            onChange={(e) => setDoForm({ ...doForm, date: e.target.value })}
            InputLabelProps={{ shrink: true }} />
          <TextField label="Arsyeja (opsionale)" fullWidth multiline rows={2}
            value={doForm.reason}
            onChange={(e) => setDoForm({ ...doForm, reason: e.target.value })} />
          {doError && <Typography color="error" variant="body2">{doError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDODialog(false)}>Anulo</Button>
          <Button onClick={handleSaveDO} variant="contained" color="secondary" disabled={doSaving}>
            {doSaving ? 'Duke ruajtur...' : 'Ruaj'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION: WH */}
      <Dialog open={!!deleteWHTarget} onClose={() => setDeleteWHTarget(null)}>
        <DialogTitle sx={{ color: '#f44336' }}>Fshij Orarin?</DialogTitle>
        <DialogContent>
          <Typography>A jeni i sigurt që dëshironi të fshini këtë orar?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteWHTarget(null)}>Jo</Button>
          <Button onClick={handleConfirmDeleteWH} variant="contained" color="error" disabled={deleting}>
            Po, Fshij
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION: DO */}
      <Dialog open={!!deleteDOTarget} onClose={() => setDeleteDOTarget(null)}>
        <DialogTitle sx={{ color: '#f44336' }}>Fshij Ditën e Pushimit?</DialogTitle>
        <DialogContent>
          <Typography>A jeni i sigurt që dëshironi të fshini këtë ditë pushimi?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDOTarget(null)}>Jo</Button>
          <Button onClick={handleConfirmDeleteDO} variant="contained" color="error" disabled={deleting}>
            Po, Fshij
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
