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
  IconButton,
  Stack,
} from '@mui/material';
import { Delete, PictureAsPdf } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
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

  const handleDelete = async (bookingId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation?')) {
      return;
    }
    try {
      await bookingAPI.delete(bookingId);
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleExportPdf = (booking: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header - Blue background
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSERVATION', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`#${booking.id}`, pageWidth / 2, 32, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    let y = 55;
    
    // Trip Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations du voyage', 15, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Voyage: ${booking.trip?.title || '-'}`, 15, y);
    y += 7;
    doc.text(`Destinations: ${booking.trip?.destinations?.map((d: any) => d.name).join(', ') || '-'}`, 15, y);
    y += 15;
    
    // Client Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations du client', 15, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const clientName = booking.user ? `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim() : '-';
    doc.text(`Nom: ${clientName}`, 15, y);
    y += 7;
    doc.text(`Email: ${booking.user?.email || '-'}`, 15, y);
    y += 15;
    
    // Booking Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails de la réservation', 15, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const startDate = booking.tripSession?.start_date 
      ? new Date(booking.tripSession.start_date).toLocaleDateString('fr-FR')
      : '-';
    doc.text(`Date de départ: ${startDate}`, 15, y);
    y += 7;
    doc.text(`Nombre de voyageurs: ${booking.num_travelers}`, 15, y);
    y += 15;
    
    // Price - Highlighted
    doc.setFillColor(236, 240, 241);
    doc.rect(15, y - 5, pageWidth - 30, 20, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Prix total: ${booking.total_price} ${booking.currency}`, 20, y + 5);
    y += 20;
    
    // Status
    const statusColors: { [key: string]: number[] } = {
      CONFIRMED: [39, 174, 96],
      PENDING: [241, 196, 15],
      CANCELLED: [231, 76, 60],
    };
    const statusColor = statusColors[booking.status] || [128, 128, 128];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(15, y, 60, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(getStatusLabel(booking.status), 20, y + 7);
    
    // Footer
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(9);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} - TripBooking`, pageWidth / 2, 280, { align: 'center' });
    
    // Save PDF
    doc.save(`reservation_${booking.id}.pdf`);
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
      case 'PENDING':
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
      PENDING: 'En attente de confirmation',
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
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleExportPdf(booking)}
                        title="Exporter PDF"
                      >
                        <PictureAsPdf />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(booking.id)}
                        title="Supprimer"
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
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