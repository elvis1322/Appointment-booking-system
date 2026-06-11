import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Grid, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Button,
  Checkbox, FormControlLabel, FormGroup, Divider, Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import type { Employee, Service } from '../../types/staff.types';
import {
  getEmployees,
  getServices,
  updateEmployeeServices,
} from '../../api/staffApi';

export default function EmployeeServices() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([getEmployees(), getServices()])
      .then(([empData, servData]) => {
        setEmployees(empData);
        setServices(servData);
      })
      .catch((err) => console.error('Gabim gjatë marrjes së të dhënave:', err))
      .finally(() => setLoading(false));
  }, []);

  // Kur ndryshon punonjësi, pre-selekto shërbimet e tij
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      setSelectedServiceIds(emp?.serviceIds ?? []);
    } else {
      setSelectedServiceIds([]);
    }
  }, [selectedEmployeeId, employees]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = async () => {
    if (!selectedEmployeeId) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateEmployeeServices(selectedEmployeeId, selectedServiceIds);
      setMessage({ type: 'success', text: t('employeeServicesPage.saveSuccess') });
      // Përditëso listën lokale
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployeeId
            ? { ...emp, serviceIds: selectedServiceIds }
            : emp
        )
      );
    } catch {
      setMessage({ type: 'error', text: t('employeeServicesPage.saveError') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }}>
        {t('employeeServicesPage.title')}
      </Typography>

      <Grid container spacing={4}>
        {/* Zgjedhja e Punonjësit */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }} elevation={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('employeeServicesPage.selectEmployee')}</Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel>{t('employeeServicesPage.selectEmployeeLabel')}</InputLabel>
              <Select
                value={selectedEmployeeId}
                label={t('employeeServicesPage.selectEmployeeLabel')}
                onChange={(e) => setSelectedEmployeeId(e.target.value as string)}
              >
                <MenuItem value=""><em>{t('employeeServicesPage.selectEmployeePlaceholder')}</em></MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}{emp.jobTitle ? ` (${emp.jobTitle})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {t('employeeServicesPage.selectEmployeeHelp')}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Lista e Shërbimeve */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }} elevation={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{t('employeeServicesPage.availableServices')}</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!selectedEmployeeId || saving}
              >
                {saving ? t('employeeServicesPage.saving') : t('employeeServicesPage.saveChanges')}
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {message && (
              <Alert severity={message.type} sx={{ mb: 2 }}>
                {message.text}
              </Alert>
            )}

            {!selectedEmployeeId ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                {t('employeeServicesPage.chooseEmployeePrompt')}
              </Typography>
            ) : (
              <FormGroup>
                <Grid container spacing={2}>
                  {services.map((service) => (
                    <Grid item xs={12} sm={6} key={service.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1,
                          pl: 2,
                          border: selectedServiceIds.includes(service.id)
                            ? '1px solid #7e57c2'
                            : '1px solid #333',
                          bgcolor: selectedServiceIds.includes(service.id)
                            ? 'rgba(126, 87, 194, 0.05)'
                            : 'transparent',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedServiceIds.includes(service.id)}
                              onChange={() => handleToggleService(service.id)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1">{service.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {service.serviceCategoryName || service.categoryName || t('employeeServicesPage.noCategory')}
                              </Typography>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
