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
  EmojiEvents, CheckCircleOutline, Star, MilitaryTech,
  WorkspacePremium, Celebration, RocketLaunch
} from '@mui/icons-material';
import api, { bookingAPI, paymentAPI, loyaltyAPI } from '../services/api';
import { RootState } from '../store';

const stripePromise = loadStripe('pk_test_51TP0JYFOyBxjmoiQzrrt5PIp2IZ2TQcmaNXUKcBOVaqj3NnmNbXlOwdxihKocqWhXQvZXr6yZbh32ip8QK6sxXXu00OijvduD5');

const T = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  slate: '#64748B',
  ink: '#0F172A',
  paper: '#F8FAFC',
  white: '#FFFFFF',
  border: '#E2E8F0',
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
};

// ── Stripe Form ──────────────────────────────────────────
const StripeForm: React.FC<{ booking: any; onSuccess: (paymentIntentId: string) => void }> = ({ booking, onSuccess }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const [ready, setReady]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!stripe || !elements) return;
     setLoading(true);
     setError(null);

     const result = await stripe.confirmPayment({
       elements,
       redirect: 'if_required',
     });

     if (result.error) {
       if (result.error.code === 'payment_intent_unexpected_state') {
         // Payment already succeeded — retrieve intent from the result
         const piId = (result.paymentIntent as any)?.id;
         if (piId) {
           onSuccess(piId);
         }
         return;
       }
       setError(result.error.message ?? 'Paiement refusé');
       setLoading(false);
       return;
     }

     if (result.paymentIntent?.status === 'succeeded') {
       onSuccess(result.paymentIntent.id);
       return;
     }

     setLoading(false);
   };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} onReady={() => setReady(true)} />
      {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
      <Button type="submit" fullWidth disabled={!ready || loading}
        sx={{
          mt: 3, py: 1.5, borderRadius: 2, bgcolor: T.navy, color: T.white,
          fontWeight: 700, fontSize: 15, textTransform: 'none',
          '&:hover': { bgcolor: '#1A3F7A' },
          '&:disabled': { bgcolor: alpha(T.navy, 0.4), color: T.white },
        }}>
        {loading
          ? <CircularProgress size={20} sx={{ color: T.white }} />
          : <><Lock sx={{ fontSize: 16, mr: 1 }} />Payer {booking?.total_price} EUR</>}
      </Button>
      <Typography sx={{ textAlign: 'center', fontSize: 11, color: T.slate, mt: 1.5 }}>
        <Lock sx={{ fontSize: 10, mr: 0.5 }} /> Paiement sécurisé Stripe — données jamais stockées sur nos serveurs
      </Typography>
    </Box>
  );
};

