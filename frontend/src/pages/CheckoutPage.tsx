import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, PaymentElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import {
  Box, Typography, Paper, Button, CircularProgress,
  Alert, Divider, Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Lock, CheckCircle, CreditCard, FlightTakeoff, ArrowBack,
} from '@mui/icons-material';
import api, { bookingAPI, paymentAPI } from '../services/api';
import { RootState } from '../store';

const stripePromise = loadStripe('pk_test_51TP0JYFOyBxjmoiQzrrt5PIp2IZ2TQcmaNXUKcBOVaqj3NnmNbXlOwdxihKocqWhXQvZXr6yZbh32ip8QK6sxXXu00OijvduD5');

const T = {
  teal: '#0EA5A0', navy: '#0F2D5C', slate: '#64748B',
  ink: '#0F172A', paper: '#F8FAFC', white: '#FFFFFF',
  border: '#E2E8F0', green: '#16A34A',
};

  const StripeForm: React.FC<{ booking: any; onSuccess: () => void }> = ({ booking, onSuccess }) => {
   const stripe   = useStripe();
   const elements = useElements();
   const [loading, setLoading] = useState(false);
   const [error, setError]     = useState<string | null>(null);

   // Check if PaymentElement is ready
   const isReady = stripe && elements && elements.getElement('payment');

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Verify PaymentElement is mounted
    const paymentElement = elements.getElement('payment');
    if (!paymentElement) {
      setError('Le formulaire de paiement n\'est pas encore chargé. Veuillez patienter.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: stripeErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeErr) {
      setError(stripeErr.message ?? 'Paiement refusé');
      setLoading(false);
      return;
    }

    try {
      await paymentAPI.confirm(paymentIntent?.id!);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
       <Button type="submit" fullWidth disabled={!isReady || loading}
        sx={{
          mt: 3, py: 1.5, borderRadius: 2, bgcolor: T.navy, color: T.white,
          fontWeight: 700, fontSize: 15, textTransform: 'none',
          '&:hover': { bgcolor: '#0D2550' },
          '&:disabled': { bgcolor: alpha(T.navy, 0.4), color: T.white },
        }}>
        {loading
          ? <CircularProgress size={20} sx={{ color: T.white }} />
          : <><Lock sx={{ fontSize: 16, mr: 1 }} />Payer {booking?.total_price} EUR</>}
      </Button>
      <Typography sx={{ textAlign: 'center', fontSize: 11, color: T.slate, mt: 1.5 }}>
        🔒 Paiement sécurisé Stripe — données jamais stockées sur nos serveurs
      </Typography>
    </Box>
  );
};

const CheckoutPage: React.FC = () => {
  const { bookingId }         = useParams<{ bookingId: string }>();
  const navigate              = useNavigate();
  const { token }             = useSelector((state: RootState) => state.auth);
  const [booking, setBooking] = useState<any>(null);
  const [clientSecret, setCS] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    (async () => {
      try {
        const bRes = await bookingAPI.get(Number(bookingId));
        setBooking(bRes.data);
        const iRes = await paymentAPI.createIntent(Number(bookingId));
        setCS(iRes.data.client_secret);
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Impossible de charger le paiement');
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: T.teal }} />
    </Box>
  );

  if (success) return (
    <Box sx={{ minHeight: '100vh', bgcolor: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center', maxWidth: 420, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha(T.green, 0.1), mx: 'auto', mb: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle sx={{ fontSize: 36, color: T.green }} />
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: T.ink, mb: 1 }}>Paiement confirmé !</Typography>
        <Typography sx={{ fontSize: 14, color: T.slate, mb: 3 }}>
          Réservation <strong>{booking?.trip?.title}</strong> confirmée.
        </Typography>
        <Button fullWidth onClick={() => navigate('/bookings')}
          sx={{ bgcolor: T.navy, color: T.white, borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1.2 }}>
          Voir mes réservations
        </Button>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: T.paper, py: 5, px: 2 }}>
      <Box maxWidth={860} mx="auto">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}
          sx={{ mb: 3, color: T.slate, textTransform: 'none' }}>Retour</Button>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: T.ink, mb: 3 }}>Finaliser la réservation</Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <CreditCard sx={{ color: T.teal }} />
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: T.ink }}>Informations de paiement</Typography>
            </Box>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontSize: 12 }}>
              <strong>🧪 Mode test Stripe</strong><br />
              ✅ Succès: <code>4242 4242 4242 4242</code> — date future — CVC quelconque<br />
              ❌ Refus: <code>4000 0000 0000 0002</code><br />
              🔐 3D Secure: <code>4000 0025 0000 3155</code><br />
              ⚠️ Dispute auto: <code>4000 0000 0000 0259</code>
            </Alert>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{
          clientSecret,
          appearance: { theme: 'stripe', variables: { colorPrimary: T.teal, colorText: T.ink, borderRadius: '8px' } },
        }}>
          <StripeForm booking={booking} onSuccess={() => setSuccess(true)} />
        </Elements>
      )}
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink, mb: 2 }}>Résumé</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(T.teal, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlightTakeoff sx={{ fontSize: 20, color: T.teal }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{booking?.trip?.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: T.slate }}>
                    {booking?.tripSession?.start_date} → {booking?.tripSession?.end_date}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Total</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 800, color: T.teal }}>{booking?.total_price} EUR</Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.ink, mb: 1.5 }}>Politique d'annulation</Typography>
              {[
                { label: '> 30 jours avant départ', value: '100% remboursé', color: T.green },
                { label: '15–30 jours',              value: '70% remboursé',  color: '#D97706' },
                { label: '7–15 jours',               value: '40% remboursé',  color: '#EA580C' },
                { label: '< 7 jours',                value: 'Non remboursé',  color: '#DC2626' },
              ].map(r => (
                <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography sx={{ fontSize: 12, color: T.slate }}>{r.label}</Typography>
                  <Chip label={r.value} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(r.color, 0.1), color: r.color }} />
                </Box>
              ))}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CheckoutPage;