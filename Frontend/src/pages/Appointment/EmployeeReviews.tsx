import { useEffect, useState } from 'react';
import {Box, Typography, Paper, Table, TableBody, TableCell,TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, Rating,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { employeeGetReviews } from '../../api/reviewApi';
import type { ReviewDto } from '../../types/review.types';
import { useTranslation } from 'react-i18next';

export default function EmployeeReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    employeeGetReviews()
      .then(setReviews)
      .catch(() => setError(t('employeeReviews.loadFailed', 'Dështoi ngarkimi i vlerësimeve.')))
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Icon icon="solar:star-bold-duotone" width={36} style={{ color: '#1976d2' }} />
        <Box>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{t('employeeReviews.title', 'Vlerësimet e Mia')}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t('employeeReviews.subtitle', 'Shikoni çfarë thonë klientët për shërbimet tuaja')}</Typography>
        </Box>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 160px' })}>
          <Typography variant="body2" color="text.secondary">{t('employeeReviews.totalReviews', 'Total Vlerësime')}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{reviews.length}</Typography>
        </Paper>
        <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 160px' })}>
          <Typography variant="body2" color="text.secondary">{t('employeeReviews.avgRating', 'Mesatarja e Vlerësimit')}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>{avgRating}</Typography>
            <Icon icon="solar:star-bold" width={20} style={{ color: '#ed6c02' }} />
          </Box>
        </Paper>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={48} thickness={4} /></Box>
      ) : reviews.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Icon icon="solar:star-broken" width={60} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 16 }} />
          <Typography variant="h6">{t('employeeReviews.noData', 'Nuk keni asnjë vlerësim ende.')}</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={(theme) => ({ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` })}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeReviews.table.clientName', 'Emri i Klientit')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeReviews.table.service', 'Shërbimi')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeReviews.table.rating', 'Vlerësimi')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeReviews.table.comment', 'Komenti')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                        {review.userName || t('employeeReviews.unknown', 'I panjohur')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                        {review.serviceName || (review.serviceId ? review.serviceId.substring(0, 8) + '...' : '—')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Chip label={review.rating} size="small" color="warning" sx={{ fontWeight: 'bold' }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: review.comment ? 'normal' : 'italic' }}>
                        {review.comment || t('employeeReviews.noComment', 'Pa koment.')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
