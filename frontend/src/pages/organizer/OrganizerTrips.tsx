import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Add,
  Edit,
  Delete,
  Visibility,
  Cancel,
  Search,
  FlightTakeoff,
  CalendarMonth,
  People,
  ArrowBack,
  TrendingUp,
  TrendingDown,
  Schedule,
  LocationOn,
} from '@mui/icons-material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { tripAPI } from '../../services/api';

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
const StyledTableContainer = styled(TableContainer)({
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
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
});

const OutlineButton = styled(Button)({
  borderRadius: 10,
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

const DangerButton = styled(Button)({
  borderRadius: 10,
  padding: '8px 20px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.8rem',
  backgroundColor: COLORS.amber,
  color: COLORS.white,
  '&:hover': {
    backgroundColor: alpha(COLORS.amber, 0.85),
  },
});

const getTripStatus = (trip: any): 'active' | 'inactive' | 'no-session' => {
  if (!trip.is_active) return 'inactive';
  const activeSessions = trip.sessions?.filter((s: any) => s.status === 'OPEN').length || 0;
  return activeSessions > 0 ? 'active' : 'no-session';
};

const StatusChip = ({ status }: { status: 'active' | 'inactive' | 'no-session' }) => {
  const map = {
    active:     { label: 'Actif', color: COLORS.teal, bg: alpha(COLORS.teal, 0.1) },
    inactive:   { label: 'Inactif', color: COLORS.amber, bg: alpha(COLORS.amber, 0.1) },
    'no-session': { label: 'Sans session', color: COLORS.navy, bg: alpha(COLORS.navy, 0.08) },
  };
  const s = map[status];
  return (
    <Chip 
      size="small" 
      label={s.label}
      sx={{ 
        bgcolor: s.bg, 
        color: s.color, 
        fontWeight: 700, 
        fontSize: 11, 
        height: 24,
        borderRadius: 6,
      }}
    />
  );
};

const ROWS_PER_PAGE = 8;

const OrganizerTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; trip: any | null }>({ open: false, trip: null });
  const [cancelSessionDialog, setCancelSessionDialog] = useState<{ open: boolean; trip: any; session: any } | null>(null);
  const [sessionDialog, setSessionDialog] = useState<{ open: boolean; trip: any } | null>(null);

  useEffect(() => { loadTrips(); }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.list();
      setTrips(response.data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.trip) return;
    try {
      await tripAPI.delete(deleteDialog.trip.id);
      setDeleteDialog({ open: false, trip: null });
      loadTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleCancelSession = async () => {
    if (!cancelSessionDialog) return;
    try {
      await tripAPI.cancelSession(cancelSessionDialog.trip.id, cancelSessionDialog.session.id);
      setCancelSessionDialog(null);
      loadTrips();
    } catch (error) {
      console.error('Error canceling session:', error);
    }
  };

  const filtered = trips.filter(t => {
    if (!search) return true;
    return t.title?.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const counts = {
    total: trips.length,
    active: trips.filter(t => getTripStatus(t) === 'active').length,
    inactive: trips.filter(t => getTripStatus(t) === 'inactive').length,
    noSession: trips.filter(t => getTripStatus(t) === 'no-session').length,
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: COLORS.teal }} />
      </Box>
    );
  }

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
                Mes voyages
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                {trips.length} voyage{trips.length !== 1 ? 's' : ''} au total
              </Typography>
            </Box>
            <GradientButton 
              startIcon={<Add />}
              onClick={() => navigate('/organizer/trips/new')}
              sx={{ ml: 'auto' }}
            >
              Nouveau voyage
            </GradientButton>
          </Box>
        </Fade>

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Total', value: counts.total, color: COLORS.navy, icon: <FlightTakeoff /> },
            { label: 'Actifs', value: counts.active, color: COLORS.teal, icon: <CheckCircleIcon /> },
            { label: 'Inactifs', value: counts.inactive, color: COLORS.amber, icon: <Cancel /> },
            { label: 'Sans session', value: counts.noSession, color: COLORS.navy, icon: <Schedule /> },
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
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Search */}
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 12, 
          boxShadow: `0 2px 8px ${alpha(COLORS.navy, 0.04)}`, 
          border: `1px solid ${alpha(COLORS.teal, 0.1)}` 
        }}>
          <TextField
            placeholder="Rechercher un voyage..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            size="small"
            sx={{ minWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: alpha(COLORS.navy, 0.4), fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: { '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } }
            }}
          />
        </Paper>

        {filtered.length === 0 ? (
          <Fade in>
            <Alert 
              severity="info"
              sx={{ 
                borderRadius: 12, 
                borderLeft: `4px solid ${COLORS.teal}`, 
                bgcolor: alpha(COLORS.teal, 0.03),
                color: COLORS.navy,
              }}
            >
              {search ? 'Aucun voyage trouvé pour cette recherche.' : 'Vous n\'avez créé aucun voyage. Créez votre premier voyage maintenant !'}
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
                      <TableCell>Prix</TableCell>
                      <TableCell>Durée</TableCell>
                      <TableCell>Destinations</TableCell>
                      <TableCell>Sessions</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((trip, idx) => (
                      <TableRow 
                        key={trip.id}
                        sx={{
                          animation: `${fadeUp} 0.3s ease ${idx * 0.03}s both`,
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 42, height: 42, borderRadius: 8,
                              bgcolor: alpha(COLORS.teal, 0.1),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <FlightTakeoff sx={{ fontSize: 18, color: COLORS.teal }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.navy }}>
                                {trip.title?.length > 30 ? `${trip.title.substring(0, 30)}...` : trip.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                                {trip.short_description?.substring(0, 40)}
                                {(trip.short_description?.length || 0) > 40 ? '…' : ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.teal }}>
                            {trip.base_price} {trip.currency}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${trip.duration_days}j`}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(COLORS.navy, 0.07), 
                              color: COLORS.navy, 
                              fontWeight: 600, 
                              fontSize: 11,
                              borderRadius: 6,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5) }} />
                            <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.7) }}>
                              {trip.destinations?.map((d: any) => d.name).join(', ') || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSessionDialog({ open: true, trip })}
                            sx={{
                              display: 'inline-flex', alignItems: 'center', gap: 0.8,
                              cursor: 'pointer', px: 1.5, py: 0.5, borderRadius: 6,
                              bgcolor: alpha(COLORS.teal, 0.08),
                              '&:hover': { bgcolor: alpha(COLORS.teal, 0.15) },
                            }}
                          >
                            <CalendarMonth sx={{ fontSize: 14, color: COLORS.teal }} />
                            <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.teal }}>
                              {trip.sessions?.filter((s: any) => s.status === 'OPEN').length || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={getTripStatus(trip)} />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Voir">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/trips/${trip.id}`)}
                                sx={{ 
                                  color: COLORS.teal, 
                                  borderRadius: 8,
                                  '&:hover': { bgcolor: alpha(COLORS.teal, 0.1) } 
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/organizer/trips/${trip.id}/edit`)}
                                sx={{ 
                                  color: COLORS.navy, 
                                  borderRadius: 8,
                                  '&:hover': { bgcolor: alpha(COLORS.navy, 0.08) } 
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton 
                                size="small"
                                onClick={() => setDeleteDialog({ open: true, trip })}
                                sx={{ 
                                  color: COLORS.amber, 
                                  borderRadius: 8,
                                  '&:hover': { bgcolor: alpha(COLORS.amber, 0.08) } 
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
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

        {/* Delete Dialog */}
        <Dialog 
          open={deleteDialog.open} 
          onClose={() => setDeleteDialog({ open: false, trip: null })}
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
            Supprimer le voyage
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: alpha(COLORS.navy, 0.7) }}>
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong>"{deleteDialog.trip?.title}"</strong> ? Cette action est irréversible.
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
              Toutes les sessions et réservations associées seront également supprimées.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
            <OutlineButton onClick={() => setDeleteDialog({ open: false, trip: null })}>
              Annuler
            </OutlineButton>
            <DangerButton onClick={handleDelete}>
              Supprimer
            </DangerButton>
          </DialogActions>
        </Dialog>

        {/* Cancel Session Dialog */}
        {cancelSessionDialog && (
          <Dialog 
            open={cancelSessionDialog.open} 
            onClose={() => setCancelSessionDialog(null)}
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
              <Cancel sx={{ fontSize: 24 }} />
              Annuler une session
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: alpha(COLORS.navy, 0.7) }}>
                Annuler la session du{' '}
                <strong>
                  {cancelSessionDialog.session?.start_date && 
                    new Date(cancelSessionDialog.session.start_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                </strong>{' '}
                pour <strong>"{cancelSessionDialog.trip?.title}"</strong> ?
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
                Les voyageurs seront notifiés et remboursés intégralement.
              </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
              <OutlineButton onClick={() => setCancelSessionDialog(null)}>
                Fermer
              </OutlineButton>
              <DangerButton onClick={handleCancelSession}>
                Confirmer l'annulation
              </DangerButton>
            </DialogActions>
          </Dialog>
        )}

        {/* Sessions Dialog */}
        {sessionDialog && (
          <Dialog 
            open={sessionDialog.open} 
            onClose={() => setSessionDialog(null)} 
            maxWidth="sm" 
            fullWidth
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
              color: COLORS.navy,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pb: 1,
            }}>
              <CalendarMonth sx={{ color: COLORS.teal }} />
              Sessions — {sessionDialog.trip?.title}
            </DialogTitle>
            <DialogContent>
              {sessionDialog.trip?.sessions?.length === 0 ? (
                <Typography sx={{ color: alpha(COLORS.navy, 0.6), textAlign: 'center', py: 4 }}>
                  Aucune session disponible
                </Typography>
              ) : (
                sessionDialog.trip?.sessions?.map((session: any) => (
                  <Box key={session.id} sx={{
                    p: 2, mb: 1.5, borderRadius: 10,
                    border: `1px solid ${session.status === 'CANCELLED' ? alpha(COLORS.amber, 0.3) : alpha(COLORS.teal, 0.2)}`,
                    bgcolor: session.status === 'CANCELLED' ? alpha(COLORS.amber, 0.03) : alpha(COLORS.teal, 0.02),
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: session.status === 'CANCELLED' ? COLORS.amber : COLORS.teal,
                    },
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography fontWeight={700} variant="body2" sx={{ color: COLORS.navy }}>
                          📅 {session.start_date && new Date(session.start_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          {' → '}
                          {session.end_date && new Date(session.end_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.5) }} />
                            <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                              {session.available_seats}/{session.max_capacity} places disponibles
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={session.status === 'OPEN' ? 'Ouverte' : 'Annulée'}
                            sx={{
                              height: 20,
                              fontSize: 10,
                              fontWeight: 700,
                              borderRadius: 6,
                              bgcolor: session.status === 'OPEN' ? alpha(COLORS.teal, 0.1) : alpha(COLORS.amber, 0.1),
                              color: session.status === 'OPEN' ? COLORS.teal : COLORS.amber,
                            }}
                          />
                        </Box>
                      </Box>
                      {session.status === 'OPEN' && (
                        <Tooltip title="Annuler cette session">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => {
                              setSessionDialog(null);
                              setCancelSessionDialog({ open: true, trip: sessionDialog.trip, session });
                            }}
                            sx={{ 
                              color: COLORS.amber,
                              '&:hover': { bgcolor: alpha(COLORS.amber, 0.1) },
                            }}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                ))
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <OutlineButton onClick={() => setSessionDialog(null)}>
                Fermer
              </OutlineButton>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
};

// Icône CheckCircle manquante
const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
  </svg>
);

export default OrganizerTrips;