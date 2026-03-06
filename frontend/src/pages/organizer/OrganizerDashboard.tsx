import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // ✅ FIX ICI
import {
  FlightTakeoff,
  People,
  AttachMoney,
  TrendingUp,
} from '@mui/icons-material';
import { RootState } from '../../store';
import api from '../../services/api';

const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!user?.roles?.includes('ROLE_ORGANIZER')) {
      navigate('/dashboard');
      return;
    }

    loadStats();
  }, [token, user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organizer/stats');
      setStats(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Erreur lors du chargement des statistiques'
      );
    } finally {
      setLoading(false);
    }
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
      <Typography variant="h4" gutterBottom>
        Tableau de bord Organisateur
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gérez vos voyages et réservations
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FlightTakeoff
                  sx={{ fontSize: 40, color: 'primary.main', mr: 2 }}
                />
                <Box>
                  <Typography variant="h4">
                    {stats.totalTrips}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Voyages actifs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People
                  sx={{ fontSize: 40, color: 'success.main', mr: 2 }}
                />
                <Box>
                  <Typography variant="h4">
                    {stats.totalBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Réservations totales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney
                  sx={{ fontSize: 40, color: 'warning.main', mr: 2 }}
                />
                <Box>
                  <Typography variant="h4">
                    {(stats.totalRevenue || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenus (TND)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp
                  sx={{ fontSize: 40, color: 'error.main', mr: 2 }}
                />
                <Box>
                  <Typography variant="h4">
                    {stats.pendingBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En attente
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 },
            }}
            onClick={() => navigate('/organizer/trips')}
          >
            <Typography variant="h6" gutterBottom>
              Mes voyages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gérer vos voyages organisés
            </Typography>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 },
            }}
            onClick={() => navigate('/organizer/bookings')}
          >
            <Typography variant="h6" gutterBottom>
              Réservations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Voir et gérer les réservations
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrganizerDashboard;