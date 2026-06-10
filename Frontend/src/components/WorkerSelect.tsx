import { FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { getEmployees } from '../api/staffApi';
import type { Employee } from '../types/staff.types';
import { useTranslation } from 'react-i18next';

type Props = {
  workerId: string;
  setWorkerId: (value: string) => void;
};

export default function WorkerSelect({ workerId, setWorkerId }: Props) {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployees()
      .then(setWorkers)
      .catch((err) => console.error("Failed to load workers", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="worker-select-label">{t('booking.selectProfessional')}</InputLabel>
      <Select
        labelId="worker-select-label"
        value={workerId}
        label={t('booking.selectProfessional')}
        onChange={(e) => setWorkerId(e.target.value)}
        disabled={loading}
      >
        {loading ? (
          <MenuItem value="" disabled>
            <CircularProgress size={24} />
          </MenuItem>
        ) : workers.length === 0 ? (
          <MenuItem value="" disabled>{t('booking.noProfessionals')}</MenuItem>
        ) : (
          workers.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.firstName} {w.lastName} - {w.jobTitle || 'Staff'}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
}