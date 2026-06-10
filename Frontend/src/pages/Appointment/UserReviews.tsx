import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, Rating,
} from '@mui/material';

import { Icon } from '@iconify/react';
import { getMyReviews } from '../../api/reviewApi';
import type { ReviewDto } from '../../types/review.types';
import { useTranslation } from 'react-i18next';
export default function UserReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getMyReviews()
      .then(setReviews)
      .catch(() => setError(t('userReviews.loadFailed', { defaultValue: 'Failed to load reviews' })))
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
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {t('userReviews.title', { defaultValue: 'My Reviews' })}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('userReviews.subtitle', { defaultValue: 'Manage and view all the reviews you have submitted.' })}
          </Typography>
        </Box>
      </Box>
      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 160px' })}>
          <Typography variant="body2" color="text.secondary">{t('userReviews.totalReviews', { defaultValue: 'Total Reviews' })}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{reviews.length}</Typography>
        </Paper>
        <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 160px' })}>
          <Typography variant="body2" color="text.secondary">{t('userReviews.avgRating', { defaultValue: 'Average Rating' })}</Typography>
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
        <Paper elevation={0} sx={(theme) => ({ p: 6, textAlign: 'center', borderRadius: 3, border: `1px dashed ${theme.palette.divider}` })}>
          <Icon icon="solar:star-broken" width={60} style={{ color: 'rgba(145, 158, 171, 0.5)', marginBottom: 16 }} />
          <Typography variant="h6">{t('userReviews.noData', { defaultValue: 'You have not submitted any reviews yet.' })}</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={(theme) => ({ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` })}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('userReviews.table.appointment', { defaultValue: 'Appointment ID' })}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('userReviews.table.rating', { defaultValue: 'Rating' })}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('userReviews.table.comment', { defaultValue: 'Comment' })}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {review.serviceId?.substring(0, 8)}...
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
                        {review.comment || t('userReviews.noComment', { defaultValue: 'No comment provided' })}
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