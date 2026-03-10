import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Rating,
  Avatar,
  Badge,
  Fade,
  Zoom,
  Grow,
  Slide,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { tripAPI, destinationAPI, searchAI, fixImageUrl } from '../services/api';
import { RootState } from '../store/index';
import TripCard from '../components/TripCard';

// Animations keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const slowZoom = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
`;

// Hero images for infinite scroll
const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1920&q=80',
    title: 'Aventure en Montagne',
    location: 'Atlas, Maroc',
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    title: 'Plages Paradisiaques',
    location: 'Djerba, Tunisie',
  },
  {
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&q=80',
    title: 'Désert du Sahara',
    location: 'Douz, Tunisie',
  },
  {
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=80',
    title: 'Médinas Historiques',
    location: 'Tunis, Tunisie',
  },
];

// Styled components
const HorizontalScroll = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  gap: theme.spacing(3),
  padding: theme.spacing(2, 1),
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: 4,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.3),
    },
  },
}));

const DestinationCard = styled(Card)(({ theme }) => ({
  minWidth: 280,
  maxWidth: 280,
  height: 320,
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
    '& .destination-image': {
      transform: 'scale(1.1)',
    },
    '& .destination-content': {
      transform: 'translateY(0)',
    },
  },
}));

const DestinationImage = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  transition: 'transform 0.5s ease',
});

const DestinationContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
  color: 'white',
  transform: 'translateY(20px)',
  transition: 'transform 0.3s ease',
}));

const AnimatedBackground = styled(Box)({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.05)',
  animation: `${float} 6s ease-in-out infinite`,
});

const HeroBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  transition: 'opacity 1.5s ease-in-out',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)',
  },
}));

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
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFeaturedTrips();
    loadDestinations();
    if (token && user) {
      loadRecommendations();
    }
    
    // Hero image infinite scroll - seulement l'image change, pas le contenu
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const loadFeaturedTrips = async () => {
    try {
      const response = await tripAPI.list({ limit: 10 });
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
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      navigate(`/trips?${params.toString()}`);
    }
  };

  const handleHeroNext = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  const handleHeroPrev = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const scrollDestinations = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section avec arrière-plan qui change seulement */}
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          minHeight: 700,
          overflow: 'hidden',
        }}
      >
        {/* Images d'arrière-plan avec transition en fondu */}
        {HERO_IMAGES.map((image, index) => (
          <HeroBackground
            key={index}
            sx={{
              backgroundImage: `url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === currentHeroIndex ? 1 : 0,
              zIndex: index === currentHeroIndex ? 1 : 0,
            }}
          />
        ))}
        
        {/* Éléments décoratifs animés (restent stables) */}
        <AnimatedBackground
          sx={{
            top: '10%',
            left: '5%',
            width: 300,
            height: 300,
            animationDelay: '0s',
            zIndex: 2,
          }}
        />
        <AnimatedBackground
          sx={{
            bottom: '20%',
            right: '10%',
            width: 200,
            height: 200,
            animationDelay: '2s',
            animationDirection: 'reverse',
            zIndex: 2,
          }}
        />
        
        {/* Contenu fixe qui ne change pas avec les images */}
        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'white', width: '100%' }}>
            {/* Location Chip - change avec l'image mais en douceur */}
            <Fade key={currentHeroIndex} in={true} timeout={1000}>
              <Chip
                label={HERO_IMAGES[currentHeroIndex].location}
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontSize: '1rem',
                  px: 2,
                }}
              />
            </Fade>
            
            {/* Titre principal - change avec l'image mais en douceur */}
            <Fade key={`title-${currentHeroIndex}`} in={true} timeout={1500}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '3rem', md: '5rem' },
                  mb: 2,
                  textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                }}
              >
                {HERO_IMAGES[currentHeroIndex].title}
              </Typography>
            </Fade>
            
            {/* Sous-titre - reste fixe */}
            <Typography
              variant="h5"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
                opacity: 0.9,
              }}
            >
              Découvrez des expériences uniques avec TripBooking
            </Typography>

            {/* Barre de recherche - FIXE, ne change pas avec les images */}
            <Paper
              component="form"
              onSubmit={(e) => { e.preventDefault(); handleSmartSearch(); }}
              sx={{
                maxWidth: 700,
                mx: 'auto',
                p: 1,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <SearchIcon sx={{ mx: 2, color: 'primary.main' }} />
              <TextField
                fullWidth
                inputRef={searchInputRef}
                placeholder="Où voulez-vous aller ? (ex: Djerba, montagne, budget 500 DT...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                variant="standard"
                InputProps={{ 
                  disableUnderline: true,
                  sx: { 
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    py: 1,
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  mx: 1,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                  whiteSpace: 'nowrap',
                }}
              >
                Rechercher
              </Button>
            </Paper>

            {/* Suggestions de recherche rapide - apparaissent au focus */}
            <Fade in={isSearchFocused}>
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {['Djerba', 'Sahara', 'Montagne', 'Historique', 'Plage'].map((suggestion) => (
                  <Chip
                    key={suggestion}
                    label={suggestion}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      searchInputRef.current?.focus();
                    }}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Fade>
          </Box>
        </Container>

        {/* Hero Navigation Buttons */}
        <IconButton
          onClick={handleHeroPrev}
          sx={{
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            zIndex: 4,
          }}
        >
          <ChevronLeftIcon fontSize="large" />
        </IconButton>
        
        <IconButton
          onClick={handleHeroNext}
          sx={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            zIndex: 4,
          }}
        >
          <ChevronRightIcon fontSize="large" />
        </IconButton>

        {/* Hero Indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 4,
          }}
        >
          {HERO_IMAGES.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: index === currentHeroIndex ? 'white' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Le reste du code reste identique... */}
      {/* Popular Destinations Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
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
                Explorez les destinations les plus prisées
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={() => scrollDestinations('left')}
                sx={{ 
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'background.paper', boxShadow: 4 }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton 
                onClick={() => scrollDestinations('right')}
                sx={{ 
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'background.paper', boxShadow: 4 }
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          </Box>

          {destinationsLoading ? (
            <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ minWidth: 280 }}>
                  <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ position: 'relative' }}>
              <HorizontalScroll ref={scrollRef}>
                {destinations.map((destination, index) => (
                  <Grow
                    key={destination.id}
                    in={true}
                    timeout={1000}
                    style={{ transformOrigin: '0 0 0' }}
                  >
                    <DestinationCard
                      onClick={() => navigate(`/trips?destination=${destination.name.toLowerCase()}`)}
                    >
                      <DestinationImage
                        className="destination-image"
                        sx={{
                          backgroundImage: `url(${destination.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      
                      <Badge
                        badgeContent={getDestinationIcon(destination.name)}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          '& .MuiBadge-badge': {
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#00BFA5',
                            fontSize: 20,
                          }
                        }}
                      />
                      
                      <DestinationContent className="destination-content">
                        <Typography variant="h5" fontWeight={700}>
                          {destination.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          {destination.country}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" fontWeight={700}>
                            {destination.min_price || destination.price} DT
                          </Typography>
                          <Chip 
                            label={`${destination.trips_count} voyages`} 
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </DestinationContent>
                    </DestinationCard>
                  </Grow>
                ))}
              </HorizontalScroll>
            </Box>
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
          <AnimatedBackground
            sx={{
              top: -50,
              right: -50,
              width: 400,
              height: 400,
              animation: `${float} 20s ease-in-out infinite`,
            }}
          />
          
          <AnimatedBackground
            sx={{
              bottom: -50,
              left: -50,
              width: 300,
              height: 300,
              animation: `${float} 15s ease-in-out infinite reverse`,
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Slide direction="down" in={true} timeout={1000}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    Recommandations pour vous
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Basé sur vos préférences de voyage
                  </Typography>
                </Box>
              </Box>
            </Slide>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {recommendations.map((trip: any, index) => (
                <Grid item xs={12} sm={6} md={3} key={trip.id}>
                  <Zoom in={true} timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={fixImageUrl(trip.images?.find((img: any) => img.is_cover)?.url || trip.images?.[0]?.url) || '/placeholder.jpg'}
                        alt={trip.title}
                        sx={{ transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="h2" fontWeight={600} noWrap>
                          {trip.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                          {trip.short_description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight={700}>
                            {trip.base_price} {trip.currency}
                          </Typography>
                          <Chip 
                            label={`${trip.duration_days} jours`} 
                            size="small"
                            sx={{ backgroundColor: 'rgba(0,191,165,0.1)' }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Featured Trips Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Voyages en Vedette
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Les expériences les plus populaires du moment
              </Typography>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/trips')}
              sx={{ borderRadius: 3 }}
            >
              Voir tout
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ minWidth: 280 }}>
                  <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <HorizontalScroll>
              {featuredTrips.map((trip: any, index) => (
                <Grow
                  key={trip.id}
                  in={true}
                  timeout={1000}
                  style={{ transformOrigin: '0 0 0' }}
                >
                  <Box sx={{ minWidth: 280, maxWidth: 320 }}>
                    <TripCard trip={trip} />
                  </Box>
                </Grow>
              ))}
            </HorizontalScroll>
          )}
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, background: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Slide direction="up" in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Comment ça marche ?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Réservez votre voyage en quelques étapes simples
              </Typography>
            </Box>
          </Slide>

          <Grid container spacing={4}>
            {[
              {
                icon: <SearchIcon sx={{ fontSize: 40 }} />,
                title: 'Recherchez',
                description: 'Explorez parmi des centaines de voyages disponibles',
                color: '#00BFA5',
              },
              {
                icon: <HowToRegIcon sx={{ fontSize: 40 }} />,
                title: 'Réservez',
                description: 'Choisissez vos dates et réservez en quelques clics',
                color: '#0D47A1',
              },
              {
                icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
                title: 'Profitez',
                description: 'Vivez une expérience inoubliable',
                color: '#00BFA5',
              },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in={true} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 4,
                      height: '100%',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: alpha(step.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        color: step.color,
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
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      {!token && (
        <Box
          sx={{
            py: { xs: 6, md: 10 },
            background: 'linear-gradient(135deg, #1A2027 0%, #2D3748 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Slide direction="up" in={true} timeout={1000}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>
                    Prêt à vivre l'aventure ?
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontSize: '1.1rem' }}>
                    Créez un compte gratuitement et bénéficiez de recommandations personnalisées 
                    grâce à notre intelligence artificielle.
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
                      }}
                    >
                      Se connecter
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Slide>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Home;