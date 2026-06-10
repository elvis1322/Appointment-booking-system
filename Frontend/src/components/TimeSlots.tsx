import Grid from '@mui/material/Grid';
import { Box, Button, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { BookedSlot } from '../api/appointmentApi';

type Props = {
  time: string;
  setTime: (value: string) => void;
  bookedSlots?: BookedSlot[];
  selectedDate?: string;
  intervalMinutes?: number;
  isUnavailable?: boolean;
  employeeStartTime?: string;
  employeeEndTime?: string;
};

export default function TimeSlots({ 
  time, 
  setTime, 
  bookedSlots = [], 
  selectedDate, 
  intervalMinutes = 30,
  isUnavailable = false,
  employeeStartTime = "09:00:00",
  employeeEndTime = "17:00:00",
}: Props) {
  const { t } = useTranslation();
  
  const generateSlots = () => {
    if (isUnavailable) return [];

    const current = new Date(`1970-01-01T${employeeStartTime}`);
    const end = new Date(`1970-01-01T${employeeEndTime}`);

    if (isNaN(current.getTime()) || isNaN(end.getTime())) return [];

    const slots: string[] = [];
    let iter = current;
    const MAX_SLOTS = 200; 

    while (slots.length < MAX_SLOTS) {
      const slotEnd = new Date(iter.getTime() + intervalMinutes * 60 * 1000);
      if (slotEnd > end) break;

      const hh = String(iter.getHours()).padStart(2, '0');
      const mm = String(iter.getMinutes()).padStart(2, '0');
      slots.push(`${hh}:${mm}`);

      
      const next = new Date(iter.getTime() + intervalMinutes * 60 * 1000);
      const rem = next.getMinutes() % 5;
      if (rem !== 0) next.setMinutes(next.getMinutes() + (5 - rem));
      next.setSeconds(0);
      next.setMilliseconds(0);
      iter = next;
    }
    return slots;
  };

  const times = generateSlots();

  const isTimeInPast = (slotTime: string): boolean => {
    if (!selectedDate) return false;
    const slotStart = new Date(`${selectedDate}T${slotTime}:00`);
    const now = new Date();
    return slotStart.getTime() <= now.getTime();
  };

  const isTimeBooked = (slotTime: string): boolean => {
    if (!selectedDate || bookedSlots.length === 0) return false;

    const slotStart = new Date(`${selectedDate}T${slotTime}:00`);
    const slotEnd = new Date(slotStart.getTime() + intervalMinutes * 60 * 1000);

    return bookedSlots.some((booked) => {
      const bookedStart = new Date(booked.startTime);
      const bookedEnd = new Date(booked.endTime);
      // Check if there is any overlap
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ fontWeight: 'bold', color: 'text.secondary' }}
      >
        {t('booking.selectTime', 'Select a Time')}
      </Typography>

      {isUnavailable && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          {t('booking.noSlotsEmployeeUnavailable', 'Employee is not available on this date.')}
        </Typography>
      )}
      {!isUnavailable && times.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          {t('booking.noSlotsForDuration', 'No available slots for the selected duration.')}
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          {times.map((slot) => {
          const booked = isTimeBooked(slot);
          const past = isTimeInPast(slot);
          const unavailable = booked || past;
          return (
            <Grid size={3} key={slot}>
              <Button
                fullWidth
                variant={time === slot ? 'contained' : unavailable ? 'contained' : 'outlined'}
                color={booked ? 'error' : 'primary'}
                onClick={() => !unavailable && setTime(slot)}
                disabled={unavailable}
                sx={{
                  borderRadius: 2,
                  position: 'relative',
                  opacity: unavailable ? 0.7 : 1,
                  '&.Mui-disabled': {
                    color: booked ? '#fff' : undefined,
                    backgroundColor: booked ? 'error.main' : undefined,
                    borderColor: booked ? 'error.main' : undefined,
                  },
                }}
              >
                {booked ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {slot}
                    </Typography>
                    <Chip
                      label={t('booking.booked', 'Booked')}
                      size="small"
                      color="error"
                      sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        mt: 0.2,
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  </Box>
                ) : (
                  slot
                )}
              </Button>
            </Grid>
          );
        })}
        </Grid>
      )}
    </Box>
  );
}