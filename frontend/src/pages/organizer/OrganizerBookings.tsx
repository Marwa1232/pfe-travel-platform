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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Delete,
  PictureAsPdf,
  Search,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  FilterList,
  FlightTakeoff,
  Receipt,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { jsPDF } from 'jspdf';
import api from '../../services/api';

const PRIMARY = '#00BFA5';
const SECONDARY = '#0D47A1';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: `1px solid ${alpha(PRIMARY, 0.12)}`,
  overflow: 'hidden',
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: '#f8fafc',
    fontWeight: 700,
    color: SECONDARY,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: `2px solid ${alpha(PRIMARY, 0.15)}`,
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'background 0.15s',
    '&:hover': { backgroundColor: alpha(PRIMARY, 0.025) },
    '&:last-child td': { borderBottom: 0 },
  },
}));

const FiltersPaper = styled(Paper)({
  padding: 16,
  marginBottom: 20,
  borderRadius: 16,
  border: `1px solid ${alpha(PRIMARY, 0.12)}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
});

const getStatusMeta = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    CONFIRMED: { label: 'Confirmée', color: PRIMARY, bg: alpha(PRIMARY, 0.1), icon: <CheckCircle sx={{ fontSize: 12 }} /> },
    PENDING:   { label: 'En attente', color: '#FF9800', bg: alpha('#FF9800', 0.1), icon: <HourglassEmpty sx={{ fontSize: 12 }} /> },
    CANCELLED: { label: 'Annulée', color: '#F44336', bg: alpha('#F44336', 0.1), icon: <Cancel sx={{ fontSize: 12 }} /> },
  };
  return map[status] || { label: status, color: '#999', bg: '#f5f5f5', icon: null };
};

const StatusChip = ({ status }: { status: string }) => {
  const meta = getStatusMeta(status);
  return (
    <Chip
      size="small"
      icon={meta.icon as any}
      label={meta.label}
      sx={{
        bgcolor: meta.bg,
        color: meta.color,
        fontWeight: 700,
        fontSize: 11,
        height: 24,
        '& .MuiChip-icon': { color: meta.color },
      }}
    />
  );
};

const ROWS_PER_PAGE = 8;

const OrganizerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
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
    doc.setFillColor(0, 191, 165);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSERVATION', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`#${booking.id}`, pageWidth / 2, 32, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    let y = 55;
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Informations du voyage', 15, y); y += 10;
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text(`Voyage: ${booking.trip?.title || '-'}`, 15, y); y += 7;
    doc.text(`Destinations: ${booking.trip?.destinations?.map((d: any) => d.name).join(', ') || '-'}`, 15, y); y += 15;
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Client', 15, y); y += 10;
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    const clientName = booking.user ? `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim() : '-';
    doc.text(`Nom: ${clientName}`, 15, y); y += 7;
    doc.text(`Email: ${booking.user?.email || '-'}`, 15, y); y += 15;
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Détails', 15, y); y += 10;
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    const startDate = booking.tripSession?.start_date
      ? new Date(booking.tripSession.start_date).toLocaleDateString('fr-FR') : '-';
    doc.text(`Date départ: ${startDate}`, 15, y); y += 7;
    doc.text(`Voyageurs: ${booking.num_travelers}`, 15, y); y += 15;
    doc.setFillColor(236, 240, 241);
    doc.rect(15, y - 5, pageWidth - 30, 20, 'F');
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(`Prix total: ${booking.total_price} ${booking.currency}`, 20, y + 5);
    doc.setTextColor(128, 128, 128); doc.setFontSize(9);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} - TripBooking`, pageWidth / 2, 280, { align: 'center' });
    doc.save(`reservation_${booking.id}.pdf`);
  };

  // Filtrage local par recherche
  const filtered = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.trip?.title?.toLowerCase().includes(q) ||
      b.user?.first_name?.toLowerCase().includes(q) ||
      b.user?.last_name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Summary counts
  const counts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: SECONDARY }}>
            Réservations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez toutes les réservations de vos voyages
          </Typography>
        </Box>
      </Box>

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Toutes', count: counts.all, color: SECONDARY, bg: alpha(SECONDARY, 0.08) },
          { label: 'Confirmées', count: counts.confirmed, color: PRIMARY, bg: alpha(PRIMARY, 0.1) },
          { label: 'En attente', count: counts.pending, color: '#FF9800', bg: alpha('#FF9800', 0.1) },
          { label: 'Annulées', count: counts.cancelled, color: '#F44336', bg: alpha('#F44336', 0.1) },
        ].map(item => (
          <Box key={item.label} sx={{
            px: 2, py: 0.8, borderRadius: 3,
            bgcolor: item.bg, cursor: 'default',
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: item.color }}>{item.count}</Typography>
            <Typography variant="body2" sx={{ color: item.color }}>{item.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Filters */}
      <FiltersPaper elevation={0}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Rechercher par voyage, client..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            size="small"
            sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#bbb', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status}
              onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              label="Statut"
              sx={{ borderRadius: 2 }}
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
        <Box textAlign="center" sx={{ mt: 6 }}>
          <CircularProgress sx={{ color: PRIMARY }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Alert
          severity="info"
          icon={<Receipt />}
          sx={{ borderRadius: 3, borderLeft: `4px solid ${PRIMARY}`, bgcolor: alpha(PRIMARY, 0.03) }}
        >
          Aucune réservation trouvée.
        </Alert>
      ) : (
        <>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
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
                {paginated.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        #{booking.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 34, height: 34, borderRadius: 1.5,
                          bgcolor: alpha(PRIMARY, 0.1),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FlightTakeoff sx={{ fontSize: 16, color: PRIMARY }} />
                        </Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: SECONDARY }}>
                          {booking.trip?.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: SECONDARY, fontSize: 11 }}>
                          {booking.user?.first_name?.[0]}{booking.user?.last_name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {booking.user?.first_name} {booking.user?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {booking.tripSession?.start_date
                          ? new Date(booking.tripSession.start_date).toLocaleDateString('fr-FR')
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${booking.num_travelers} pers.`}
                        size="small"
                        sx={{ bgcolor: alpha(SECONDARY, 0.07), color: SECONDARY, fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
                        {booking.total_price} {booking.currency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={booking.status} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Exporter PDF">
                          <IconButton
                            size="small"
                            onClick={() => handleExportPdf(booking)}
                            sx={{
                              color: PRIMARY,
                              '&:hover': { bgcolor: alpha(PRIMARY, 0.1) },
                            }}
                          >
                            <PictureAsPdf fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteDialog({ open: true, bookingId: booking.id })}
                            sx={{ color: '#F44336', '&:hover': { bgcolor: alpha('#F44336', 0.08) } }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                size="small"
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: PRIMARY,
                    color: '#fff',
                    '&:hover': { bgcolor: PRIMARY },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, bookingId: null })}
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: SECONDARY }}>Supprimer la réservation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, bookingId: null })}
            variant="outlined"
            sx={{ borderColor: alpha(PRIMARY, 0.5), color: PRIMARY, borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: PRIMARY } }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizerBookings;