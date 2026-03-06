import React, { useState, useEffect } from 'react';
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import api from '../../services/api';

const OrganizerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    trip_id: '',
    status: '',
  });

  useEffect(() => {
    loadBookings();
  }, [filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organizer/bookings', { params: filters });
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      await api.put(`/organizer/bookings/${bookingId}/status`, { status: newStatus });
      loadBookings();
    } catch (error) {
      console.error('Error updating status:', error);
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
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      CONFIRMED: 'Confirmée',
      PENDING_PAYMENT: 'En attente',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Réservations
      </Typography>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Statut"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="CONFIRMED">Confirmées</MenuItem>
              <MenuItem value="PENDING_PAYMENT">En attente</MenuItem>
              <MenuItem value="CANCELLED">Annulées</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Voyage</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date départ</TableCell>
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
                    <Typography variant="body1" fontWeight="bold">
                      {booking.trip?.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {booking.user?.first_name} {booking.user?.last_name}
                    <br />
                    <Typography variant="body2" color="text.secondary">
                      {booking.user?.email}
                    </Typography>
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
                    {booking.status === 'PENDING_PAYMENT' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                      >
                        Confirmer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrganizerBookings;