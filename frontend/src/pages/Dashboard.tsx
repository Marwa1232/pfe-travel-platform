import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  FlightTakeoff,
  History,
  Favorite,
  TrendingUp,
  CalendarMonth,
  LocationOn,
  AccessTime,
  Star,
  EmojiEvents,
  Work,
  Public,
  BusinessCenter,
  ArrowForward,
  Edit,
} from '@mui/icons-material';
import { tripAPI } from '../services/api';
import { RootState } from '../store';
import TripCard from '../components/TripCard';

// Available interests for selection
const availableInterests = [
  { value: 'aventure', label: 'Aventure', icon: '🏔️' },
  { value: 'plage', label: 'Plage', icon: '🏖️' },
  { value: 'culture', label: 'Culture', icon: '🏛️' },
  { value: 'gastronomie', label: 'Gastronomie', icon: '🍽️' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'sport', label: 'Sport', icon: '⚽' },
  { value: 'luxe', label: 'Luxe', icon: '💎' },
  { value: 'famille', label: 'Famille', icon: '👨‍👩‍👧' },
];

// Badges based on travel count
const getBadge = (tripCount: number) => {
  if (tripCount >= 20) return { name: 'Explorateur Expert', color: '#FFD700', icon: '👑' };
  if (tripCount >= 10) return { name: 'Aventurier', color: '#C0C0C0', icon: '🥈' };
  if (tripCount >= 5) return { name: 'Voyageur Confirmé', color: '#CD7F32', icon: '🥉' };
  if (tripCount >= 1) return { name: 'Explorateur Débutant', color: '#00BFA5', icon: '🌱' };
  return { name: 'Nouveau Voyageur', color: '#64748B', icon: '🎒' };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [pastTrips, setPastTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [editingInterests, setEditingInterests] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load user's bookings for timeline
      try {
        const bookingsResponse = await fetch('http://localhost:8000/api/user/bookings/upcoming', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setUpcomingTrips(bookingsData.upcoming || []);
          setPastTrips(bookingsData.past || []);
        }
      } catch (bookingError) {
        console.log('Could not load bookings');
      }

      // Load recommendations
      let recs: any[] = [];
      if (user?.id) {
        try {
          const recResponse = await fetch(
            `http://localhost:8001/recommendations/${user.id}?limit=4`
          );
          if (recResponse.ok) {
            const recData = await recResponse.json();
            if (recData.recommendations && recData.recommendations.length > 0) {
              const tripIds = recData.recommendations.map((r: any) => r.trip_id);
              const trips = await Promise.all(
                tripIds.map((id: number) =>
                  tripAPI.get(id).then((res) => res.data)
                )
              );
              recs = trips;
            }
          }
        } catch (recError) {
          console.log('AI service not available, loading random trips');
        }
      }

      // If no recommendations, load random trips from API
      if (recs.length === 0) {
        try {
          const response = await tripAPI.list({ limit: 4 });
          if (response.data['hydra:member']) {
            recs = response.data['hydra:member'];
          }
        } catch (tripError) {
          console.log('Could not load trips');
        }
      }

      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const saveInterests = async () => {
    try {
      await fetch('http://localhost:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests }),
      });
      setEditingInterests(false);
    } catch (error) {
      console.error('Error saving interests:', error);
    }
  };

  const totalTrips = upcomingTrips.length + pastTrips.length;
  const badge = getBadge(totalTrips);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Left Sidebar - Profile Info */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                position: 'sticky',
                top: 100,
              }}
            >
              {/* Profile Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '2.5rem',
                    bgcolor: 'primary.main',
                  }}
                >
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
                <Typography variant="h5" fontWeight={700}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>

              {/* Badge/Rank */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: `${badge.color}15`,
                  border: '1px solid',
                  borderColor: badge.color,
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {badge.icon}
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ color: badge.color }}>
                  {badge.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalTrips} voyage{totalTrips !== 1 ? 's' : ''} réservé{totalTrips !== 1 ? 's' : ''}
                </Typography>
              </Box>

              {/* Interests */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Centres d'intérêt
                  </Typography>
                  {editingInterests ? (
                    <Button size="small" onClick={saveInterests} color="primary">
                      Enregistrer
                    </Button>
                  ) : (
                    <IconButton size="small" onClick={() => setEditingInterests(true)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                {editingInterests ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableInterests.map((interest) => (
                      <Chip
                        key={interest.value}
                        label={`${interest.icon} ${interest.label}`}
                        onClick={() => handleInterestToggle(interest.value)}
                        color={interests.includes(interest.value) ? 'primary' : 'default'}
                        variant={interests.includes(interest.value) ? 'filled' : 'outlined'}
                        sx={{ borderRadius: 2, cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {interests.length > 0 ? (
                      interests.map((interest) => {
                        const interestObj = availableInterests.find(i => i.value === interest);
                        return (
                          <Chip
                            key={interest}
                            label={`${interestObj?.icon || ''} ${interestObj?.label || interest}`}
                            size="small"
                            sx={{ borderRadius: 2 }}
                          />
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Aucun centre d'intérêt sélectionné
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Organizer CTA */}
              {user?.status_organizer !== 'approved' && (
                <Box sx={{ mt: 3 }}>
                  {user?.status_organizer === 'pending' ? (
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'warning.light',
                        textAlign: 'center',
                      }}
                    >
                      <AccessTime sx={{ fontSize: 40, color: 'warning.dark', mb: 1 }} />
                      <Typography variant="body1" fontWeight={600} color="warning.dark">
                        Demande en attente
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Votre demande sera traitée sous 24h
                      </Typography>
                    </Paper>
                  ) : (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<BusinessCenter />}
                      onClick={() => navigate('/organizer-request')}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                        },
                      }}
                    >
                      Vous voulez organiser des voyages ?
                      <br />
                      <Typography variant="caption">
                        Rejoignez-nous !
                      </Typography>
                    </Button>
                  )}
                </Box>
              )}

              {/* Quick Actions */}
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="text"
                      startIcon={<Favorite />}
                      onClick={() => navigate('/saved')}
                      sx={{ color: 'text.secondary' }}
                    >
                      Favoris
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="text"
                      startIcon={<History />}
                      onClick={() => navigate('/bookings')}
                      sx={{ color: 'text.secondary' }}
                    >
                      Historique
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Main Content - Timeline */}
          <Grid item xs={12} md={8}>
            {/* Upcoming Trips Timeline */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarMonth sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  Voyages à venir
                </Typography>
              </Box>

              {upcomingTrips.length > 0 ? (
                <Box sx={{ position: 'relative', pl: 4 }}>
                  {/* Timeline line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 22,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      bgcolor: 'primary.light',
                      opacity: 0.3,
                    }}
                  />
                  
                  {upcomingTrips.map((booking: any, index: number) => (
                    <Paper
                      key={booking.id}
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -28,
                          top: 24,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          border: '3px solid white',
                          boxShadow: '0 0 0 2px primary.main',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {booking.trip?.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {booking.trip?.destination}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={booking.status} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {booking.trip_session?.start_date} - {booking.trip_session?.end_date}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="primary.main" fontWeight={600}>
                          {booking.total_price} {booking.currency}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                  }}
                >
                  <FlightTakeoff sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Aucun voyage à venir
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/trips')}
                  >
                    Découvrir des voyages
                  </Button>
                </Paper>
              )}
            </Box>

            {/* Past Trips */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'grey.400',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <History sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  Voyages passés
                </Typography>
              </Box>

              {pastTrips.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {pastTrips.slice(0, 5).map((booking: any) => (
                    <Paper
                      key={booking.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: 0.8,
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {booking.trip?.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.trip_session?.start_date}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate(`/trips/${booking.trip?.id}`)}
                      >
                        Voir détails
                      </Button>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun voyage passé
                </Typography>
              )}
            </Box>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUp sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      Recommandations pour vous
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/trips')}
                  >
                    Voir tout
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {recommendations.map((trip: any) => (
                    <Grid item xs={12} sm={6} key={trip.id}>
                      <TripCard trip={trip} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
