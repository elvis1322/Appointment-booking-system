import { useState, useEffect } from 'react';
import { Container,Typography,Box,Paper,Table,TableBody,TableCell,TableContainer,TableHead,
TableRow,Button,Chip,CircularProgress,Alert,} from '@mui/material';
import { Icon } from '@iconify/react';
import { getMyOrders } from '../../api/orderApi';
import { getAppointments } from '../../api/appointmentApi';
import type { AppointmentUserDto } from '../../types/appointment.types';
import { getInvoiceByOrderId, downloadInvoicePdf } from '../../api/invoiceApi';
import type { OrderResponseDto } from '../../api/orderApi';
import type { InvoiceResponseDto } from '../../types/invoice.types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function MyInvoices() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [appointments, setAppointments] = useState<AppointmentUserDto[]>([]);
  const [invoices, setInvoices] = useState<Record<string, InvoiceResponseDto>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrdersAndInvoices();
  }, []);

  const fetchOrdersAndInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch my orders and appointments
      const [ordersData, appointmentsData] = await Promise.all([
        getMyOrders(),
        getAppointments(),
      ]);

      setAppointments(appointmentsData);

      // Only show orders for appointments that still exist and are not cancelled
      const activeAppointmentIds = appointmentsData
        .filter((app) => app.statusName?.toLowerCase() !== 'cancelled')
        .map((app) => app.id);

      const validOrders = ordersData.filter((order) => activeAppointmentIds.includes(order.appointmentId));
      setOrders(validOrders);

      // Fetch invoice for each order via proper API layer
      const invoiceMap: Record<string, InvoiceResponseDto> = {};
      await Promise.all(
        validOrders.map(async (order) => {
          try {
            const invoice = await getInvoiceByOrderId(order.id);
            if (invoice) {
              invoiceMap[order.id] = invoice;
            }
          } catch {
            // If invoice is not found or fails, just skip it
          }
        })
      );
      setInvoices(invoiceMap);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('invoices.messages.loadFailed'));
      } else {
        setError(t('invoices.messages.loadFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    setDownloadingId(invoiceId);
    setError(null);
    try {
      // Download PDF via proper API layer
      const blob = await downloadInvoicePdf(invoiceId);

      // Create a local blob link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fatura-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError(t('invoices.messages.downloadFailed'));
    } finally {
      setDownloadingId(null);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'përfunduar':
        return 'success';
      case 'pending':
      case 'në pritje':
        return 'warning';
      case 'cancelled':
      case 'anuluar':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Premium Header */}
      <Box component="div" sx={{ mb: 4 }}>
        <Typography component="div" variant="h4" sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}>
          {t('invoices.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('invoices.subtitle')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress size={50} thickness={4} />
        </Box>
      ) : orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={(theme) => ({
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          })}
        >
          <Icon icon="solar:bill-broken" width={60} style={{ color: (document.body.classList.contains('dark-theme') ? 'rgba(255, 255, 255, 0.3)' : '#1976d2'), marginBottom: '16px' }} />
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
            {t('invoices.noInvoicesTitle')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('invoices.noInvoicesDesc')}
          </Typography>
        </Paper>
      ) : (
        <Box component="div" sx={{ mt: 3 }}>
          <TableContainer
            component={Paper}
            sx={(theme) => ({
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)' : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0) 100%)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden',
            })}
          >
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('booking.service', 'Service')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('invoices.table.amount')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('invoices.table.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('invoices.table.details')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    {t('invoices.table.download')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const invoice = invoices[order.id];
                  const app = appointments.find(a => a.id === order.appointmentId);

                  return (
                    <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        {app ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                              {app.serviceName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {app.employeeName} • {new Date(app.startTime).toLocaleDateString()}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {order.id.substring(0, 8)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {order.totalAmount.toLocaleString(
                          i18n.language === 'sq'
                            ? 'sq-AL'
                            : i18n.language === 'de'
                            ? 'de-DE'
                            : 'en-US',
                          {
                            style: 'currency',
                            currency: 'EUR',
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`statuses.${order.status || 'Pending'}`)}
                          color={getOrderStatusColor(order.status)}
                          size="small"
                          sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {invoice ? (
                          <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {t('invoices.table.invoiceIdPrefix')}{invoice.id.substring(0, 8)}...
                            </Typography>
                            <Chip
                              label={`${t('invoices.table.invoicePrefix', 'Invoice')}: ${t(`statuses.${invoice.status}`)}`}
                              size="small"
                              variant="outlined"
                              color="info"
                              sx={{ width: 'fit-content', fontSize: '0.75rem', height: '20px' }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            {t('invoices.table.unpaid')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {invoice ? (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<Icon icon="solar:document-download-bold" />}
                            onClick={() => handleDownloadPdf(invoice.id)}
                            disabled={downloadingId === invoice.id}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            {downloadingId === invoice.id ? t('invoices.actions.downloading') : t('invoices.actions.downloadPdf')}
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            disabled
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            {t('invoices.actions.noInvoice')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}
