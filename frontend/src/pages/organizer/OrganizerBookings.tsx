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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Delete, PictureAsPdf } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { jsPDF } from 'jspdf';
import api from '../../services/api';

// Couleurs et gradient du thème
const primaryColor = '#00BFA5';
const secondaryColor = '#0D47A1';
const primaryGradient = 'linear-gradient(90deg, #00BFA5, #0D47A1)';

// Style du tableau
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: `1px solid ${alpha(primaryColor, 0.1)}`,
  overflow: 'hidden',
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: alpha(primaryColor, 0.02),
    fontWeight: 700,
    color: secondaryColor,
    borderBottom: `2px solid ${alpha(primaryColor, 0.2)}`,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: alpha(primaryColor, 0.02),
  },
}));

// Style du Paper pour les filtres
const FiltersPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(primaryColor, 0.1)}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
}));

const OrganizerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    trip_id: '',
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; bookingId: number | null }>({
    open: false,
    bookingId: null,
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

  const handleDelete = async () => {
    if (!deleteDialog.bookingId) return;
    try {
      await api.delete(`/bookings/${deleteDialog.bookingId}`);
      setDeleteDialog({ open: false, bookingId: null });
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleExportPdf = (booking: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header - Utiliser la couleur primaire pour l'en-tête
    doc.setFillColor(0, 191, 165); // #00BFA5
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

  // Style personnalisé pour les chips de statut (optionnel, car Chip avec color gère déjà)
  // On peut ajouter des styles supplémentaires si besoin

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: secondaryColor, mb: 3 }}>
        Réservations
      </Typography>

      {/* Filters */}
      <FiltersPaper elevation={0}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Statut"
              sx={{
                borderRadius: 2,
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: primaryColor,
                },
              }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="CONFIRMED">Confirmées</MenuItem>
              <MenuItem value="PENDING">En attente</MenuItem>
              <MenuItem value="CANCELLED">Annulées</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </FiltersPaper>

      {loading ? (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <CircularProgress sx={{ color: primaryColor }} />
        </Box>
      ) : (
        <>
          {bookings.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                borderLeft: `4px solid ${primaryColor}`,
                backgroundColor: alpha(primaryColor, 0.02),
              }}
            >
              Aucune réservation trouvée.
            </Alert>
          ) : (
            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Voyage</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Date départ</TableCell>
                    <TableCell>Voyageurs</TableCell>
                    <TableCell>Prix total</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600} sx={{ color: secondaryColor }}>
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
                        <Typography variant="body1" fontWeight={600} color="primary">
                          {booking.total_price} {booking.currency}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(booking.status)}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor: getStatusColor(booking.status) === 'success' 
                              ? alpha('#00BFA5', 0.1) 
                              : undefined,
                            color: getStatusColor(booking.status) === 'success' 
                              ? '#00BFA5' 
                              : undefined,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton 
                            onClick={() => handleExportPdf(booking)}
                            title="Exporter PDF"
                            sx={{ color: primaryColor, '&:hover': { backgroundColor: alpha(primaryColor, 0.1) } }}
                          >
                            <PictureAsPdf />
                          </IconButton>
                          <IconButton 
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, bookingId: booking.id })}
                            title="Supprimer"
                            sx={{ '&:hover': { backgroundColor: alpha('#FF6B6B', 0.1) } }}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, bookingId: null })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: secondaryColor }}>
          Supprimer la réservation
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette réservation ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, bookingId: null })}
            variant="outlined"
            sx={{
              borderColor: alpha(primaryColor, 0.5),
              color: primaryColor,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                borderColor: primaryColor,
                backgroundColor: alpha(primaryColor, 0.04),
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#D32F2F',
              },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizerBookings;