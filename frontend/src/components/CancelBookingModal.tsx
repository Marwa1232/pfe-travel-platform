import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, CircularProgress, Alert,
  LinearProgress, Stack // <--- Ajoute Stack ici
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Warning, CheckCircle, Info, CreditCard,
  ConfirmationNumber, EventRepeat,
} from '@mui/icons-material';
import api, { paymentAPI } from '../services/api';

// --- PALETTE LUNA (Mise à jour) ---
const LUNA = {
  PALE: '#A7EBF2',   // Accents clairs
  MED: '#26658C',    // Intermédiaire
  DEEP: '#023859',   // Profond
  NIGHT: '#011C40',  // Sombre
  ERROR: '#FF5252',  // Rouge alerte Luna
  SUCCESS: '#00BFA5',// Teal de confirmation
  TEXT_SUBTLE: '#94A3B8'
};

interface CancelOptions {
  refundAmount: number;
  refundPercent: number;
  options: string[];
  daysBefore: number;
  totalPrice: number;
  allowVoucher: boolean;
  allowRebooking: boolean;
}

interface Props {
  open: boolean;
  bookingId: number | null;
  hasPaidStripe: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

// Logique de couleur adaptée à la palette Luna
const getLunaPolicyColor = (pct: number) => {
  if (pct === 100) return LUNA.SUCCESS;
  if (pct >= 50) return LUNA.PALE;
  return LUNA.ERROR;
};

const CancelBookingModal: React.FC<Props> = ({
  open, bookingId, hasPaidStripe, onClose, onCancelled,
}) => {
  const [options, setOptions] = useState<CancelOptions | null>(null);
  const [choice, setChoice] = useState<string>('refund');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
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
      setError(e.response?.data?.error ?? "Erreur lors de l'annulation");
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
      icon: <CreditCard sx={{ fontSize: 20 }} />,
      label: 'Remboursement',
      desc: hasPaidStripe ? 'Sur votre carte (5-10j)' : 'Paiement non en ligne',
      show: true,
    },
    {
      value: 'voucher',
      icon: <ConfirmationNumber sx={{ fontSize: 20 }} />,
      label: 'Bon d’achat',
      desc: 'Valable 1 an sur tout le catalogue',
      show: options?.allowVoucher ?? false,
    },
    {
      value: 'rebooking',
      icon: <EventRepeat sx={{ fontSize: 20 }} />,
      label: 'Reporter',
      desc: 'Changer de date sans frais supplémentaires',
      show: options?.allowRebooking ?? false,
    },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 4, 
          bgcolor: '#FFFFFF',
          backgroundImage: `linear-gradient(to bottom, ${alpha(LUNA.PALE, 0.05)}, #FFFFFF)`,
          boxShadow: '0 25px 50px -12px rgba(1, 28, 64, 0.25)' 
        } 
      }}
    >
      {done ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ 
            width: 70, height: 70, borderRadius: '50%', bgcolor: alpha(LUNA.SUCCESS, 0.1),
            mx: 'auto', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <CheckCircle sx={{ fontSize: 40, color: LUNA.SUCCESS }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: LUNA.NIGHT, mb: 1 }}>
            Action confirmée
          </Typography>
          <Typography sx={{ fontSize: 14, color: LUNA.DEEP, mb: 4, lineHeight: 1.6 }}>
            {choice === 'refund' 
              ? `Remboursement de ${refundDone?.toFixed(2)} EUR initié avec succès.` 
              : "L'annulation a été enregistrée selon votre choix."}
          </Typography>
          <Button 
            fullWidth 
            onClick={handleClose} 
            variant="contained"
            sx={{ 
              borderRadius: 3, py: 1.5, textTransform: 'none', 
              bgcolor: LUNA.NIGHT, fontWeight: 700,
              '&:hover': { bgcolor: LUNA.DEEP } 
            }}
          >
            Fermer l'espace
          </Button>
        </Box>
      ) : (
        <>
          <DialogTitle sx={{ fontWeight: 800, color: LUNA.NIGHT, pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Warning sx={{ color: LUNA.MED, fontSize: 24 }} />
              Annulation
            </Box>
          </DialogTitle>

          <DialogContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={40} thickness={5} sx={{ color: LUNA.MED }} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: 3, bgcolor: alpha(LUNA.ERROR, 0.05), color: LUNA.ERROR }}>
                {error}
              </Alert>
            ) : options && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                {/* Résumé du remboursement */}
                <Box sx={{ 
                  p: 2.5, borderRadius: 3, 
                  bgcolor: alpha(getLunaPolicyColor(options.refundPercent), 0.04),
                  border: `1px solid ${alpha(getLunaPolicyColor(options.refundPercent), 0.15)}`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: LUNA.TEXT_SUBTLE, textTransform: 'uppercase' }}>
                        À rembourser
                      </Typography>
                      <Typography sx={{ fontSize: 24, fontWeight: 900, color: getLunaPolicyColor(options.refundPercent) }}>
                        {options.refundAmount.toFixed(2)}€
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: LUNA.TEXT_SUBTLE, textTransform: 'uppercase' }}>
                        Taux
                      </Typography>
                      <Typography sx={{ fontSize: 20, fontWeight: 700, color: LUNA.NIGHT }}>
                        {options.refundPercent}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={options.refundPercent}
                    sx={{ 
                      height: 8, borderRadius: 4, bgcolor: alpha(LUNA.PALE, 0.2),
                      '& .MuiLinearProgress-bar': { bgcolor: getLunaPolicyColor(options.refundPercent) } 
                    }} 
                  />
                </Box>

                {/* Sélecteur d'options stylisé Luna */}
                {CHOICE_CONFIG.filter(c => c.show).length > 1 && (
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: LUNA.TEXT_SUBTLE, mb: 1.5, ml: 0.5, letterSpacing: 1.2 }}>
                      MODE DE COMPENSATION
                    </Typography>
                    <Stack spacing={1.5}>
                      {CHOICE_CONFIG.filter(c => c.show).map(c => (
                        <Box 
                          key={c.value} 
                          onClick={() => setChoice(c.value)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 2, p: 2,
                            borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: `2px solid ${choice === c.value ? LUNA.MED : alpha(LUNA.PALE, 0.3)}`,
                            bgcolor: choice === c.value ? alpha(LUNA.MED, 0.05) : 'transparent',
                            '&:hover': { bgcolor: alpha(LUNA.PALE, 0.1) }
                          }}
                        >
                          <Box sx={{ 
                            color: choice === c.value ? LUNA.MED : LUNA.TEXT_SUBTLE,
                            display: 'flex', p: 1, borderRadius: 2, bgcolor: choice === c.value ? alpha(LUNA.MED, 0.1) : 'transparent'
                          }}>
                            {c.icon}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: LUNA.NIGHT }}>
                              {c.label}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: LUNA.TEXT_SUBTLE }}>
                              {c.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
            <Button 
              onClick={handleClose} 
              sx={{ color: LUNA.TEXT_SUBTLE, fontWeight: 700, textTransform: 'none' }}
            >
              Ignorer
            </Button>
            <Button 
              onClick={handleConfirm} 
              variant="contained"
              disabled={loading || processing || !options}
              sx={{ 
                borderRadius: 3, px: 3, py: 1.2, textTransform: 'none', fontWeight: 800,
                bgcolor: LUNA.ERROR, boxShadow: `0 8px 20px ${alpha(LUNA.ERROR, 0.3)}`,
                '&:hover': { bgcolor: '#D32F2F', boxShadow: 'none' },
                '&:disabled': { bgcolor: alpha(LUNA.ERROR, 0.3) } 
              }}
            >
              {processing ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmer l\'annulation'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default CancelBookingModal;