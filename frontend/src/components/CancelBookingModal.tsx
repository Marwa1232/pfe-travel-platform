import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, CircularProgress, Alert,
  Chip, LinearProgress, Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Warning, CheckCircle, Info, CreditCard,
  ConfirmationNumber, EventRepeat,
} from '@mui/icons-material';
import api, { paymentAPI } from '../services/api';

const T = {
  teal: '#0EA5A0', navy: '#0F2D5C', slate: '#64748B',
  ink: '#0F172A', border: '#E2E8F0', white: '#FFFFFF',
  green: '#16A34A', amber: '#D97706', red: '#DC2626',
};

interface CancelOptions {
  refundAmount:   number;
  refundPercent:  number;
  options:        string[];
  daysBefore:     number;
  totalPrice:     number;
  allowVoucher:   boolean;
  allowRebooking: boolean;
}

interface Props {
  open:        boolean;
  bookingId:   number | null;
  hasPaidStripe: boolean;
  onClose:     () => void;
  onCancelled: () => void;
}

const policyColor = (pct: number) => {
  if (pct === 100) return T.green;
  if (pct >= 50)   return T.amber;
  if (pct > 0)     return '#EA580C';
  return T.red;
};

const CancelBookingModal: React.FC<Props> = ({
  open, bookingId, hasPaidStripe, onClose, onCancelled,
}) => {
  const [options,    setOptions]    = useState<CancelOptions | null>(null);
  const [choice,     setChoice]     = useState<string>('refund');
  const [loading,    setLoading]    = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [done,       setDone]       = useState(false);
  const [refundDone, setRefundDone] = useState<number | null>(null);

  useEffect(() => {
    if (open && bookingId) {
      setDone(false);
      setError(null);
      setChoice('refund');
      loadOptions();
    }
  }, [open, bookingId]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${bookingId}/cancel-options`);
      setOptions(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Impossible de charger les options');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!bookingId || !options) return;
    try {
      setProcessing(true);
      setError(null);

      await api.post(`/bookings/${bookingId}/cancel`, { choice });

      if (hasPaidStripe && choice === 'refund') {
        const refRes = await paymentAPI.refund(bookingId!);
        setRefundDone(refRes.data.refund_amount ?? 0);
      }

      setDone(true);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Erreur lors de l\'annulation');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (done) onCancelled();
    onClose();
    setOptions(null);
    setDone(false);
    setRefundDone(null);
  };

  const CHOICE_CONFIG = [
    {
      value: 'refund',
      icon:  <CreditCard sx={{ fontSize: 18 }} />,
      label: 'Remboursement',
      desc:  hasPaidStripe ? 'Sur votre carte — 5 à 10 jours ouvrables' : 'Pas de paiement en ligne',
      show:  true,
    },
    {
      value: 'voucher',
      icon:  <ConfirmationNumber sx={{ fontSize: 18 }} />,
      label: 'Voucher',
      desc:  'Bon valable 1 an sur tous nos voyages',
      show:  options?.allowVoucher ?? false,
    },
    {
      value: 'rebooking',
      icon:  <EventRepeat sx={{ fontSize: 18 }} />,
      label: 'Rebooking',
      desc:  'Reporter sur une autre date sans frais',
      show:  options?.allowRebooking ?? false,
    },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${T.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } }}>

      {done ? (
        <>
          <DialogContent sx={{ textAlign: 'center', py: 5 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(T.green, 0.1),
              mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle sx={{ fontSize: 30, color: T.green }} />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: T.ink, mb: 1 }}>
              Réservation annulée
            </Typography>
            {choice === 'refund' && refundDone !== null && refundDone > 0 && (
              <Typography sx={{ fontSize: 13, color: T.slate }}>
                Remboursement de <strong>{refundDone.toFixed(2)} EUR</strong> initié.<br />
                Délai: 5–10 jours ouvrables.
              </Typography>
            )}
            {choice === 'voucher' && (
              <Typography sx={{ fontSize: 13, color: T.slate }}>
                Votre voucher vous sera envoyé par email sous 24h.
              </Typography>
            )}
            {choice === 'rebooking' && (
              <Typography sx={{ fontSize: 13, color: T.slate }}>
                Vous pouvez rebooker gratuitement depuis votre espace réservations.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button fullWidth onClick={handleClose} variant="contained"
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: T.navy, fontWeight: 600,
                '&:hover': { bgcolor: '#0D2550' } }}>
              Fermer
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle sx={{ fontWeight: 700, color: T.ink, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning sx={{ color: T.amber, fontSize: 20 }} />
              Annuler la réservation
            </Box>
          </DialogTitle>

          <DialogContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} sx={{ color: T.teal }} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : options && (
              <>
                <Box sx={{ p: 2, borderRadius: 2, mb: 2,
                  bgcolor: alpha(policyColor(options.refundPercent), 0.05),
                  border: `1px solid ${alpha(policyColor(options.refundPercent), 0.2)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography sx={{ fontSize: 12, color: T.slate }}>Montant total</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                      {options.totalPrice.toFixed(2)} EUR
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: 12, color: T.slate }}>Remboursable</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: policyColor(options.refundPercent) }}>
                      {options.refundAmount.toFixed(2)} EUR
                      <Typography component="span" sx={{ fontSize: 11, color: T.slate, ml: 0.5 }}>
                        ({options.refundPercent}%)
                      </Typography>
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={options.refundPercent}
                    sx={{ height: 4, borderRadius: 2, bgcolor: alpha(policyColor(options.refundPercent), 0.12),
                      '& .MuiLinearProgress-bar': { bgcolor: policyColor(options.refundPercent), borderRadius: 2 } }} />
                  <Typography sx={{ fontSize: 11, color: T.slate, mt: 0.8 }}>
                    {options.daysBefore > 0
                      ? `${options.daysBefore} jours avant le départ`
                      : 'Départ déjà passé ou aujourd\'hui'}
                  </Typography>
                </Box>

                {CHOICE_CONFIG.filter(c => c.show).length > 1 && (
                  <>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.slate, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Choisissez une option
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      {CHOICE_CONFIG.filter(c => c.show).map(c => (
                        <Box key={c.value} onClick={() => setChoice(c.value)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, p: '10px 12px',
                            borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                            border: `1.5px solid ${choice === c.value ? T.teal : T.border}`,
                            bgcolor: choice === c.value ? alpha(T.teal, 0.04) : 'transparent',
                          }}>
                          <Box sx={{ color: choice === c.value ? T.teal : T.slate }}>{c.icon}</Box>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: choice === c.value ? T.teal : T.ink }}>
                              {c.label}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: T.slate }}>{c.desc}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}

                {options.refundPercent < 100 && choice === 'refund' && (
                  <Alert severity="warning" icon={<Info fontSize="small" />} sx={{ fontSize: 12, borderRadius: 2 }}>
                    {(options.totalPrice - options.refundAmount).toFixed(2)} EUR ne seront pas remboursés (politique d'annulation).
                  </Alert>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={handleClose} variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(T.slate, 0.3), color: T.slate }}>
              Retour
            </Button>
            <Button onClick={handleConfirm} variant="contained"
              disabled={loading || processing || !options}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700,
                bgcolor: T.red, '&:hover': { bgcolor: '#B91C1C' },
                '&:disabled': { bgcolor: alpha(T.red, 0.4) } }}>
              {processing
                ? <CircularProgress size={16} sx={{ color: T.white }} />
                : choice === 'refund' ? 'Annuler & Rembourser' : `Annuler (${CHOICE_CONFIG.find(c=>c.value===choice)?.label})`}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default CancelBookingModal;