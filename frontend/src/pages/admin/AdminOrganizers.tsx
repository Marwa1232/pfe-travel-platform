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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Block,
  Refresh,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const AdminOrganizers: React.FC = () => {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    organizer: any | null;
    action: 'approve' | 'block' | null;
  }>({
    open: false,
    organizer: null,
    action: null,
  });

  useEffect(() => {
    loadOrganizers();
  }, []);

  const loadOrganizers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getOrganizers();
      console.log('Organizers response:', response.data);
      setOrganizers(response.data);
    } catch (err: any) {
      console.error('Error loading organizers:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur lors du chargement des organisateurs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.organizer || !actionDialog.action) return;

    try {
      if (actionDialog.action === 'approve') {
        await adminAPI.approveOrganizer(actionDialog.organizer.id);
      } else if (actionDialog.action === 'block') {
        await adminAPI.blockOrganizer(actionDialog.organizer.id);
      }
      setActionDialog({ open: false, organizer: null, action: null });
      loadOrganizers();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
      case 'BLOCKED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      APPROVED: 'Approuvé',
      PENDING: 'En attente',
      REJECTED: 'Rejeté',
      BLOCKED: 'Bloqué',
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des organisateurs
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={loadOrganizers}
          variant="outlined"
        >
          Actualiser
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : organizers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" gutterBottom>
            Aucun organisateur trouvé
          </Typography>
          <Button variant="contained" onClick={loadOrganizers} startIcon={<Refresh />}>
            Réessayer
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agence</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Pays</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizers.map((organizer) => (
                <TableRow key={organizer.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {organizer.agency_name}
                    </Typography>
                    {organizer.license_number && (
                      <Typography variant="body2" color="text.secondary">
                        License: {organizer.license_number}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {organizer.user?.first_name} {organizer.user?.last_name}
                  </TableCell>
                  <TableCell>{organizer.user?.email}</TableCell>
                  <TableCell>{organizer.country}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(organizer.status)}
                      color={getStatusColor(organizer.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {organizer.status === 'PENDING' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() =>
                          setActionDialog({
                            open: true,
                            organizer,
                            action: 'approve',
                          })
                        }
                        sx={{ mr: 1 }}
                      >
                        Approuver
                      </Button>
                    )}
                    {organizer.status !== 'BLOCKED' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Block />}
                        onClick={() =>
                          setActionDialog({
                            open: true,
                            organizer,
                            action: 'block',
                          })
                        }
                      >
                        Bloquer
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() =>
                          setActionDialog({
                            open: true,
                            organizer,
                            action: 'approve',
                          })
                        }
                      >
                        Débloquer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, organizer: null, action: null })}
      >
        <DialogTitle>
          {actionDialog.action === 'approve' ? 'Approuver' : 'Bloquer'} l'organisateur
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir {actionDialog.action === 'approve' ? 'approuver' : 'bloquer'}{' '}
            {actionDialog.organizer?.agency_name} ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setActionDialog({ open: false, organizer: null, action: null })}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={actionDialog.action === 'approve' ? 'success' : 'error'}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrganizers;
