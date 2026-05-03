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
  Fade,
  Zoom,
  Card,
  CardContent,
  Grid,
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
  ArrowBack,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ───────────────────────────────────────────
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: `0 4px 20px ${alpha(COLORS.navy, 0.06)}`,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  overflow: 'hidden',
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: alpha(COLORS.teal, 0.03),
    fontWeight: 700,
    color: COLORS.navy,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: `2px solid ${alpha(COLORS.teal, 0.2)}`,
    padding: '14px 16px',
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'background 0.2s ease',
    '&:hover': { backgroundColor: alpha(COLORS.teal, 0.02) },
    '&:last-child td': { borderBottom: 0 },
  },
  '& .MuiTableCell-root': {
    padding: '12px 16px',
    borderBottom: `1px solid ${alpha(COLORS.teal, 0.08)}`,
  },
}));

const FiltersPaper = styled(Paper)({
  padding: 20,
  marginBottom: 24,
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 2px 12px ${alpha(COLORS.navy, 0.04)}`,
  backgroundColor: COLORS.white,
});

const StatsCard = styled(Card)({
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(COLORS.navy, 0.04)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${alpha(COLORS.teal, 0.12)}`,
  },
});

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 10,
  padding: '8px 20px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.8rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
});

const OutlineButton = styled(Button)({
  borderRadius: 12,
  padding: '8px 20px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.8rem',
  borderColor: COLORS.teal,
  color: COLORS.teal,
  '&:hover': {
    borderColor: COLORS.navy,
    backgroundColor: alpha(COLORS.teal, 0.05),
  },
});

const getStatusMeta = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    CONFIRMED: { label: 'Confirmée', color: COLORS.teal, bg: alpha(COLORS.teal, 0.1), icon: null },
    PENDING:   { label: 'En attente', color: COLORS.amber, bg: alpha(COLORS.amber, 0.1), icon: <HourglassEmpty sx={{ fontSize: 12 }} /> },
    CANCELLED: { label: 'Annulée', color: COLORS.amber, bg: alpha(COLORS.amber, 0.1) , icon: null },
  };
  return map[status] || { label: status, color: COLORS.navy, bg: alpha(COLORS.navy, 0.08), icon: null };
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
        borderRadius: 2,
        '& .MuiChip-icon': { color: meta.color, fontSize: 13 },
      }}
    />
  );
};

const ROWS_PER_PAGE = 8;