// ── Checkout Page ────────────────────────────────────────
const CheckoutPage: React.FC = () => {
  const { bookingId }         = useParams<{ bookingId: string }>();
  const navigate              = useNavigate();
  const { token }             = useSelector((state: RootState) => state.auth);
  const [booking, setBooking] = useState<any>(null);
  const [clientSecret, setCS] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  // Loyalty
  const [offers, setOffers]                 = useState<any[]>([]);
  const [userPoints, setUserPoints]         = useState(0);
  const [selectedOffer, setSelectedOffer]   = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    let cancelled = false;
    (async () => {
      try {
        const bRes = await bookingAPI.get(Number(bookingId));
        if (cancelled) return;
        setBooking(bRes.data);

        // Charger les offres fidélité
        try {
          const tripId = bRes.data?.trip?.id;
          if (tripId) {
            const oRes = await loyaltyAPI.getOffers(tripId);
            if (!cancelled) {
              setOffers(oRes.data.offers || []);
              setUserPoints(oRes.data.available_points ?? 0);
            }
          }
        } catch (_) {}
      } catch (err: any) {
        if (cancelled) return;
        setError(err.response?.data?.error ?? 'Impossible de charger le paiement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId]);

  // Calculer la réduction quand on sélectionne une offre
  const handleSelectOffer = (offer: any) => {
    if (selectedOffer?.id === offer.id) {
      setSelectedOffer(null);
      setDiscountAmount(0);
      return;
    }
    setSelectedOffer(offer);
    const price = parseFloat(booking?.total_price || 0);
    const disc  = offer.discount_type === 'percentage_discount'
      ? price * (parseFloat(offer.discount_value) / 100)
      : Math.min(parseFloat(offer.discount_value), price);
    setDiscountAmount(Math.round(disc * 100) / 100);
  };

// ── Créer le PaymentIntent avec l'offre sélectionnée ──
  const handleInitPayment = async () => {
    setInitLoading(true);
    setError(null);
    try {
      const iRes = await paymentAPI.createIntent(Number(bookingId), {
        offer_id: selectedOffer?.id ?? null,
      });
      setCS(iRes.data.client_secret);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erreur lors de la création du paiement');
    } finally {
      setInitLoading(false);
    }
  };

  // ── Confirmer le paiement + appliquer l'offre fidélité ──
  const handlePaymentSuccess = async (piId: string) => {
    try {
      await paymentAPI.confirm(piId, selectedOffer?.id ?? null);
      setSuccess(true);
    } catch (err: any) {
      console.error('Confirm payment error:', err);
      setError(err.response?.data?.error ?? 'Erreur lors de la confirmation du paiement');
    }
  };

  const finalPrice = Math.max(0, parseFloat(booking?.total_price || 0) - discountAmount);

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
        <Typography sx={{ fontSize: 14, color: T.slate, mb: 1 }}>
          Réservation <strong>{booking?.trip?.title}</strong> confirmée.
        </Typography>
        {discountAmount > 0 && (
          <Typography sx={{ fontSize: 13, color: T.teal, fontWeight: 600, mb: 2 }}>
            <Celebration sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Vous avez économisé {discountAmount} EUR grâce à vos points fidélité !
          </Typography>
        )}
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

          {/* ── Left: paiement ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Section points fidélité — afficher si offers existent */}
            {offers.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <EmojiEvents sx={{ color: T.amber }} />
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
                      Offres fidélité disponibles
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: T.slate }}>
                      {userPoints > 0
                        ? `${userPoints} points disponibles chez cet organisateur`
                        : 'Réservez pour gagner des points et débloquer ces offres'}
                    </Typography>
                  </Box>
                </Box>

                {offers.length === 0 && (
                  <Typography sx={{ fontSize: 12, color: T.slate, fontStyle: 'italic' }}>
                    Aucune offre disponible pour ce voyage pour l'instant.
                  </Typography>
                )}

                {offers.map(offer => {
                  const selected  = selectedOffer?.id === offer.id;
                  const canUse    = offer.can_use;
                  return (
                    <Box key={offer.id}
                      onClick={() => canUse && handleSelectOffer(offer)}
                      sx={{
                        p: 2, mb: 1, borderRadius: 2,
                        cursor: canUse ? 'pointer' : 'not-allowed',
                        border: `1.5px solid ${selected ? T.teal : T.border}`,
                        bgcolor: selected ? alpha(T.teal, 0.06) : canUse ? T.white : alpha(T.slate, 0.04),
                        opacity: canUse ? 1 : 0.5,
                        transition: 'all 0.18s',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: selected ? T.teal : T.ink }}>
                          {offer.title}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: T.slate }}>
                          {offer.discount_type === 'percentage_discount'
                            ? `${offer.discount_value}% de réduction`
                            : `${offer.discount_value} EUR de réduction`}
                          {' · '}{offer.points_required} pts requis
                        </Typography>
                        {!canUse && (
                          <Typography sx={{ fontSize: 10, color: T.red, mt: 0.3 }}>
                            Il vous manque {offer.points_required - userPoints} points
                          </Typography>
                        )}
                      </Box>
                      {selected
                        ? <CheckCircleOutline sx={{ color: T.teal, fontSize: 20 }} />
                        : <Chip label={`-${offer.discount_value}${offer.discount_type === 'percentage_discount' ? '%' : '€'}`}
                            size="small"
                            sx={{ bgcolor: alpha(T.amber, 0.1), color: T.amber, fontWeight: 700, fontSize: 11 }} />
                      }
                    </Box>
                  );
                })}

                {selectedOffer && (
                  <Alert severity="success" sx={{ mt: 1, borderRadius: 2, fontSize: 12 }}>
                    Offre "<strong>{selectedOffer.title}</strong>" appliquée — économie de <strong>{discountAmount} EUR</strong>
                  </Alert>
                )}
              </Paper>
            )}

            {/* Section paiement Stripe */}
            <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <CreditCard sx={{ color: T.teal }} />
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: T.ink }}>Informations de paiement</Typography>
              </Box>

              {clientSecret && (
                <Elements stripe={stripePromise} options={{
                  clientSecret,
                  appearance: { theme: 'stripe', variables: { colorPrimary: T.teal, colorText: T.ink, borderRadius: '8px' } },
                }}>
                  <StripeForm booking={booking} onSuccess={handlePaymentSuccess} />
                </Elements>
              )}

              {!clientSecret && (
                <Button
                  fullWidth
                  onClick={handleInitPayment}
                  disabled={initLoading}
                  sx={{
                    py: 1.5, borderRadius: 2, bgcolor: T.navy, color: T.white,
                    fontWeight: 700, fontSize: 15, textTransform: 'none',
                    '&:hover': { bgcolor: '#1A3F7A' },
                    '&:disabled': { bgcolor: alpha(T.navy, 0.4), color: T.white },
                  }}>
                  {initLoading
                    ? <CircularProgress size={20} sx={{ color: T.white }} />
                    : <><Lock sx={{ fontSize: 16, mr: 1 }} />Payer {finalPrice.toFixed(2)} EUR</>
                  }
                </Button>
              )}

              <Typography sx={{ textAlign: 'center', fontSize: 11, color: T.slate, mt: 1.5 }}>
                <Lock sx={{ fontSize: 10, mr: 0.5 }} /> Paiement sécurisé Stripe — données jamais stockées sur nos serveurs
              </Typography>
            </Paper>
          </Box>

          {/* ── Right: résumé ── */}
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography sx={{ fontSize: 13, color: T.slate }}>Prix de base</Typography>
                <Typography sx={{ fontSize: 13, color: T.ink }}>{booking?.total_price} EUR</Typography>
              </Box>

              {discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography sx={{ fontSize: 13, color: T.teal }}>
                    <WorkspacePremium sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    Réduction fidélité
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.teal }}>-{discountAmount} EUR</Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Total</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 800, color: T.teal }}>{finalPrice.toFixed(2)} EUR</Typography>
              </Box>

              {userPoints > 0 && !selectedOffer && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(T.amber, 0.07) }}>
                  <Typography sx={{ fontSize: 11, color: T.amber, fontWeight: 600 }}>
                    <Star sx={{ fontSize: 11, mr: 0.5, verticalAlign: 'middle' }} />
                    Ce paiement vous rapportera ~{Math.floor(finalPrice * 0.1)} points fidélité chez cet organisateur
                  </Typography>
                </Box>
              )}
              {selectedOffer && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(T.slate, 0.06) }}>
                  <Typography sx={{ fontSize: 11, color: T.slate, fontWeight: 600 }}>
                    <EmojiEvents sx={{ fontSize: 11, mr: 0.5, verticalAlign: 'middle' }} />
                    Points non cumulables avec une offre fidélité
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CheckoutPage;