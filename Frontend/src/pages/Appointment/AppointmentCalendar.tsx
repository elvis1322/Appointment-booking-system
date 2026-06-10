import { useState, useEffect, useMemo, useCallback } from 'react';
import {Container,Paper,Typography,Box,CircularProgress,Alert,Chip,
  IconButton, Button,Dialog,DialogTitle,DialogContent,DialogActions } from '@mui/material';
import { Icon } from '@iconify/react';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { getAppointments, adminGetAllAppointments } from '../../api/appointmentApi';
import api from '../../api/axiosConfig';
import {
  getEmployees,
  getWorkingHours,
  getDaysOff,
} from '../../api/staffApi';

import type { AppointmentUserDto } from '../../types/appointment.types';
import type { DayOff } from '../../types/staff.types';

import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

import axios from 'axios';
import { notificationConnection } from '../../services/signalr/notificationConnection';

// --- Helpers for Dates & Times ---

const TIME_SLOTS: string[] = [];
for (let h = 6; h <= 21; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:30`);
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AppointmentCalendar() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<AppointmentUserDto[]>([]);
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedAppDetail, setSelectedAppDetail] = useState<any | null>(null);

  const isEmployee = user?.roles?.includes('Employee') ?? false;
  const isAdmin = user?.roles?.includes('Admin') ?? false;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch appointments from the correct endpoint based on role
      let appsData: AppointmentUserDto[] = [];
      if (isAdmin) {
        const adminData = await adminGetAllAppointments();
        // Map admin DTO to the same shape used by the calendar
        appsData = adminData.map((a) => ({
          id: a.id,
          startTime: a.startTime,
          endTime: a.endTime,
          statusName: a.statusName,
          serviceName: a.serviceName || '',
          employeeName: a.employeeName || '',
        }));
      } else if (isEmployee) {
        const res = await api.get('/EmployeeAppointments/MyAppointments');
        appsData = res.data.data;
      } else {
        appsData = await getAppointments();
      }
      // Filter out cancelled appointments – they should not appear on the calendar
      appsData = appsData.filter((a) => {
        const status = a.statusName?.toLowerCase();
        return (
          status !== 'cancelled' &&
          status !== 'anuluar' &&
          status !== 'abgebrochen'
        );
      });
      setAppointments(appsData);

      if (isEmployee) {
        try {
          const employees = await getEmployees();
          const myEmployee = employees.find((e) => e.userId === user.id);
          if (myEmployee) {
            const [, doData] = await Promise.all([
              getWorkingHours(myEmployee.id),
              getDaysOff(myEmployee.id),
            ]);
            setDaysOff(doData);
          }
        } catch (employeeErr) {
          console.warn('Could not load employee configuration', employeeErr);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('calendar.loadFailed'));
      } else {
        setError(t('calendar.loadFailed'));
      }
    } finally {
      setLoading(false);
    }
  }, [user, isEmployee, isAdmin, t]);

  useEffect(() => {
    void loadData();

    // Real-time: listen for SYSTEM_UPDATE directly
    const handleSignalR = (notification: { title: string }) => {
      if (notification.title === 'SYSTEM_UPDATE') void loadData();
    };
    notificationConnection.on('ReceiveNotification', handleSignalR);
    return () => {
      notificationConnection.off('ReceiveNotification', handleSignalR);
    };
  }, [loadData]);

  // Compute Current Week Days
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + weekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekOffset]);

  // Handle Prev/Next Week
  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
  const handleToday = () => setWeekOffset(0);

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    
    if (isEmployee) {
      daysOff.forEach((d) => {
        if (!map[d.date]) map[d.date] = [];
        map[d.date].push({
          type: 'dayOff',
          title: d.reason || t('calendar.dayOffDefault'),
          fullDay: true
        });
      });
    }

    appointments.forEach((app) => {
      const startDate = app.startTime.split('T')[0];
      const startT = app.startTime.split('T')[1].substring(0, 5);
      const endT = app.endTime.split('T')[1].substring(0, 5);

      if (!map[startDate]) map[startDate] = [];
      map[startDate].push({
        type: 'appointment',
        id: app.id,
        title: app.serviceName || t('booking.booked', 'Booked'),
        status: app.statusName,
        startT,
        endT,
        employeeName: app.employeeName || '',
        userName: (app as any).userName || '',
      });
    });

    return map;
  }, [appointments, daysOff, isEmployee, t]);

  const renderCell = (day: Date, timeStr: string) => {
    const dateStr = formatDate(day);
    const dayEvents = eventsByDate[dateStr] || [];

    // Check for day off
    const dayOff = dayEvents.find(e => e.type === 'dayOff');
    if (dayOff) {
      // If it's a day off, we might just style the whole row or show it differently.
      // For now, we will render a disabled looking cell.
      return (
        <Box
          sx={{
            height: '100%',
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(239, 68, 68, 0.05)',
          }}
        >
        </Box>
      );
    }

    // Check if an appointment starts here or falls within this 30-minute slot
    const appointment = dayEvents.find(e => {
      if (e.type !== 'appointment') return false;
      const [slotH, slotM] = timeStr.split(':').map(Number);
      const [appH, appM] = e.startT.split(':').map(Number);
      
      const slotTotalMins = slotH * 60 + slotM;
      const appTotalMins = appH * 60 + appM;
      
      return appTotalMins >= slotTotalMins && appTotalMins < slotTotalMins + 30;
    });

    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 70,
          p: 0.5,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        onClick={() => {
          if (appointment) {
            setSelectedAppDetail(appointment);
          }
        }}
      >
        {appointment && (
          <Box
            sx={{
              height: '100%',
              bgcolor: '#3b82f6',
              color: 'white',
              borderRadius: 2,
              p: { xs: 0.5, md: 1 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1.1, fontSize: { xs: '0.55rem', sm: '0.65rem', md: '0.75rem' } }}>
              {appointment.title}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.65rem' }, opacity: 0.9 }}>
              {appointment.startT} - {appointment.endT}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 6, px: { xs: 2, md: 4 } }}>
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: { xs: 2, md: 4 },
          borderRadius: 6,
          overflow: 'hidden',
          background: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.75)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark' ? '0 10px 40px rgba(0,0,0,0.45)' : '0 10px 30px rgba(0,0,0,0.08)',
        })}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {isEmployee ? t('calendar.mySchedule') : t('calendar.myCalendar')}
            </Typography>
            <Chip
              label={isEmployee ? t('calendar.roleEmployee') : isAdmin ? t('calendar.roleAdmin') : t('calendar.roleClient')}
              color={isEmployee ? 'secondary' : 'primary'}
              sx={{ borderRadius: 999, fontWeight: 700 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" onClick={handleToday} sx={{ borderRadius: 3, fontWeight: 'bold' }}>
              {t('calendar.today') || 'Today'}
            </Button>
            <IconButton onClick={handlePrevWeek} sx={{ bgcolor: 'action.hover' }} size="small">
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={handleNextWeek} sx={{ bgcolor: 'action.hover' }} size="small">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={55} thickness={4} />
          </Box>
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ minWidth: { xs: 800, lg: '100%' } }}>
              {/* Header Row: Times */}
              {/* Header Row: Times */}
              <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                <Box sx={{ width: { xs: 50, sm: 70, lg: 100 }, minWidth: { xs: 50, sm: 70, lg: 100 }, p: { xs: 1, lg: 2 }, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'text.secondary', fontSize: { xs: '0.65rem', sm: '0.8rem', lg: '1rem' } }}>
                  {t('calendar.date') || 'Date'}
                </Box>
                {TIME_SLOTS.map(time => (
                  <Box
                    key={time}
                    sx={{
                      flex: 1,
                      minWidth: { xs: 60, sm: 65, md: 70 },
                      px: 0.5,
                      py: { xs: 1, lg: 1.5 },
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem', lg: '0.85rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {time}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Body Rows: Days */}
              {currentWeekDays.map(day => {
                const dateStr = formatDate(day);
                const locale = i18n.language === 'sq' ? 'sq-AL' : i18n.language === 'de' ? 'de-DE' : 'en-US';
                const dayName = day.toLocaleDateString(locale, { weekday: 'short' });
                const dayNum = day.getDate();
                
                const isToday = formatDate(new Date()) === dateStr;

                return (
                  <Box key={dateStr} sx={{ display: 'flex', bgcolor: isToday ? 'action.selected' : 'transparent' }}>
                    {/* Day Label (Vertical Axis) */}
                    <Box sx={{ width: { xs: 50, sm: 70, lg: 100 }, minWidth: { xs: 50, sm: 70, lg: 100 }, p: { xs: 1, lg: 2 }, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="subtitle2" color={isToday ? 'primary' : 'text.primary'} sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: { xs: '0.55rem', sm: '0.7rem', lg: '0.875rem' } }}>
                        {dayName}
                      </Typography>
                      <Typography variant="h5" color={isToday ? 'primary' : 'text.primary'} sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '1.1rem', lg: '1.5rem' } }}>
                        {dayNum}
                      </Typography>
                    </Box>

                    {/* Time Slots for the Day */}
                    {TIME_SLOTS.map(time => (
                      <Box key={`${dateStr}-${time}`} sx={{ flex: 1, minWidth: { xs: 60, sm: 65, md: 70 }, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                        {renderCell(day, time)}
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Appointment Detail Dialog */}
      <Dialog
        open={!!selectedAppDetail}
        onClose={() => setSelectedAppDetail(null)}
     slotProps={{
  paper: {
    sx: {
      borderRadius: 4,
      p: 1,
      minWidth: 320,
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    }
  }
}}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 800,
            fontSize: '1.2rem',
            pb: 1,
          }}
        >
          <Icon icon="mdi:calendar-check" width={26} style={{ color: '#3b82f6' }} />
          {t('calendar.appointmentTitle', 'Appointment')}
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {selectedAppDetail && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Service */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 2,
                    bgcolor: 'rgba(59,130,246,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon icon="mdi:briefcase-outline" width={20} style={{ color: '#3b82f6' }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('calendar.serviceLabel', 'Service')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selectedAppDetail.title}
                  </Typography>
                </Box>
              </Box>

              {/* Client (for employee view) or Professional (for user/admin view) */}
              {isEmployee && selectedAppDetail.userName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: 2,
                      bgcolor: 'rgba(139,92,246,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon icon="mdi:account" width={20} style={{ color: '#8b5cf6' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('calendar.clientLabel', 'Client')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {selectedAppDetail.userName}
                    </Typography>
                  </Box>
                </Box>
              ) : selectedAppDetail.employeeName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: 2,
                      bgcolor: 'rgba(139,92,246,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon icon="mdi:account" width={20} style={{ color: '#8b5cf6' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('calendar.employeeLabel', 'Professional')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {selectedAppDetail.employeeName}
                    </Typography>
                  </Box>
                </Box>
              ) : null}

              {/* Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 2,
                    bgcolor: 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon icon="mdi:clock-outline" width={20} style={{ color: '#10b981' }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('calendar.timeLabel', 'Time')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selectedAppDetail.startT} – {selectedAppDetail.endT}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setSelectedAppDetail(null)}
            sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', px: 3 }}
          >
            {t('calendar.closeBtn', 'Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}