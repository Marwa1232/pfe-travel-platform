import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
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
  Fade,
  Zoom,
  Grow,
  Badge,
  Tooltip,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
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
  Explore,
  BeachAccess,
  Terrain,
  Restaurant,
  Spa,
  DirectionsBike,
  Diamond,
  FamilyRestroom,
  CheckCircle,
  Notifications,
  Settings,
  Logout,
  Dashboard as DashboardIcon,
  Timeline,
  RocketLaunch,
  WorkspacePremium,
  Celebration,
  AttachMoney,
  Menu as MenuIcon,
  Close as CloseIcon,
  BookmarkBorder as BookingsIcon,
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import { tripAPI } from '../services/api';
import { RootState } from '../store';
import TripCard from '../components/TripCard';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0,191,165,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,191,165,0.15)',
    borderColor: '#00BFA5',
  },
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.1)})`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: -5,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: theme.palette.primary.main,
    border: '3px solid white',
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
  },
}));

const InterestChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 0.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,191,165,0.2)',
  },
  '&.selected': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: 'white',
  },
}));

const BadgeIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  animation: `${float} 3s ease-in-out infinite`,
}));

// Available interests with icons
const availableInterests = [
  { value: 'aventure', label: 'Aventure', icon: <Terrain />, color: '#FF6B6B' },
  { value: 'plage', label: 'Plage', icon: <BeachAccess />, color: '#4ECDC4' },
  { value: 'culture', label: 'Culture', icon: <Explore />, color: '#45B7D1' },
  { value: 'gastronomie', label: 'Gastronomie', icon: <Restaurant />, color: '#FFA07A' },
  { value: 'nature', label: 'Nature', icon: <Spa />, color: '#95E1D3' },
  { value: 'sport', label: 'Sport', icon: <DirectionsBike />, color: '#FFD93D' },
  { value: 'luxe', label: 'Luxe', icon: <Diamond />, color: '#B983FF' },
  { value: 'famille', label: 'Famille', icon: <FamilyRestroom />, color: '#94B49F' },
];

// Badges based on travel count
const getBadge = (tripCount: number) => {
  if (tripCount >= 20) return {
    name: 'Explorateur Légendaire',
    color: '#FFD700',
    icon: <WorkspacePremium sx={{ fontSize: 40 }} />,
    next: null,
  };
  if (tripCount >= 10) return {
    name: 'Maître Aventurier',
    color: '#C0C0C0',
    icon: <EmojiEvents sx={{ fontSize: 40 }} />,
    next: { target: 20, name: 'Explorateur Légendaire' },
  };
  if (tripCount >= 5) return {
    name: 'Voyageur Confirmé',
    color: '#CD7F32',
    icon: <Celebration sx={{ fontSize: 40 }} />,
    next: { target: 10, name: 'Maître Aventurier' },
  };
  if (tripCount >= 1) return {
    name: 'Explorateur Débutant',
    color: '#00BFA5',
    icon: <RocketLaunch sx={{ fontSize: 40 }} />,
    next: { target: 5, name: 'Voyageur Confirmé' },
  };
  return {
    name: 'Nouveau Voyageur',
    color: '#64748B',
    icon: <FlightTakeoff sx={{ fontSize: 40 }} />,
    next: { target: 1, name: 'Explorateur Débutant' },
  };
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [pastTrips, setPastTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [editingInterests, setEditingInterests] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      // Load user's bookings
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

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
  const progressToNext = badge.next ? (totalTrips / badge.next.target) * 100 : 100;

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      }}>
        <Zoom in>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#00BFA5', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Chargement de votre espace...
            </Typography>
          </Box>
        </Zoom>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
      pt: 4,
      pb: 8,
    }}>
      {/* Background decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,191,165,0.1) 0%, transparent 70%)',
        animation: `${float} 20s ease-in-out infinite`,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,71,161,0.1) 0%, transparent 70%)',
        animation: `${float} 15s ease-in-out infinite reverse`,
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Welcome Header with Menu */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Bon retour, {user?.first_name} ! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Voici un résumé de vos aventures
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Notifications">
                  <IconButton sx={{ bgcolor: 'background.paper', boxShadow: 2 }}>
                    <Badge badgeContent={3} color="primary">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Menu">
                  <IconButton 
                    onClick={handleMenuOpen}
                    sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Menu Popup */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              mt: 1,
            }
          }}
        >
          <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" sx={{ color: '#00BFA5' }} />
            </ListItemIcon>
            <ListItemText>Tableau de bord</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => { navigate('/bookings'); handleMenuClose(); }}>
            <ListItemIcon>
              <BookingsIcon fontSize="small" sx={{ color: '#00BFA5' }} />
            </ListItemIcon>
            <ListItemText>Mes réservations</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => { navigate('/saved'); handleMenuClose(); }}>
            <ListItemIcon>
              <Favorite fontSize="small" sx={{ color: '#00BFA5' }} />
            </ListItemIcon>
            <ListItemText>Mes favoris</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem 
            onClick={() => { handleLogout(); handleMenuClose(); }} 
            sx={{ color: '#FF6D00' }}
          >
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: '#FF6D00' }} />
            </ListItemIcon>
            <ListItemText>Déconnexion</ListItemText>
          </MenuItem>
        </Menu>

        <Grid container spacing={3}>
          {/* Left Sidebar - Profile Card */}
          <Grid item xs={12} md={4}>
            <Zoom in timeout={500}>
              <GlassPaper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  position: 'sticky',
                  top: 24,
                }}
              >
                {/* Profile Header with Cover */}
                <Box
                  sx={{
                    height: 100,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #00BFA5 0%, #0D47A1 100%)',
                    position: 'relative',
                    mb: 6,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      position: 'absolute',
                      bottom: -50,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      border: '4px solid white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                      fontSize: '2.5rem',
                    }}
                  >
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </Avatar>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {user?.email}
                  </Typography>
                  
                  {/* Badge/Rank */}
                  <BadgeIcon sx={{ mx: 'auto', mb: 2, bgcolor: `${badge.color}20`, color: badge.color }}>
                    {badge.icon}
                  </BadgeIcon>
                  <Typography variant="h6" sx={{ color: badge.color, fontWeight: 600 }}>
                    {badge.name}
                  </Typography>
                  
                  {/* Progress to next level */}
                  {badge.next && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progression vers {badge.next.name}
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {totalTrips}/{badge.next.target}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progressToNext}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(badge.color, 0.2),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: badge.color,
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Interests */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Centres d'intérêt
                    </Typography>
                    {editingInterests ? (
                      <Button 
                        size="small" 
                        onClick={saveInterests}
                        variant="contained"
                        sx={{ borderRadius: 2 }}
                      >
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
                        <InterestChip
                          key={interest.value}
                          icon={interest.icon}
                          label={interest.label}
                          onClick={() => handleInterestToggle(interest.value)}
                          className={interests.includes(interest.value) ? 'selected' : ''}
                          sx={{
                            bgcolor: interests.includes(interest.value) 
                              ? interest.color 
                              : 'transparent',
                            color: interests.includes(interest.value) ? 'white' : 'text.primary',
                          }}
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
                              icon={interestObj?.icon}
                              label={interestObj?.label}
                              size="small"
                              sx={{
                                borderRadius: 2,
                                bgcolor: `${interestObj?.color}20`,
                                color: interestObj?.color,
                              }}
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
                          bgcolor: alpha('#FFA500', 0.1),
                          textAlign: 'center',
                        }}
                      >
                        <AccessTime sx={{ fontSize: 40, color: '#FFA500', mb: 1 }} />
                        <Typography variant="body1" fontWeight={600} color="#FFA500">
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
                          borderColor: '#00BFA5',
                          color: '#00BFA5',
                          '&:hover': {
                            bgcolor: alpha('#00BFA5', 0.05),
                            borderColor: '#0D47A1',
                          },
                        }}
                      >
                        Devenir organisateur
                      </Button>
                    )}
                  </Box>
                )}

                {/* Quick Actions */}
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="text"
                        startIcon={<History />}
                        onClick={() => navigate('/bookings')}
                        sx={{color: '#FF6D00', justifyContent: 'flex-start' }}
                      >
                        Mes réservations
                      </Button>
                    </Grid>
                   
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="text"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        sx={{ color: '#FF6D00', justifyContent: 'flex-start' }}
                      >
                        Déconnexion
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </GlassPaper>
            </Zoom>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Stats Cards - SUPPRIMÉS */}

            {/* Upcoming Trips Timeline */}
            <GlassPaper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CalendarMonth sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Voyages à venir
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {upcomingTrips.length} voyage{upcomingTrips.length !== 1 ? 's' : ''} planifié{upcomingTrips.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>

              {upcomingTrips.length > 0 ? (
                <Box sx={{ position: 'relative' }}>
                  {upcomingTrips.map((booking: any, index: number) => (
                    <Grow in timeout={500 + index * 100} key={booking.id}>
                      <TimelineItem>
                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              borderColor: 'primary.main',
                              boxShadow: '0 8px 24px rgba(0,191,165,0.1)',
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
                                  {booking.trip?.destination || 'Destination non spécifiée'}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip 
                              label={booking.status || 'Confirmé'} 
                              size="small" 
                              sx={{
                                bgcolor: alpha('#00BFA5', 0.1),
                                color: '#00BFA5',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {booking.trip_session?.start_date} - {booking.trip_session?.end_date}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AttachMoney sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {booking.total_price} {booking.currency}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              endIcon={<ArrowForward />}
                              onClick={() => navigate(`/trips/${booking.trip?.id}`)}
                              sx={{ borderRadius: 2 }}
                            >
                              Voir détails
                            </Button>
                          </Box>
                        </Paper>
                      </TimelineItem>
                    </Grow>
                  ))}
                </Box>
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                  }}
                >
                  <FlightTakeoff sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Aucun voyage à venir
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Commencez à planifier votre prochaine aventure !
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/trips')}
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                    }}
                  >
                    Découvrir des voyages
                  </Button>
                </Paper>
              )}
            </GlassPaper>

            {/* Past Trips */}
            <GlassPaper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2,
                  bgcolor: alpha('#64748B', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <History sx={{ color: '#64748B' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Voyages passés
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pastTrips.length} voyage{pastTrips.length !== 1 ? 's' : ''} effectué{pastTrips.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>

              {pastTrips.length > 0 ? (
                <Grid container spacing={2}>
                  {pastTrips.slice(0, 4).map((booking: any, index: number) => (
                    <Grid item xs={12} sm={6} key={booking.id}>
                      <Fade in timeout={500 + index * 100}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            opacity: 0.9,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              opacity: 1,
                              borderColor: 'primary.main',
                            },
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {booking.trip?.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            {booking.trip_session?.start_date}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              onClick={() => navigate(`/trips/${booking.trip?.id}`)}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Revivre l'expérience
                            </Button>
                          </Box>
                        </Paper>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Aucun voyage passé
                </Typography>
              )}
            </GlassPaper>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <GlassPaper sx={{ p: 3, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #FF6B6B, #FFA07A)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <TrendingUp sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Recommandés pour vous
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Basés sur vos centres d'intérêt
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    variant="text" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/trips')}
                    sx={{ color: '#00BFA5' }}
                  >
                    Voir tout
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {recommendations.map((trip: any, index: number) => (
                    <Grid item xs={12} sm={6} key={trip.id}>
                      <Zoom in timeout={500 + index * 100}>
                        <Box>
                          <TripCard trip={trip} />
                        </Box>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              </GlassPaper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;