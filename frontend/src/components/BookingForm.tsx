import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, MenuItem,
  Alert, CircularProgress, Paper, Divider, Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarMonth, People, CreditCard, FlightTakeoff,
} from '@mui/icons-material';
import { bookingAPI } from '../services/api';

const T = {
  teal: '#0EA5A0', navy: '#0F2D5C', slate: '#64748B',
  ink: '#0F172A', paper: '#F8FAFC', white: '#FFFFFF',
  border: '#E2E8F0', green: '#16A34A',
};

interface BookingFormProps {
  trip: any;
  sessions: any[];
  selectedSession?: any;
  participantCount?: number;
  onSuccess: (bookingId?: number, paymentMethod?: string) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  trip, sessions, selectedSession, participantCount = 1, onSuccess, onCancel,
}) => {
  const [formData, setFormData] = useState({
    trip_session_id: selectedSession?.id || sessions[0]?.id || '',
    num_travelers:   participantCount,
    payment_method: 'CASH',
    
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const total = () => {
    const base = parseFloat(trip.base_price);
    const num  = parseInt(formData.num_travelers.toString());
    return (base * num).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.trip_session_id) { setError('Veuillez sélectionner une date de départ'); return; }
    try {
      setLoading(true);
      const res = await bookingAPI.create({
        trip_id:         trip.id,
        trip_session_id: parseInt(formData.trip_session_id.toString()),
        num_travelers:   parseInt(formData.num_travelers.toString()),
        payment_method:  formData.payment_method,
      });
      onSuccess(res.data.id, formData.payment_method);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const foundSession = sessions.find(s => s.id === parseInt(formData.trip_session_id.toString()));

  return (
    <Paper elevation={0} sx={{
      borderRadius: 3, border: `1px solid ${T.border}`,
      overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${T.navy} 0%, #1a4a8a 100%)`,
        p: 3, display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '12px',
          bgcolor: 'rgba(255,255,255,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center' }}>
          <FlightTakeoff sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>
            Réserver ce voyage
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            {trip.title}
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>
        )}

        {/* Date */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarMonth sx={{ fontSize: 16, color: T.teal }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
              Date de départ
            </Typography>
          </Box>
          <TextField fullWidth select name="trip_session_id"
            value={formData.trip_session_id} onChange={handleChange} required
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: T.teal } },
            }}>
            {sessions.map(s => (
              <MenuItem key={s.id} value={s.id}>
                {new Date(s.start_date).toLocaleDateString('fr-FR', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })} — {s.max_capacity || 0} places
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Voyageurs */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <People sx={{ fontSize: 16, color: T.teal }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
              Nombre de voyageurs
            </Typography>
          </Box>
          <TextField fullWidth name="num_travelers" type="number"
            value={formData.num_travelers} onChange={handleChange} required size="small"
            inputProps={{ min: 1, max: foundSession?.max_capacity || 10 }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: T.teal } },
            }} />
        </Box>

        {/* Paiement */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CreditCard sx={{ fontSize: 16, color: T.teal }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
              Méthode de paiement
            </Typography>
          </Box>
          <TextField fullWidth select name="payment_method"
            value={formData.payment_method} onChange={handleChange} required size="small"
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: T.teal } },
            }}>
           <MenuItem value="CARD_SIMULATED">Carte bancaire</MenuItem>
            <MenuItem value="CASH">Espèces</MenuItem>
            <MenuItem value="BANK_TRANSFER">Virement bancaire</MenuItem>
           </TextField>
        </Box>

        {/* Total */}
        <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(T.teal, 0.05),
          border: `1px solid ${alpha(T.teal, 0.2)}`, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: T.slate }}>Prix par personne</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
              {trip.base_price} {trip.currency}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: T.slate }}>Voyageurs</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
              × {formData.num_travelers}
            </Typography>
          </Box>
          <Divider sx={{ my: 1.5, borderColor: alpha(T.teal, 0.2) }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Total</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: T.teal }}>
              {total()} {trip.currency}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button fullWidth variant="outlined" onClick={onCancel} disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              borderColor: T.border, color: T.slate,
              '&:hover': { borderColor: T.slate } }}>
            Annuler
          </Button>
          <Button fullWidth type="submit" variant="contained" disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700,
              background: `linear-gradient(135deg, ${T.teal}, ${T.navy})`,
              '&:hover': { opacity: 0.92 },
              '&:disabled': { opacity: 0.5 } }}>
            {loading
              ? <CircularProgress size={18} sx={{ color: '#fff' }} />
              : 'Confirmer la réservation'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default BookingForm;