import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { bookingAPI } from '../services/api';

interface BookingFormProps {
  trip: any;
  sessions: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  trip,
  sessions,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    trip_session_id: sessions[0]?.id || '',
    num_travelers: 1,
    payment_method: 'CASH',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(trip.base_price);
    const travelers = parseInt(formData.num_travelers.toString());
    return (basePrice * travelers).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.trip_session_id) {
      setError('Veuillez sélectionner une date de départ');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        trip_id: trip.id,
        trip_session_id: parseInt(formData.trip_session_id.toString()),
        num_travelers: parseInt(formData.num_travelers.toString()),
        payment_method: formData.payment_method,
      };

      await bookingAPI.create(bookingData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const selectedSession = sessions.find((s) => s.id === parseInt(formData.trip_session_id.toString()));

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Réserver ce voyage
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          select
          label="Date de départ"
          name="trip_session_id"
          value={formData.trip_session_id}
          onChange={handleChange}
          required
          margin="normal"
        >
          {sessions.map((session) => (
            <MenuItem key={session.id} value={session.id}>
              {new Date(session.start_date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' - '}
              {session.max_capacity || 0} places
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Nombre de voyageurs"
          name="num_travelers"
          type="number"
          value={formData.num_travelers}
          onChange={handleChange}
          required
          inputProps={{ min: 1, max: selectedSession?.max_capacity || 10 }}
          margin="normal"
        />

        <TextField
          fullWidth
          select
          label="Méthode de paiement"
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          required
          margin="normal"
        >
          <MenuItem value="CASH">Espèces</MenuItem>
          <MenuItem value="BANK_TRANSFER">Virement bancaire</MenuItem>
          <MenuItem value="CARD_SIMULATED">Carte (simulé)</MenuItem>
        </TextField>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Prix unitaire: {trip.base_price} {trip.currency}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            Total: {calculateTotal()} {trip.currency}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirmer la réservation'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default BookingForm;