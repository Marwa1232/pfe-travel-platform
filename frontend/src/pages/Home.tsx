import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Paper,
  Chip,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TerrainIcon from '@mui/icons-material/Terrain';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import ExploreIcon from '@mui/icons-material/Explore';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SearchChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { tripAPI, destinationAPI, searchAI } from '../services/api';
import { RootState } from '../store/index';
import TripCard from '../components/TripCard';

// Types
interface Destination {
  id: number;
  name: string;
  country: string;
  image: string;
  price: number;
  trips_count: number;
  min_price?: number;
}

interface Trip {
  id: number;
  title: string;
  short_description: string;
  base_price: string;
  currency: string;
  duration_days: number;
  images: Array<{ url: string; is_cover: boolean }>;
}

// Destination icons
const getDestinationIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('djerba') || lowerName.includes('beach') || lowerName.includes('mer')) {
    return <BeachAccessIcon />;
  }
  if (lowerName.includes('sahara') || lowerName.includes('désert') || lowerName.includes('montagne')) {
    return <TerrainIcon />;
  }
  if (lowerName.includes('kairouan') || lowerName.includes('histor') || lowerName.includes('culture')) {
    return <HistoryEduIcon />;
  }
  return <ExploreIcon />;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>([]);
  const [recommendations, setRecommendations] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    loadFeaturedTrips();
    loadDestinations();
    if (token && user) {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const loadFeaturedTrips = async () => {
    try {
      const response = await tripAPI.list({ limit: 6 });
      setFeaturedTrips(response.data['hydra:member'] || response.data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const response = await destinationAPI.popular();
      setDestinations(response.data);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setDestinationsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch(`http://localhost:8001/recommendations/${user?.id}?limit=4`);
      const data = await response.json();
      if (data.recommendations && data.recommendations.length > 0) {
        const tripIds = data.recommendations.map((r: any) => r.trip_id);
        const trips = await Promise.all(
          tripIds.map((id: number) => tripAPI.get(id).then((res) => res.data))
        );
        setRecommendations(trips);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleSmartSearch = async () => {
    try {
      // Use AI API to parse natural language query
      const response = await searchAI.smartSearch(searchQuery);
      const parsed = response.data;
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (parsed?.destination) params.append('destination', parsed.destination);
      if (parsed?.max_price) params.append('max_price', parsed.max_price.toString());
      if (parsed?.category) params.append('category', parsed.category);
      
      navigate(`/trips?${params.toString()}`);
    } catch (error) {
      console.error('AI search error:', error);
      // Fallback to basic search
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      navigate(`/trips?${params.toString()}`);
    }
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section with Immersive Background */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.6)',
            transform: 'scale(1.05)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)',
          },
        }}
      >
        {/* Animated decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-20px)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,191,165,0.2) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />

        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 2,
            pt: { xs: 8, md: 0 },
            pb: { xs: 8, md: 0 },
          }}
        >
          {/* Hero Content */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 2,
                textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              Explorez le Monde avec
              <Box
                component="span"
                sx={{
                  display: 'block',
                  background: 'linear-gradient(90deg, #00BFA5, #5DF2D6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TripBooking
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Des expériences inoubliables vous attendent en Tunisie et ailleurs
            </Typography>
          </Box>

          {/* Smart Search Bar */}
          <Paper
            component="form"
            onSubmit={(e) => { e.preventDefault(); handleSmartSearch(); }}
            sx={{
              maxWidth: 800,
              mx: 'auto',
              p: { xs: 2, md: 3 },
              borderRadius: 4,
              background: isSearchFocused 
                ? 'rgba(255,255,255,0.98)' 
                : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: isSearchFocused 
                ? '0 20px 60px rgba(0,0,0,0.3)' 
                : '0 8px 32px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: isSearchFocused ? 2 : 0 }}>
              <SearchIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <TextField
                fullWidth
                placeholder="Essayez: Je souhaite un voyage en montagne en mars avec un budget inférieur à 200 DT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 500,
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(13, 71, 161, 0.4)',
                }}
              >
                Rechercher
              </Button>
            </Box>

            {/* Smart search hints */}
            {isSearchFocused && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Chip
                    icon={<LocationOnIcon fontSize="small" />}
                    label="Destination"
                    size="small"
                    variant="outlined"
                    onClick={() => setSearchQuery(prev => prev + ' à Djerba')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,191,165,0.1)' } }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    icon={<AttachMoneyIcon fontSize="small" />}
                    label="Budget"
                    size="small"
                    variant="outlined"
                    onClick={() => setSearchQuery(prev => prev + ' 500 DT')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,191,165,0.1)' } }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    icon={<CalendarMonthIcon fontSize="small" />}
                    label="Période"
                    size="small"
                    variant="outlined"
                    onClick={() => setSearchQuery(prev => prev + ' en juillet')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,191,165,0.1)' } }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    icon={<TerrainIcon fontSize="small" />}
                    label="Type"
                    size="small"
                    variant="outlined"
                    onClick={() => setSearchQuery(prev => prev + ' aventure')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,191,165,0.1)' } }}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>

          {/* Quick stats */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 2, md: 6 },
              mt: 6,
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '500+', label: 'Voyages' },
              { value: '50+', label: 'Destinations' },
              { value: '10K+', label: 'Voyageurs' },
              { value: '4.8', label: 'Note moyenne' },
            ].map((stat, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#00BFA5',
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Popular Destinations Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(90deg, #1A2027, #64748B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Destinations Populaires
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Découvrez les destinations les plus appréciées par nos voyageurs
            </Typography>
          </Box>

          {destinationsLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
          <Grid container spacing={3}>
            {destinations.map((destination) => (
              <Grid item xs={12} sm={6} md={3} key={destination.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      '& .destination-image': {
                        transform: 'scale(1.1)',
                      },
                      '& .destination-overlay': {
                        opacity: 1,
                      },
                      '& .see-more-btn': {
                        transform: 'translateY(0)',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', height: 280 }}>
                    <Box
                      className="destination-image"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${destination.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <Box
                      className="destination-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)',
                        opacity: 0.7,
                        transition: 'opacity 0.3s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16,
                        color: 'white',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        {getDestinationIcon(destination.name)}
                        <Typography variant="h5" fontWeight={700}>
                          {destination.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {destination.country}
                      </Typography>
                    </Box>
                    <Box
                      className="see-more-btn"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) translateY(10px)',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Button
                        component={Link}
                        to={`/trips?destination=${destination.name.toLowerCase()}`}
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
                          },
                        }}
                      >
                        Voir plus
                      </Button>
                    </Box>
                  </Box>
                  <CardContent sx={{ pt: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        {(destination.min_price || destination.price)} DT
                      </Typography>
                      <Chip 
                        label={`${destination.trips_count} voyages`} 
                        size="small" 
                        sx={{ backgroundColor: 'rgba(0,191,165,0.1)', color: '#00BFA5' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          )}
        </Container>
      </Box>

      {/* AI Recommendations Section */}
      {token && recommendations.length > 0 && (
        <Box
          sx={{
            py: { xs: 6, md: 10 },
            background: 'linear-gradient(135deg, #0D47A1 0%, #00BFA5 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AutoAwesomeIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  Recommandations pour vous
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500 }}>
                Basé sur votre historique de navigation et vos préférences détectées
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {recommendations.map((trip: any) => (
                <Grid item xs={12} sm={6} md={3} key={trip.id}>
                  <Box
                    sx={{
                      '&:hover': {
                        '& .trip-card': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        },
                      },
                    }}
                  >
                    <Card
                      className="trip-card"
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="180"
                        image={trip.images?.find((img: any) => img.is_cover)?.url || trip.images?.[0]?.url || '/placeholder.jpg'}
                        alt={trip.title}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="h2" fontWeight={600}>
                          {trip.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                          {trip.short_description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight={700}>
                            {trip.base_price} {trip.currency}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {trip.duration_days} jours
                          </Typography>
                        </Box>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          component={Link}
                          to={`/trips/${trip.id}`}
                          variant="contained"
                          fullWidth
                          sx={{ borderRadius: 2 }}
                        >
                          Voir détails
                        </Button>
                      </Box>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Featured Trips Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, mb: 5, gap: 2 }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Voyages en Vedette
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Les meilleures offres sélectionnées pour vous
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/trips')}
              sx={{ borderRadius: 3 }}
            >
              Voir tout
            </Button>
          </Box>

          {loading ? (
            <Box 
              sx={{ 
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                pb: 2,
                px: 1,
                mx: -1,
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 4,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  },
                },
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    minWidth: '280px', 
                    maxWidth: '320px',
                    flexShrink: 0,
                  }}
                >
                  <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                pb: 2,
                px: 1,
                mx: -1,
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 4,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  },
                },
              }}
            >
              {featuredTrips.map((trip: any) => (
                <Box 
                  key={trip.id} 
                  sx={{ 
                    minWidth: '280px', 
                    maxWidth: '320px',
                    flexShrink: 0,
                  }}
                >
                  <TripCard trip={trip} />
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* CTA Section for non-authenticated users */}
      {!token && (
        <Box
          sx={{
            py: { xs: 6, md: 10 },
            background: 'linear-gradient(135deg, #1A2027 0%, #2D3748 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(0,191,165,0.1) 0%, transparent 100%)',
            }}
          />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    mb: 3,
                  }}
                >
                  Prêt à vivre l'aventure ?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    mb: 4,
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                  }}
                >
                  Créez un compte gratuitement et bénéficiez de recommandations personnalisées 
                  grâce à notre intelligence artificielle. Réservez vos voyages en quelques clics.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
                      },
                    }}
                  >
                    Créer un compte
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Se connecter
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ position: 'relative', p: 4 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 250,
                      height: 250,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                      opacity: 0.2,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {[
                      { icon: '🎯', text: 'Recommandations personnalisées' },
                      { icon: '💰', text: 'Meilleurs prix garantis' },
                      { icon: '📱', text: 'Réservation rapide' },
                      { icon: '⭐', text: 'Avis vérifiés' },
                    ].map((item, i) => (
                      <Paper
                        key={i}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <Typography variant="h5">{item.icon}</Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                          {item.text}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      {/* How It Works Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: '#FFFFFF',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Comment ça marche ?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Réservez votre voyage en quelques étapes simples
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <SearchIcon sx={{ fontSize: 40, color: '#00BFA5' }} />,
                title: 'Recherchez',
                description: 'Explorez parmi des centaines de voyages disponibles en Tunisie et ailleurs',
              },
              {
                icon: <HowToRegIcon sx={{ fontSize: 40, color: '#00BFA5' }} />,
                title: 'Réservez',
                description: 'Choisissez vos dates et préférences, puis réservez en quelques clics',
              },
              {
                icon: <CheckCircleIcon sx={{ fontSize: 40, color: '#00BFA5' }} />,
                title: 'Profitez',
                description: 'Vivez une expérience inoubliable avec notre service de qualité',
              },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(0, 191, 165, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
