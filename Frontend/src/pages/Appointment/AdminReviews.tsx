import { useEffect, useState } from 'react';
import {Box, Typography, Paper, Table, TableBody, TableCell,TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, Rating, Button, Menu, MenuItem,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { adminGetAllReviews } from '../../api/reviewApi';
import type { ReviewDto } from '../../types/review.types';
import { useTranslation } from 'react-i18next';
import { exportData } from '../../api/reportsApi';

export default function AdminReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setExportAnchor(null);
    setExporting(true);
    try { await exportData('reviews', format); }
    catch { setError('Export dështoi.'); }
    finally { setExporting(false); }
  };



  useEffect(() => {
    adminGetAllReviews()
      .then(setReviews)
      .catch(() => setError(t('adminReviews.loadFailed', 'Dështoi ngarkimi i vlerësimeve.')))
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Icon icon="solar:star-bold-duotone" width={36} style={{ color: '#1976d2' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{t('adminReviews.title', 'Të gjitha vlerësimet')}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t('adminReviews.subtitle', 'Monitoroni vlerësimet dhe kënaqësinë e klientëve.')}</Typography>
        </Box>
        {/* Export */}
        <Button
          variant="outlined"
          startIcon={<Icon icon="solar:export-bold" width={18} />}
          endIcon={<Icon icon="solar:alt-arrow-down-bold" width={14} />}
          onClick={(e) => setExportAnchor(e.currentTarget)}
          disabled={exporting}
          sx={{ borderRadius: 2, fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {exporting ? t('export.exportingBtn', 'Duke eksportuar...') : t('export.exportBtn', 'Eksporto')}
        </Button>
        <Menu
          anchorEl={exportAnchor}
          open={Boolean(exportAnchor)}
          onClose={() => setExportAnchor(null)}
        >
          <MenuItem onClick={() => handleExport('excel')}>
            <Icon icon="vscode-icons:file-type-excel" width={18} style={{ marginRight: 8 }} />
            {t('export.downloadExcel', 'Shkarko Excel (.xlsx)')}
          </MenuItem>
          <MenuItem onClick={() => handleExport('csv')}>
            <Icon icon="vscode-icons:file-type-csv" width={18} style={{ marginRight: 8 }} />
            {t('export.downloadCsv', 'Shkarko CSV (.csv)')}
          </MenuItem>
          <MenuItem onClick={() => handleExport('json')}>
            <Icon icon="vscode-icons:file-type-json" width={18} style={{ marginRight: 8 }} />
            {t('export.downloadJson', 'Shkarko JSON (.json)')}
          </MenuItem>
        </Menu>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 160px' })}>
          <Typography variant="body2" color="text.secondary">{t('adminReviews.totalReviews', 'Total Vlerësime')}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{reviews.length}</Typography>
        </Paper>
        <Paper elevation={0} sx={(theme) => ({ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: '1 1 160px' })}>
          <Typography variant="body2" color="text.secondary">{t('adminReviews.avgRating', 'Mesatarja e vlerësimit')}</Typography>
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
          <Typography variant="h6">{t('adminReviews.noData', 'Nuk u gjet asnjë vlerësim.')}</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={(theme) => ({ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` })}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminReviews.table.userName', 'Emri i Përdoruesit')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminReviews.table.employeeName', 'Employee Name')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminReviews.table.serviceName', 'Service Name')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminReviews.table.rating', 'Vlerësimi')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('adminReviews.table.comment', 'Komenti')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                        {review.userName || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {review.employeeName || '—'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {review.serviceName || '—'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Chip label={review.rating} size="small" color="warning" sx={{ fontWeight: 'bold' }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: review.comment ? 'normal' : 'italic' }}>
                        {review.comment || t('adminReviews.noComment', 'Pa koment')}
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