const OrganizerBookings: React.FC = () => {
  const navigate = useNavigate();
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
    
    // Header gradient
    doc.setFillColor(14, 165, 160);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(15, 45, 92);
    doc.rect(0, 35, pageWidth, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIRMATION DE RÉSERVATION', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`#${booking.id}`, pageWidth / 2, 38, { align: 'center' });
    
    doc.setTextColor(15, 45, 92);
    let y = 60;
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Informations du voyage', 15, y); y += 10;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Voyage: ${booking.trip?.title || '-'}`, 15, y); y += 7;
    doc.text(`Destinations: ${booking.trip?.destinations?.map((d: any) => d.name).join(', ') || '-'}`, 15, y); y += 15;
    
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Client', 15, y); y += 10;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    const clientName = booking.user ? `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim() : '-';
    doc.text(`Nom: ${clientName}`, 15, y); y += 7;
    doc.text(`Email: ${booking.user?.email || '-'}`, 15, y); y += 15;
    
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Détails', 15, y); y += 10;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    const startDate = booking.tripSession?.start_date
      ? new Date(booking.tripSession.start_date).toLocaleDateString('fr-FR') : '-';
    doc.text(`Date départ: ${startDate}`, 15, y); y += 7;
    doc.text(`Voyageurs: ${booking.num_travelers}`, 15, y); y += 15;
    
    // Total box
    doc.setFillColor(236, 240, 241);
    doc.rect(15, y - 5, pageWidth - 30, 20, 'F');
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 160);
    doc.text(`Prix total: ${booking.total_price} ${booking.currency}`, 20, y + 5);
    
    doc.setTextColor(128, 128, 128); doc.setFontSize(8);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} - TripBooking`, pageWidth / 2, 280, { align: 'center' });
    doc.save(`reservation_${booking.id}.pdf`);
  };

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

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 4 }}>
      <Container maxWidth="xl">
        
        {/* Header avec bouton retour */}
        <Fade in timeout={500}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <IconButton 
              onClick={() => navigate('/organizer/dashboard')}
              sx={{ 
                bgcolor: COLORS.white, 
                borderRadius: 10,
                border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                '&:hover': { bgcolor: alpha(COLORS.teal, 0.05), borderColor: COLORS.teal }
              }}
            >
              <ArrowBack sx={{ color: COLORS.navy }} />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
                Réservations
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                Gérez toutes les réservations de vos voyages
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Toutes', value: counts.all, color: COLORS.navy, icon: <Receipt />, trend: 0 },
            { label: 'Confirmées', value: counts.confirmed, color: COLORS.teal, icon: <CheckCircle />, trend: 12 },
            { label: 'En attente', value: counts.pending, color: COLORS.amber, icon: <HourglassEmpty />, trend: -5 },
            { label: 'Annulées', value: counts.cancelled, color: COLORS.amber, icon: <Cancel />, trend: -2 },
          ].map((item, i) => (
            <Grid xs={12} sm={6} md={3} key={i}>
              <Zoom in timeout={300 + i * 100}>
                <StatsCard>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: 10,
                      bgcolor: alpha(item.color, 0.1), color: item.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={800} sx={{ color: item.color, lineHeight: 1 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                        {item.label}
                      </Typography>
                    </Box>
                    {item.trend !== 0 && (
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        {item.trend > 0 ? 
                          <TrendingUp sx={{ fontSize: 12, color: COLORS.teal }} /> : 
                          <TrendingDown sx={{ fontSize: 12, color: COLORS.amber }} />
                        }
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: item.trend > 0 ? COLORS.teal : COLORS.amber }}>
                          {item.trend > 0 ? '+' : ''}{item.trend}%
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Filtres */}
        <FiltersPaper elevation={0}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Rechercher par voyage, client..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              size="small"
              sx={{ minWidth: 280, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: alpha(COLORS.navy, 0.4), fontSize: 18 }} />
                  </InputAdornment>
                ),
                sx: { '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } }
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: alpha(COLORS.navy, 0.6) }}>Statut</InputLabel>
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
            <GradientButton startIcon={<FilterList />} onClick={() => {}}>
              Appliquer
            </GradientButton>
          </Box>
        </FiltersPaper>

        {/* Tableau des réservations */}
        {loading ? (
          <Box textAlign="center" sx={{ py: 10 }}>
            <CircularProgress size={40} sx={{ color: COLORS.teal }} />
            <Typography sx={{ mt: 2, color: alpha(COLORS.navy, 0.6) }}>
              Chargement des réservations...
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Fade in>
            <Alert 
              severity="info" 
              icon={<Receipt />}
              sx={{ 
                borderRadius: 12, 
                borderLeft: `4px solid ${COLORS.teal}`, 
                bgcolor: alpha(COLORS.teal, 0.03),
                color: COLORS.navy,
              }}
            >
              Aucune réservation trouvée.
            </Alert>
          </Fade>
        ) : (
          <Fade in timeout={500}>
            <Box>
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
                    {paginated.map((booking, idx) => (
                      <TableRow 
                        key={booking.id}
                        sx={{
                          animation: `${fadeUp} 0.3s ease ${idx * 0.03}s both`,
                        }}
                      >
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 36, height: 36, borderRadius: 8,
                              bgcolor: alpha(COLORS.teal, 0.1),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <FlightTakeoff sx={{ fontSize: 16, color: COLORS.teal }} />
                            </Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.navy }}>
                              {booking.trip?.title?.length > 30 
                                ? `${booking.trip.title.substring(0, 30)}...` 
                                : booking.trip?.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar sx={{ 
                              width: 32, height: 32, 
                              bgcolor: COLORS.navy, 
                              fontSize: 11, 
                              color: COLORS.white,
                            }}>
                              {booking.user?.first_name?.[0]}{booking.user?.last_name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.navy }}>
                                {booking.user?.first_name} {booking.user?.last_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                                {booking.user?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.7) }}>
                            {booking.tripSession?.start_date
                              ? new Date(booking.tripSession.start_date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${booking.num_travelers} pers.`}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(COLORS.navy, 0.07), 
                              color: COLORS.navy, 
                              fontWeight: 600, 
                              fontSize: 12,
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.teal }}>
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
                                  color: COLORS.teal,
                                  borderRadius: 8,
                                  '&:hover': { bgcolor: alpha(COLORS.teal, 0.1) },
                                }}
                              >
                                <PictureAsPdf fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteDialog({ open: true, bookingId: booking.id })}
                                sx={{ 
                                  color: COLORS.amber,
                                  borderRadius: 8,
                                  '&:hover': { bgcolor: alpha(COLORS.amber, 0.1) },
                                }}
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                    size="medium"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 8,
                        '&.Mui-selected': {
                          bgcolor: COLORS.teal,
                          color: COLORS.white,
                          '&:hover': { bgcolor: alpha(COLORS.teal, 0.85) },
                        },
                        '&:hover': {
                          bgcolor: alpha(COLORS.teal, 0.1),
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {/* Dialog de suppression */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, bookingId: null })}
          PaperProps={{ 
            sx: { 
              borderRadius: 16, 
              boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.15)}`,
              border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
            } 
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            color: COLORS.amber,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 1,
          }}>
            <Delete sx={{ fontSize: 24 }} />
            Supprimer la réservation
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: alpha(COLORS.navy, 0.7) }}>
              Êtes-vous sûr de vouloir supprimer cette réservation ? 
              Cette action est irréversible.
            </Typography>
            <Alert 
              severity="warning" 
              sx={{ 
                mt: 2, 
                borderRadius: 8,
                bgcolor: alpha(COLORS.amber, 0.08),
                color: COLORS.amber,
              }}
            >
              Cette action supprimera définitivement la réservation de votre base de données.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
            <OutlineButton onClick={() => setDeleteDialog({ open: false, bookingId: null })}>
              Annuler
            </OutlineButton>
            <Button
              onClick={handleDelete}
              variant="contained"
              sx={{
                borderRadius: 10,
                textTransform: 'none',
                bgcolor: COLORS.amber,
                color: COLORS.white,
                fontWeight: 600,
                '&:hover': { bgcolor: alpha(COLORS.amber, 0.85) },
              }}
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default OrganizerBookings;