import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Box, Alert, CircularProgress, Typography, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import { confirmPayment } from '../../api/paymentApi';
import { useTranslation } from 'react-i18next';

export default function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (stripeError) {
      setError(stripeError.message || t('payment.paymentFailed', 'Payment failed'));
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await confirmPayment(paymentIntent.id);
        setSuccess(true);
        setLoading(false);
        // Redirect to bookings after a brief delay
        setTimeout(() => navigate('/my-bookings'), 3000);
      } catch (err) {
        setError(t('payment.paymentVerificationFailed', 'Payment succeeded but we could not verify it with our server. Please contact support.'));
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <Box component="div" sx={{ textAlign: 'center', py: 3 }}>
        <Icon
          icon="solar:check-circle-bold-duotone"
          width={64}
          style={{ color: '#4caf50', marginBottom: 16 }}
        />
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {t('payment.successAlert', 'Payment successful!')}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('payment.redirecting', 'Redirecting...')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/my-bookings')}
          sx={{ borderRadius: 2 }}
        >
          {t('payment.goToBookings', 'Go to My Bookings')}
        </Button>
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box
        sx={(themeLocal) => ({
          border: `1px solid ${themeLocal.palette.divider}`,
          p: 2.5,
          borderRadius: 2,
          mb: 3,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
          transition: 'border-color 0.3s ease',
          '&:focus-within': {
            borderColor: 'primary.main',
          },
        })}
      >
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                '::placeholder': { color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b6375' },
              },
              invalid: { color: '#ef4444' },
            },
          }}
        />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        fullWidth 
        disabled={!stripe || loading}
        sx={{
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          borderRadius: 2,
          boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : t('payment.payNow', 'Pay Now')}
      </Button>
    </form>
  );
}
