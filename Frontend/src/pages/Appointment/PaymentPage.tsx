import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Container, Paper, Typography, Box, CircularProgress, Alert, Button, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import { createPaymentIntent } from '../../api/paymentApi';
import CheckoutForm from '../../components/Payment/CheckoutForm';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getOrderById } from '../../api/orderApi';
import type { OrderResponseDto } from '../../api/orderApi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

export default function PaymentPage() {
  const { t, i18n } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setError(t('payment.errorInvalidId', 'Invalid order ID.'));
      setLoading(false);
      return;
    }

    const initPayment = async () => {
      try {
        
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        
        const paymentData = await createPaymentIntent({
          orderId,
          amount: orderData.totalAmount,
          paymentMethod: 'Stripe',
        });

        if (paymentData.clientSecret) {
          setClientSecret(paymentData.clientSecret);
        } else {
          setError(t('payment.errorDataFailed', 'Failed to load order data.'));
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || t('payment.errorInitFailed', 'Failed to initialize payment.'));
        } else {
          setError(t('payment.errorUnexpected', 'An unexpected error occurred.'));
        }
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [orderId]);

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper
        elevation={4}
        sx={(theme) => ({
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)'
            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0) 100%)',
          backdropFilter: 'blur(10px)',
        })}
      >
        <Box component="div" sx={{ textAlign: 'center', mb: 4 }}>
          <Icon icon="solar:shield-check-bold-duotone" width={48} style={{ color: '#1976d2', marginBottom: 8 }} />
          <Typography component="div" variant="h4" gutterBottom color="primary" sx={{ fontWeight: '800' }}>
            {t('payment.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('payment.subtitle')}
          </Typography>
        </Box>

        {/* Order Summary */}
        {order && (
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'rgba(25, 118, 210, 0.06)',
              border: '1px solid rgba(25, 118, 210, 0.15)',
            }}
          >
            <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('payment.orderPrefix')}{order.id.substring(0, 8)}...
              </Typography>
              <Chip
                label={t(`statuses.${order.status || 'Pending'}`)}
                size="small"
                color="warning"
                sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
              />
            </Box>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
              {order.totalAmount.toLocaleString(
                i18n.language === 'sq'
                  ? 'sq-AL'
                  : i18n.language === 'de'
                  ? 'de-DE'
                  : 'en-US',
                { style: 'currency', currency: 'EUR' }
              )}
            </Typography>
          </Paper>
        )}

        {error ? (
          <Box component="div">
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-bookings')}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              {t('payment.returnBtn')}
            </Button>
          </Box>
        ) : loading ? (
          <Box component="div" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4, gap: 2 }}>
            <CircularProgress size={48} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              {t('payment.initializing')}
            </Typography>
          </Box>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        )}
      </Paper>
    </Container>
  );
}