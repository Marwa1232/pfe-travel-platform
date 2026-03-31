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
  Button,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha } from '@mui/material/styles';
import {
  FlightTakeoff,
  People,
  AttachMoney,
  TrendingUp,
  Add,
  CalendarMonth,
  Receipt,
} from '@mui/icons-material';
import { RootState } from '../../store';
import api from '../../services/api';

// Style professionnel (même que l'admin)
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid #eef2f6',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    borderColor: '#00BFA5',
  },
}));

const IconBox = styled(Box)(({ theme, color }: { theme?: any; color: string }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(color, 0.1),
  color: color,
}));

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
});

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
      <BackgroundBox>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <CircularProgress size={48} thickness={4} sx={{ color: '#00BFA5' }} />
        </Box>
      </BackgroundBox>
    );
  }

  return (
    <BackgroundBox>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 2,
              bgcolor: alpha('#00BFA5', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FlightTakeoff sx={{ fontSize: 28, color: '#00BFA5' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" sx={{ color: '#0D47A1' }}>
                Tableau de bord Organisateur
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez vos voyages et réservations
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/organizer/trips/new')}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #0D47A1, #00BFA5)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,191,165,0.3)',
              },
            }}
          >
            Nouveau voyage
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards - Même style que l'admin */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconBox color="#00BFA5">
                    <FlightTakeoff sx={{ fontSize: 24 }} />
                  </IconBox>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#00BFA5' }}>
                      {stats.totalTrips}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Voyages actifs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconBox color="#4CAF50">
                    <People sx={{ fontSize: 24 }} />
                  </IconBox>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#4CAF50' }}>
                      {stats.totalBookings}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Réservations totales
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconBox color="#FFA500">
                    <AttachMoney sx={{ fontSize: 24 }} />
                  </IconBox>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#FFA500' }}>
                      {(stats.totalRevenue || 0).toFixed(2)} TND
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Revenus
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconBox color="#F44336">
                    <TrendingUp sx={{ fontSize: 24 }} />
                  </IconBox>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#F44336' }}>
                      {stats.pendingBookings}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      En attente
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Quick Actions Cards */}
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <StyledCard 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => navigate('/organizer/trips')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2,
                    bgcolor: alpha('#00BFA5', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FlightTakeoff sx={{ fontSize: 32, color: '#00BFA5' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ color: '#0D47A1' }}>
                      Mes voyages
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gérer vos voyages organisés
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ color: '#00BFA5', fontSize: 20 }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} md={6}>
            <StyledCard 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => navigate('/organizer/bookings')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2,
                    bgcolor: alpha('#4CAF50', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Receipt sx={{ fontSize: 32, color: '#4CAF50' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ color: '#0D47A1' }}>
                      Réservations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Voir et gérer les réservations
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} md={6}>
            <StyledCard 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => navigate('/organizer/calendar')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2,
                    bgcolor: alpha('#FFA500', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CalendarMonth sx={{ fontSize: 32, color: '#FFA500' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ color: '#0D47A1' }}>
                      Calendrier
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Voir votre planning
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ color: '#FFA500', fontSize: 20 }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} md={6}>
            <StyledCard 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => navigate('/organizer/payments')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2,
                    bgcolor: alpha('#F44336', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <AttachMoney sx={{ fontSize: 32, color: '#F44336' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ color: '#0D47A1' }}>
                      Paiements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Historique des paiements
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ color: '#F44336', fontSize: 20 }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </BackgroundBox>
  );
};

export default OrganizerDashboard;