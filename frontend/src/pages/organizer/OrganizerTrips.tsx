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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Cancel,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { tripAPI } from '../../services/api';

// Couleurs et gradient du thème
const primaryColor = '#00BFA5';
const secondaryColor = '#0D47A1';
const primaryGradient = 'linear-gradient(90deg, #00BFA5, #0D47A1)';

// Style du bouton principal
const StyledButton = styled(Button)({
  background: primaryGradient,
  color: 'white',
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 20px',
  boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
  '&:hover': {
    background: `linear-gradient(90deg, ${alpha(primaryColor, 0.9)}, ${alpha(secondaryColor, 0.9)})`,
    boxShadow: `0 6px 16px ${alpha(primaryColor, 0.4)}`,
  },
});

// Style du tableau (TableContainer déjà stylisé)
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

// Composant Chip de statut personnalisé
const StatusChip = ({ status }: { status: 'active' | 'inactive' | 'no-session' }) => {
  const getChipProps = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Actif',
          sx: { backgroundColor: alpha('#00BFA5', 0.1), color: '#00BFA5', fontWeight: 600 },
        };
      case 'inactive':
        return {
          label: 'Inactif',
          sx: { backgroundColor: alpha('#FF6B6B', 0.1), color: '#FF6B6B', fontWeight: 600 },
        };
      default:
        return {
          label: 'Aucune session',
          sx: { backgroundColor: alpha('#FFA500', 0.1), color: '#FF8C00', fontWeight: 600 },
        };
    }
  };
  const chipProps = getChipProps();
  return <Chip size="small" {...chipProps} />;
};

const OrganizerTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; trip: any | null }>({
    open: false,
    trip: null,
  });
  const [cancelSessionDialog, setCancelSessionDialog] = useState<{ open: boolean; trip: any; session: any } | null>(null);
  const [sessionDialog, setSessionDialog] = useState<{ open: boolean; trip: any } | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

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
    } catch (error: any) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleCancelSession = async () => {
    if (!cancelSessionDialog) return;
    try {
      await tripAPI.cancelSession(cancelSessionDialog.trip.id, cancelSessionDialog.session.id);
      setCancelSessionDialog(null);
      loadTrips();
    } catch (error: any) {
      console.error('Error canceling session:', error);
    }
  };

  const getTripStatus = (trip: any): 'active' | 'inactive' | 'no-session' => {
    if (!trip.is_active) return 'inactive';
    const activeSessions = trip.sessions?.filter((s: any) => s.status === 'OPEN').length || 0;
    if (activeSessions > 0) return 'active';
    return 'no-session';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: secondaryColor }}>
          Mes voyages
        </Typography>
        <StyledButton
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/organizer/trips/new')}
        >
          Nouveau voyage
        </StyledButton>
      </Box>

      {trips.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            borderLeft: `4px solid ${primaryColor}`,
            backgroundColor: alpha(primaryColor, 0.02),
          }}
        >
          Vous n'avez créé aucun voyage. Créez votre premier voyage maintenant !
        </Alert>
      ) : (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Durée</TableCell>
                <TableCell>Sessions actives</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight={600} sx={{ color: secondaryColor }}>
                      {trip.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {trip.short_description?.substring(0, 60)}
                      {trip.short_description?.length > 60 ? '...' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={600} color="primary">
                      {trip.base_price} {trip.currency}
                    </Typography>
                  </TableCell>
                  <TableCell>{trip.duration_days} jours</TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      sx={{
                        cursor: 'pointer',
                        color: primaryColor,
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() => setSessionDialog({ open: true, trip })}
                    >
                      {trip.sessions?.filter((s: any) => s.status === 'OPEN').length || 0} sessions
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={getTripStatus(trip)} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      title="Voir"
                      sx={{ color: primaryColor, '&:hover': { backgroundColor: alpha(primaryColor, 0.1) } }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/organizer/trips/${trip.id}/edit`)}
                      title="Modifier"
                      sx={{ color: primaryColor, '&:hover': { backgroundColor: alpha(primaryColor, 0.1) } }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, trip })}
                      title="Supprimer"
                      sx={{ '&:hover': { backgroundColor: alpha('#FF6B6B', 0.1) } }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, trip: null })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: secondaryColor }}>
          Supprimer le voyage
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer "<strong>{deleteDialog.trip?.title}</strong>" ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, trip: null })}
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

      {/* Dialogue d'annulation de session */}
      {cancelSessionDialog && (
        <Dialog
          open={cancelSessionDialog.open}
          onClose={() => setCancelSessionDialog(null)}
          PaperProps={{
            sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: '#D32F2F' }}>
            Annuler une session
          </DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir annuler la session du{' '}
              <strong>
                {cancelSessionDialog.session?.start_date && new Date(cancelSessionDialog.session.start_date).toLocaleDateString('fr-FR')}
              </strong>{' '}
              pour le voyage "<strong>{cancelSessionDialog.trip?.title}</strong>" ?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Les voyageurs réservés pour cette session seront notifiés et recevront un remboursement.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setCancelSessionDialog(null)}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Fermer
            </Button>
            <Button
              onClick={handleCancelSession}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Confirmer l'annulation
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialogue des sessions */}
      {sessionDialog && (
        <Dialog
          open={sessionDialog.open}
          onClose={() => setSessionDialog(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: secondaryColor }}>
            Sessions de "{sessionDialog.trip?.title}"
          </DialogTitle>
          <DialogContent>
            {sessionDialog.trip?.sessions?.length === 0 ? (
              <Typography color="text.secondary">Aucune session</Typography>
            ) : (
              sessionDialog.trip?.sessions?.map((session: any) => (
                <Box
                  key={session.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: session.status === 'CANCELLED' ? 'error.main' : alpha(primaryColor, 0.2),
                    bgcolor: session.status === 'CANCELLED' ? alpha('#D32F2F', 0.05) : 'transparent',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight={600}>
                        {session.start_date && new Date(session.start_date).toLocaleDateString('fr-FR')} -{' '}
                        {session.end_date && new Date(session.end_date).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Places: {session.available_seats} / {session.max_capacity} • Status: {session.status}
                      </Typography>
                    </Box>
                    {session.status === 'OPEN' && (
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSessionDialog(null);
                          setCancelSessionDialog({ open: true, trip: sessionDialog.trip, session });
                        }}
                        title="Annuler cette session"
                      >
                        <Cancel />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSessionDialog(null)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default OrganizerTrips;