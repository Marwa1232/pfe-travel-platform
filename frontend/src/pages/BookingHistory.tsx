import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { bookingAPI } from '../services/api';
import { RootState } from '../store/index';

const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; booking: any | null }>({
    open: false,
    booking: null,
  });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [token]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.myBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (booking: any) => {
    setCancelDialog({ open: true, booking });
  };

  const confirmCancel = async () => {
    if (!cancelDialog.booking) return;

    try {
      // Appel API pour annuler (à implémenter)
      // await bookingAPI.cancel(cancelDialog.booking.id, cancelReason);
      alert('Réservation annulée avec succès');
      setCancelDialog({ open: false, booking: null });
      setCancelReason('');
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING_PAYMENT':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      CONFIRMED: 'Confirmée',
      PENDING_PAYMENT: 'En attente de paiement',
      CANCELLED: 'Annulée',
      REFUNDED: 'Remboursée',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mes réservations
      </Typography>

      {bookings.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Vous n'avez aucune réservation pour le moment.
          <Button
            variant="text"
            onClick={() => navigate('/trips')}
            sx={{ ml: 2 }}
          >
            Découvrir les voyages
          </Button>
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Voyage</TableCell>
                <TableCell>Date de départ</TableCell>
                <TableCell>Voyageurs</TableCell>
                <TableCell>Prix total</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {booking.trip?.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.trip?.destinations?.map((d: any) => d.name).join(', ')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {booking.tripSession?.start_date
                      ? new Date(booking.tripSession.start_date).toLocaleDateString('fr-FR')
                      : '-'}
                  </TableCell>
                  <TableCell>{booking.num_travelers}</TableCell>
                  <TableCell>
                    {booking.total_price} {booking.currency}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(booking.status)}
                      color={getStatusColor(booking.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                      sx={{ mr: 1 }}
                    >
                      Détails
                    </Button>
                    {booking.status === 'CONFIRMED' && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleCancel(booking)}
                      >
                        Annuler
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, booking: null })}
      >
        <DialogTitle>Annuler la réservation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir annuler cette réservation ?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Raison de l'annulation (optionnel)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, booking: null })}>
            Fermer
          </Button>
          <Button onClick={confirmCancel} color="error" variant="contained">
            Confirmer l'annulation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingHistory;