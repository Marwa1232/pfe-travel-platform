import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Button, CircularProgress, Alert, Stack, Avatar, IconButton,
  Tooltip, Grid, Card, CardContent, Fade, Zoom
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  PictureAsPdf, DeleteOutline, ArrowBack, 
  ConfirmationNumber, EventAvailable, History,
  TravelExplore, Receipt, Cancel
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import { bookingAPI } from '../services/api';
import { RootState } from '../store/index';
import CancelBookingModal from '../components/CancelBookingModal';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

// ─── STYLED COMPONENTS ──────────────────────────────────────────
const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  background: COLORS.white,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(COLORS.navy, 0.1)}`,
    borderColor: alpha(COLORS.teal, 0.3),
  },
}));

const TableWrapper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 4px 16px ${alpha(COLORS.navy, 0.05)}`,
  background: COLORS.white,
}));

const HeaderCell = styled(TableCell)({
  backgroundColor: alpha(COLORS.navy, 0.03),
  color: COLORS.navy,
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  borderBottom: `2px solid ${alpha(COLORS.teal, 0.2)}`,
});

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 12,
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(0.8, 2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.75rem',
  borderColor: COLORS.teal,
  color: COLORS.teal,
  '&:hover': {
    borderColor: COLORS.navy,
    backgroundColor: alpha(COLORS.teal, 0.05),
  },
}));

const DangerButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(0.8, 2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.75rem',
  borderColor: COLORS.amber,
  color: COLORS.amber,
  '&:hover': {
    borderColor: COLORS.amber,
    backgroundColor: alpha(COLORS.amber, 0.08),
  },
}));

const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBookingId, setCancelId] = useState<number | null>(null);
  const [cancelHasPaid, setCancelHasPaid] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadBookings();
  }, [token]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.myBookings();
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = (booking: any) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 45, 92);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(`CONFIRMATION DE RÉSERVATION #${booking.id}`, 15, 20);
    doc.setTextColor(15, 45, 92);
    doc.setFontSize(12);
    doc.text(`Voyage : ${booking.trip?.title}`, 15, 62);
    doc.text(`Date : ${new Date(booking.tripSession?.start_date).toLocaleDateString()}`, 15, 70);
    doc.text(`Prix Total : ${booking.total_price} ${booking.currency}`, 15, 78);
    doc.save(`TripBooking_${booking.id}.pdf`);
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
  };

  const getStatusConfig = (status: string) => {
    if (status === 'CONFIRMED') {
      return { label: 'Confirmé', color: COLORS.teal, bg: alpha(COLORS.teal, 0.1) };
    }
    if (status === 'PENDING') {
      return { label: 'En attente', color: COLORS.amber, bg: alpha(COLORS.amber, 0.1) };
    }
    return { label: status, color: COLORS.navy, bg: alpha(COLORS.navy, 0.1) };
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 4 }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Fade in>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton 
                onClick={() => navigate('/')}
                sx={{ 
                  bgcolor: COLORS.white, 
                  color: COLORS.navy, 
                  borderRadius: 12,
                  border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                  '&:hover': { bgcolor: alpha(COLORS.teal, 0.05), borderColor: COLORS.teal }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
                  Mes Réservations
                </Typography>
                <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                  Historique et gestion de vos voyages
                </Typography>
              </Box>
            </Stack>
            <GradientButton startIcon={<TravelExplore />} onClick={() => navigate('/trips')}>
              Explorer d'autres voyages
            </GradientButton>
          </Box>
        </Fade>

        {/* STATS CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Réservations', val: stats.total, icon: <ConfirmationNumber />, color: COLORS.navy },
            { label: 'Réservations confirmées', val: stats.confirmed, icon: <EventAvailable />, color: COLORS.teal },
            { label: 'En attente', val: stats.pending, icon: <History />, color: COLORS.amber },
          ].map((s, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Zoom in timeout={300 + i * 100}>
                <StatsCard>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                    <Avatar sx={{ bgcolor: alpha(s.color, 0.1), color: s.color, width: 52, height: 52, borderRadius: 12 }}>
                      {s.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: alpha(COLORS.navy, 0.6) }}>
                        {s.label}
                      </Typography>
                      <Typography variant="h3" fontWeight={800} sx={{ color: s.color, lineHeight: 1.2 }}>
                        {s.val}
                      </Typography>
                    </Box>
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* TABLEAU */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: COLORS.teal }} />
          </Box>
        ) : bookings.length === 0 ? (
          <Fade in>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 12, 
                bgcolor: alpha(COLORS.teal, 0.05), 
                color: COLORS.navy,
                '& .MuiAlert-icon': { color: COLORS.teal }
              }}
            >
              Vous n'avez pas encore de réservations.
            </Alert>
          </Fade>
        ) : (
          <TableWrapper elevation={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <HeaderCell>Détails du Voyage</HeaderCell>
                    <HeaderCell>Date de Départ</HeaderCell>
                    <HeaderCell>Prix Total</HeaderCell>
                    <HeaderCell>Statut</HeaderCell>
                    <HeaderCell align="right">Actions</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking, idx) => {
                    const statusConfig = getStatusConfig(booking.status);
                    return (
                      <TableRow 
                        key={booking.id} 
                        sx={{ 
                          '&:hover': { bgcolor: alpha(COLORS.teal, 0.02) },
                          animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ 
                              background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`, 
                              borderRadius: 10,
                              width: 44,
                              height: 44
                            }}>
                              <TravelExplore sx={{ fontSize: 22, color: COLORS.white }} />
                            </Avatar>
                            <Box>
                              <Typography fontWeight={700} sx={{ color: COLORS.navy }}>
                                {booking.trip?.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                                {booking.num_travelers} voyageur{booking.num_travelers > 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.navy }}>
                            {new Date(booking.tripSession?.start_date).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={800} sx={{ color: COLORS.teal }}>
                            {booking.total_price} {booking.currency}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={statusConfig.label} 
                            size="small"
                            sx={{ 
                              bgcolor: statusConfig.bg,
                              color: statusConfig.color,
                              fontWeight: 600,
                              borderRadius: 8,
                              fontSize: '0.7rem',
                              height: 26,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Télécharger le reçu">
                              <OutlinedButton
                                startIcon={<Receipt fontSize="small" />}
                                onClick={() => handleExportPdf(booking)}
                              >
                                Reçu
                              </OutlinedButton>
                            </Tooltip>
                            
                            {booking.status !== 'CANCELLED' && (
                              <Tooltip title="Annuler la réservation">
                                <DangerButton
                                  startIcon={<Cancel fontSize="small" />}
                                  onClick={() => {
                                    setCancelId(booking.id);
                                    setCancelHasPaid(booking.payment?.status === 'SUCCEEDED');
                                    setCancelOpen(true);
                                  }}
                                >
                                  Annuler
                                </DangerButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Supprimer">
                              <IconButton 
                                onClick={() => bookingAPI.delete(booking.id).then(loadBookings)}
                                sx={{ 
                                  color: alpha(COLORS.navy, 0.3),
                                  borderRadius: 10,
                                  '&:hover': { color: COLORS.amber, bgcolor: alpha(COLORS.amber, 0.08) }
                                }}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TableWrapper>
        )}

        <CancelBookingModal
          open={cancelOpen}
          bookingId={cancelBookingId}
          hasPaidStripe={cancelHasPaid}
          onClose={() => setCancelOpen(false)}
          onCancelled={() => { setCancelOpen(false); loadBookings(); }}
        />
      </Container>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default BookingHistory;