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
  IconButton,
  Stack,
} from '@mui/material';
import { Delete, PictureAsPdf } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
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

  const handleDelete = async (bookingId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation?')) {
      return;
    }
    try {
      await api.delete(`/bookings/${bookingId}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
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
      PENDING: 'En attente',
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
              <MenuItem value="PENDING">En attente</MenuItem>
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
    </Container>
  );
};

export default OrganizerBookings;