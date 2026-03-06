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
} from '@mui/icons-material';
import { tripAPI } from '../../services/api';

const OrganizerTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; trip: any | null }>({
    open: false,
    trip: null,
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.list({ organizer: true });
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

  const getStatusChip = (trip: any) => {
    if (!trip.is_active) {
      return <Chip label="Inactif" color="error" size="small" />;
    }
    const activeSessions = trip.sessions?.filter((s: any) => s.status === 'OPEN').length || 0;
    if (activeSessions > 0) {
      return <Chip label="Actif" color="success" size="small" />;
    }
    return <Chip label="Aucune session" color="warning" size="small" />;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mes voyages
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/organizer/trips/new')}
        >
          Nouveau voyage
        </Button>
      </Box>

      {trips.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Vous n'avez créé aucun voyage. Créez votre premier voyage maintenant !
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Durée</TableCell>
                <TableCell>Sessions actives</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {trip.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trip.short_description?.substring(0, 50)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {trip.base_price} {trip.currency}
                  </TableCell>
                  <TableCell>{trip.duration_days} jours</TableCell>
                  <TableCell>
                    {trip.sessions?.filter((s: any) => s.status === 'OPEN').length || 0}
                  </TableCell>
                  <TableCell>{getStatusChip(trip)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      title="Voir"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/organizer/trips/${trip.id}/edit`)}
                      title="Modifier"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, trip })}
                      title="Supprimer"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, trip: null })}
      >
        <DialogTitle>Supprimer le voyage</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer "{deleteDialog.trip?.title}" ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, trip: null })}>
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizerTrips;