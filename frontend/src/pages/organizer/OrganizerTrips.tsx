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
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { tripAPI } from '../../services/api';

const PRIMARY = '#00BFA5';
const SECONDARY = '#0D47A1';

const StyledTableContainer = styled(TableContainer)({
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
});

const getTripStatus = (trip: any): 'active' | 'inactive' | 'no-session' => {
  if (!trip.is_active) return 'inactive';
  const activeSessions = trip.sessions?.filter((s: any) => s.status === 'OPEN').length || 0;
  return activeSessions > 0 ? 'active' : 'no-session';
};

const StatusChip = ({ status }: { status: 'active' | 'inactive' | 'no-session' }) => {
  const map = {
    active:     { label: 'Actif',          color: PRIMARY,   bg: alpha(PRIMARY, 0.1) },
    inactive:   { label: 'Inactif',        color: '#F44336', bg: alpha('#F44336', 0.1) },
    'no-session': { label: 'Sans session', color: '#FF9800', bg: alpha('#FF9800', 0.1) },
  };
  const s = map[status];
  return (
    <Chip size="small" label={s.label}
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: 11, height: 24 }}
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
    active: trips.filter(t => getTripStatus(t) === 'active').length,
    inactive: trips.filter(t => getTripStatus(t) === 'inactive').length,
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: SECONDARY }}>Mes voyages</Typography>
          <Typography variant="body2" color="text.secondary">
            {trips.length} voyage{trips.length !== 1 ? 's' : ''} — {counts.active} actif{counts.active !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/organizer/trips/new')}
          sx={{
            borderRadius: 2,
            background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${SECONDARY}, ${PRIMARY})`,
              transform: 'translateY(-1px)',
            },
          }}
        >
          Nouveau voyage
        </Button>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        {[
          { label: 'Total', count: trips.length, color: SECONDARY, bg: alpha(SECONDARY, 0.08) },
          { label: 'Actifs', count: counts.active, color: PRIMARY, bg: alpha(PRIMARY, 0.1) },
          { label: 'Inactifs', count: counts.inactive, color: '#F44336', bg: alpha('#F44336', 0.1) },
        ].map(item => (
          <Box key={item.label} sx={{
            px: 2, py: 0.8, borderRadius: 3, bgcolor: item.bg,
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: item.color }}>{item.count}</Typography>
            <Typography variant="body2" sx={{ color: item.color }}>{item.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2.5, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${alpha(PRIMARY, 0.1)}` }}>
        <TextField
          placeholder="Rechercher un voyage..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          size="small"
          sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#bbb', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {filtered.length === 0 ? (
        <Alert severity="info"
          sx={{ borderRadius: 3, borderLeft: `4px solid ${PRIMARY}`, bgcolor: alpha(PRIMARY, 0.03) }}
        >
          {search ? 'Aucun voyage trouvé pour cette recherche.' : 'Vous n\'avez créé aucun voyage. Créez votre premier voyage maintenant !'}
        </Alert>
      ) : (
        <>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Voyage</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Durée</TableCell>
                  <TableCell>Sessions actives</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 40, height: 40, borderRadius: 2,
                          bgcolor: alpha(PRIMARY, 0.1),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FlightTakeoff sx={{ fontSize: 18, color: PRIMARY }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ color: SECONDARY }}>
                            {trip.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trip.short_description?.substring(0, 50)}
                            {(trip.short_description?.length || 0) > 50 ? '…' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
                        {trip.base_price} {trip.currency}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${trip.duration_days}j`}
                        size="small"
                        sx={{ bgcolor: alpha(SECONDARY, 0.07), color: SECONDARY, fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box
                        onClick={() => setSessionDialog({ open: true, trip })}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 0.8,
                          cursor: 'pointer', px: 1.5, py: 0.5, borderRadius: 2,
                          bgcolor: alpha(PRIMARY, 0.07),
                          '&:hover': { bgcolor: alpha(PRIMARY, 0.14) },
                        }}
                      >
                        <CalendarMonth sx={{ fontSize: 14, color: PRIMARY }} />
                        <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
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
                          <IconButton size="small"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                            sx={{ color: PRIMARY, '&:hover': { bgcolor: alpha(PRIMARY, 0.1) } }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton size="small"
                            onClick={() => navigate(`/organizer/trips/${trip.id}/edit`)}
                            sx={{ color: SECONDARY, '&:hover': { bgcolor: alpha(SECONDARY, 0.08) } }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small"
                            onClick={() => setDeleteDialog({ open: true, trip })}
                            sx={{ color: '#F44336', '&:hover': { bgcolor: alpha('#F44336', 0.08) } }}
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

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small"
                sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: PRIMARY, color: '#fff' } }}
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, trip: null })}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: SECONDARY }}>Supprimer le voyage</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer{' '}
            <strong>"{deleteDialog.trip?.title}"</strong> ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, trip: null })} variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(PRIMARY, 0.4), color: PRIMARY }}
          >
            Annuler
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error"
            sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Session Dialog */}
      {cancelSessionDialog && (
        <Dialog open={cancelSessionDialog.open} onClose={() => setCancelSessionDialog(null)}
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: '#D32F2F' }}>Annuler une session</DialogTitle>
          <DialogContent>
            <Typography>
              Annuler la session du{' '}
              <strong>{cancelSessionDialog.session?.start_date && new Date(cancelSessionDialog.session.start_date).toLocaleDateString('fr-FR')}</strong>{' '}
              pour <strong>"{cancelSessionDialog.trip?.title}"</strong> ?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              Les voyageurs seront notifiés et remboursés.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setCancelSessionDialog(null)} variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Fermer
            </Button>
            <Button onClick={handleCancelSession} variant="contained" color="error"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Confirmer l'annulation
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Sessions Dialog */}
      {sessionDialog && (
        <Dialog open={sessionDialog.open} onClose={() => setSessionDialog(null)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: SECONDARY }}>
            Sessions — {sessionDialog.trip?.title}
          </DialogTitle>
          <DialogContent>
            {sessionDialog.trip?.sessions?.length === 0 ? (
              <Typography color="text.secondary">Aucune session</Typography>
            ) : (
              sessionDialog.trip?.sessions?.map((session: any) => (
                <Box key={session.id} sx={{
                  p: 2, mb: 1.5, borderRadius: 2, border: '1px solid',
                  borderColor: session.status === 'CANCELLED' ? alpha('#D32F2F', 0.3) : alpha(PRIMARY, 0.2),
                  bgcolor: session.status === 'CANCELLED' ? alpha('#D32F2F', 0.03) : alpha(PRIMARY, 0.02),
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight={600} variant="body2">
                        {session.start_date && new Date(session.start_date).toLocaleDateString('fr-FR')}
                        {' → '}
                        {session.end_date && new Date(session.end_date).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <People sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {session.available_seats}/{session.max_capacity} places
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={session.status}
                          sx={{
                            height: 18, fontSize: 10, fontWeight: 700,
                            bgcolor: session.status === 'OPEN' ? alpha(PRIMARY, 0.1) : alpha('#F44336', 0.1),
                            color: session.status === 'OPEN' ? PRIMARY : '#F44336',
                          }}
                        />
                      </Box>
                    </Box>
                    {session.status === 'OPEN' && (
                      <Tooltip title="Annuler cette session">
                        <IconButton color="error" size="small"
                          onClick={() => {
                            setSessionDialog(null);
                            setCancelSessionDialog({ open: true, trip: sessionDialog.trip, session });
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
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSessionDialog(null)} variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(PRIMARY, 0.4), color: PRIMARY }}
            >
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default OrganizerTrips;