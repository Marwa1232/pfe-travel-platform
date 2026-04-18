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
import { tripAPI, destinationAPI, searchAI, recommendationAPI, reviewAPI, fixImageUrl } from '../services/api';
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
    url: 'https://images.unsplash.com/photo-1771325676184-44d8035e3cd1?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
  gap: theme.spacing(6),
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
  minWidth: 260,
  maxWidth: 260,
  height: 300,
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
  organizer?: { id: number; agency_name?: string };
  avg_rating?: number;
  total_reviews?: number;
  agency_name?: string;
}

const normalizeTripImages = (images: any): Array<{ url: string; is_cover: boolean }> => {
  if (Array.isArray(images)) {
    return images
      .filter((img: any) => img && img.url)
      .map((img: any) => ({ url: img.url, is_cover: Boolean(img.is_cover) }));
  }
  if (images && typeof images === 'object') {
    if (Array.isArray(images['hydra:member'])) {
      return images['hydra:member']
        .filter((img: any) => img && img.url)
        .map((img: any) => ({ url: img.url, is_cover: Boolean(img.is_cover) }));
    }
    return (Object.values(images) as any[])
      .filter((img: any) => img && typeof img === 'object' && img.url)
      .map((img: any) => ({ url: img.url, is_cover: Boolean(img.is_cover) }));
  }
  return [];
};

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
    loadRecommendations(); // Always load recommendations (trending trips)
    
    // Hero image infinite scroll - seulement l'image change, pas le contenu
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const loadFeaturedTrips = async () => {
    try {
      console.log('Loading featured trips...');
      const response = await tripAPI.list({ limit: 10 });
      console.log('Featured trips response:', response.data);
      // Handle both Hydra format and regular array response
      let trips = response.data;
      if (trips && typeof trips === 'object') {
        trips = trips['hydra:member'] || trips;
      }
      setFeaturedTrips(Array.isArray(trips) ? trips : []);
    } catch (error) {
      console.error('Error loading trips:', error);
      setFeaturedTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const response = await destinationAPI.list();
      const data = response.data;
      setDestinations(Array.isArray(data) ? data : data['hydra:member'] || []);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setDestinationsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await recommendationAPI.getTrending(4);
      const data = response.data;
      console.log('Trending response:', data);
      if (data.trending && Array.isArray(data.trending) && data.trending.length > 0) {
        const tripsWithReviews = await Promise.all(
          data.trending.map(async (item: any) => {
            const trip = item.trip;
            try {
              const reviewRes = await reviewAPI.getTripReviews(trip.id);
              const reviewData = reviewRes.data || {};

              return {
                ...trip,
                images: trip.images || [],
                avg_rating: Number(reviewData.avg_rating ?? 0),
                total_reviews: Number(reviewData.total ?? 0),
                agency_name: trip.organizer?.agency_name || trip.organizer?.agencyName || `Agence #${trip.organizer?.id ?? '-'}`,
              };
            } catch (reviewError) {
              console.warn(`Could not load reviews for trip ${trip.id}:`, reviewError);
              return {
                ...trip,
                images: trip.images || [],
                avg_rating: 0,
                total_reviews: 0,
                agency_name: trip.organizer?.agency_name || trip.organizer?.agencyName || `Agence #${trip.organizer?.id ?? '-'}`,
              };
            }
          })
        );
        console.log('Loaded trips with reviews:', tripsWithReviews);
        setRecommendations(tripsWithReviews);
      } else {
        console.log('No trending trips found');
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    }
  };

  const handleSmartSearch = async () => {
    try {
      console.log('AI Search request:', searchQuery);
      const response = await searchAI.smartSearch(searchQuery);
      console.log('AI Search response status:', response.status);
      console.log('AI Search response data:', response.data);
      const parsed = response.data;
      
      console.log('Parsed response:', parsed);
      
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Always pass trip IDs if available (this ensures exact AI search results are used)
      if (parsed && parsed.trips && parsed.trips.length > 0) {
        const tripIds = parsed.trips.map((t: any) => t.id);
        params.append('ids', tripIds.join(','));
        console.log('Using AI search trip IDs:', tripIds);
      }
      
      // Also add AI-parsed filters for reference (but TripList will use IDs primarily)
      if (parsed && parsed.ai_analysis && !parsed.ai_warning) {
        if (parsed.ai_analysis?.destination) {
          params.append('destination', parsed.ai_analysis.destination);
        }
        if (parsed.ai_analysis?.max_price) {
          params.append('max_price', parsed.ai_analysis.max_price.toString());
        }
        if (parsed.ai_analysis?.category) {
          params.append('category', parsed.ai_analysis.category);
        }
        console.log('Also added AI-parsed filters');
      }
      
      const url = `/trips?${params.toString()}`;
      console.log('Navigating to:', url);
      navigate(url);
    } catch (error: any) {
      console.error('AI search error:', error?.response?.data || error?.message || error);
      // Fallback: just do basic search
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

  // Auto-scroll infini pour destinations
  useEffect(() => {
    const row = scrollRef.current;
    if (!row || destinations.length === 0) return;

    let animId: number;
    let isPaused = false;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const speed = 1.2; // px par frame — vitesse augmentée

    const animate = () => {
      if (!isPaused && row) {
        row.scrollLeft += speed;
        // quand on atteint la moitié (les items sont doublés), on revient au début silencieusement
        if (row.scrollLeft >= row.scrollWidth / 2) {
          row.scrollLeft = 0;
        }
        // update scale + info reveal
        const center = row.scrollLeft + row.clientWidth / 2;
        row.querySelectorAll<HTMLElement>('[data-dest-card]').forEach((card) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(center - cardCenter);
          const isActive = dist < card.offsetWidth * 0.6;
          card.style.transform = isActive ? 'scale(1)' : 'scale(0.85)';
          card.style.opacity = isActive ? '1' : '0.5';
          // show/hide info overlay
          const info = card.querySelector<HTMLElement>('[data-card-info]');
          if (info) {
            info.style.opacity = isActive ? '1' : '0';
            info.style.transform = isActive ? 'translateY(0)' : 'translateY(10px)';
          }
        });
        // progress bar removed
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // pause on hover
    const onEnter = () => { isPaused = true; };
    const onLeave = () => { if (!isDown) isPaused = false; };
    row.addEventListener('mouseenter', onEnter);
    row.addEventListener('mouseleave', onLeave);

    // drag to scroll
    const onDown = (e: MouseEvent) => { isDown = true; isPaused = true; startX = e.pageX - row.offsetLeft; scrollLeft = row.scrollLeft; };
    const onUp = () => { isDown = false; isPaused = false; };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      row.scrollLeft = scrollLeft - (e.pageX - row.offsetLeft - startX) * 1.2;
      if (row.scrollLeft >= row.scrollWidth / 2) row.scrollLeft = 0;
      if (row.scrollLeft < 0) row.scrollLeft = row.scrollWidth / 2 - row.clientWidth;
    };

    row.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    row.addEventListener('mousemove', onMove);

    return () => {
      cancelAnimationFrame(animId);
      row.removeEventListener('mouseenter', onEnter);
      row.removeEventListener('mouseleave', onLeave);
      row.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      row.removeEventListener('mousemove', onMove);
    };
  }, [destinations]);



  return (
    <Box sx={{ overflow: 'hidden' }}>
     {/* Hero Section avec arrière-plan qui change seulement */}
        <Box
          sx={{
            position: 'relative',
            width: 'min(1200px, calc(100% - 24px))', 
            mx: 'auto',
            mt: { xs: 10, md: 12 },
            height: { xs: '62vh', md: '70vh' },
            minHeight: { xs: 300, md: 380 },
            maxHeight: 600,
            borderRadius: { xs: '46px', md: '54px' },
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
                maxWidth: 1100,
                width: '100%',
                mx: 'auto',
                minHeight: { xs: 64, md: 74 },
                px: { xs: 1.2, md: 1.6 },
                py: { xs: 0.6, md: 0.8 },
                borderRadius: '999px',
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
                    py: { xs: 1.1, md: 1.4 },

                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  mx: 1,
                  px: { xs: 3, md: 4.5 },
                  py: { xs: 1.2, md: 1.5 },
                  borderRadius: '999px',
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

      {/* Popular Destinations Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#0D47A1' }}>
                Destinations populaires
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Les destinations préférées de nos voyageurs
              </Typography>
            </Box>
            <Button
              variant="outlined"
              component={Link}
              to="/destinations"
              size="small"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 2, borderColor: '#00BFA5', color: '#00BFA5', '&:hover': { borderColor: '#0D47A1', bgcolor: alpha('#00BFA5', 0.04) } }}
            >
              Voir tout
            </Button>
          </Box>

          {destinationsLoading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <>
              {/* Scroll row */}
              <Box
                ref={scrollRef}
                sx={{
                  display: 'flex',
                  gap: 2.5,
                  overflowX: 'auto',
                  py: 2,
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  px: 4,
                }}
              >
                {[...destinations, ...destinations].map((destination, index) => (
                  <Box
                    key={`${destination.id}-${index}`}
                    data-dest-card
                    onClick={() => navigate(`/trips?destination=${destination.name.toLowerCase()}`)}
                    sx={{
                      minWidth: 300,
                      maxWidth: 300,
                      height: 360,
                      cursor: 'pointer',
                      borderRadius: 2,
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                      transform: index === 0 ? 'scale(1)' : 'scale(0.85)',
                      opacity: index === 0 ? 1 : 0.5,
                      transition: 'transform 0.35s ease, opacity 0.35s ease, box-shadow 0.35s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,0.2)' },
                    }}
                  >
                    {/* Image full card */}
                    <img
                      src={fixImageUrl(destination.image)}
                      alt={destination.name}
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', display: 'block',
                        borderRadius: 8,
                      }}
                    />

                    {/* Overlay gradient to match reference-style card readability */}
                    <Box sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.7) 100%)',
                      borderRadius: 2,
                    }} />

                    {/* Info overlay — hidden by default, revealed when card is center */}
                    <Box
                      data-card-info
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        opacity: index === 0 ? 1 : 0,
                        transform: index === 0 ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'opacity 0.4s ease, transform 0.4s ease',
                      }}
                    >
                      <Chip
                        label={`${destination.trips_count ?? 0} voyages`}
                        size="small"
                        sx={{
                          alignSelf: 'flex-start',
                          bgcolor: 'rgba(0,0,0,0.28)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          height: 30,
                          px: 0.8,
                          borderRadius: '999px',
                          border: '1px solid rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(4px)',
                        }}
                      />
                      <Box sx={{ mt: 1.2 }}>
                        <Typography
                          variant="h3"
                          fontWeight={700}
                          sx={{
                            color: 'white',
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            fontSize: { xs: '2rem', md: '2.2rem' },
                            mb: 1,
                            textShadow: '0 2px 10px rgba(0,0,0,0.45)',
                          }}
                        >
                          {destination.name}
                        </Typography>
                        <Box
                          sx={{
                            width: 62,
                            height: 2,
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            mb: 1.1,
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'rgba(255,255,255,0.95)',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            textShadow: '0 2px 8px rgba(0,0,0,0.45)',
                          }}
                        >
                          {destination.country}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Container>
      </Box>
      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <Box
          sx={{
            py: { xs: 5, md: 8 },
            backgroundColor: '#F8FAFC',
          }}
        >
          <Container maxWidth="lg">
            <Slide direction="down" in={true} timeout={1000}>
              <Box
                sx={{
                  background: 'linear-gradient(180deg,rgb(83, 149, 159) 0%,rgb(32, 54, 90) 100%)',
                  borderRadius: 1,
                  p: { xs: 2, md: 3 },
                  boxShadow: '0 16px 38px rgba(17, 24, 39, 0.24)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <AutoAwesomeIcon sx={{ color: '#BBD4FF', fontSize: 26 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                    {token ? 'Recommandations pour vous' : 'Tendances du moment qui inspirent nos voyageurs'}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)', mb: 2.5 }}>
                  {token ? 'Basé sur vos préférences de voyage' : 'Découvrez des expériences recommandées cette semaine'}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 0.5,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {recommendations.map((trip: any, index) => {
                    return (
                      <Zoom in={true} timeout={1000} style={{ transitionDelay: `${index * 90}ms` }} key={trip.id}>
                        <Card
                          sx={{
                            minWidth: { xs: 320, md: 335 },
                            maxWidth: { xs: 320, md: 335 },
                            borderRadius: 1,
                            p: 2,
                            bgcolor: 'rgba(255,255,255,0.98)',
                            boxShadow: '0 8px 24px rgba(6, 12, 24, 0.2)',
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.97rem',
                              color: '#0F172A',
                              lineHeight: 1.25,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 0.8,
                              textDecoration: 'underline',
                              textUnderlineOffset: '2px',
                            }}
                          >
                            {trip.title}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                            <Rating
                              value={Number(trip.avg_rating || 0)}
                              precision={0.1}
                              readOnly
                              size="small"
                            />
                            <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                              {(trip.avg_rating || 0).toFixed(1)} ({trip.total_reviews || 0} avis)
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: '#FF5A36', fontSize: '0.82rem', fontWeight: 700 }}>
                              {(trip.agency_name || 'A').charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                              {trip.agency_name || 'Agence'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                              - {trip.duration_days} jours
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{
                              color: '#1F2937',
                              minHeight: 72,
                              mb: 1.2,
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {trip.short_description || 'Expérience recommandée par notre communauté de voyageurs.'}
                          </Typography>
                         {/* Images with +N overlay + placeholder fallback */}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {(() => {
                                const PLACEHOLDERS = [
                                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&q=60',
                                  'https://images.unsplash.com/photo-1528127269322-539801943592?w=120&q=60',
                                  'https://images.unsplash.com/photo-1548013146-72479768bada?w=120&q=60',
                                ];

                                const nonCoverImages = trip.images?.filter((img: any) => !img.is_cover) || [];
                                const allImages = nonCoverImages.length > 0 ? nonCoverImages : (trip.images || []);

                                const finalImages = allImages.length > 0
                                  ? allImages.map((img: any) => ({ url: fixImageUrl(img?.url), real: true }))
                                  : PLACEHOLDERS.map(url => ({ url, real: false }));

                                const MAX_VISIBLE = 3;
                                const visible = finalImages.slice(0, MAX_VISIBLE);
                                const hiddenCount = Math.max(0, allImages.length - MAX_VISIBLE);

                                return visible.map((img: any, i: number) => {
                                  const isLast = i === MAX_VISIBLE - 1 && hiddenCount > 0;
                                  return (
                                    <Box
                                      key={i}
                                      sx={{
                                        position: 'relative',
                                        width: 60,
                                        height: 60,
                                        borderRadius: 0.5,
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Box
                                        component="img"
                                        src={img.url}
                                        alt={`${trip.title} ${i + 1}`}
                                        sx={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          display: 'block',
                                          filter: img.real ? 'none' : 'brightness(0.85) saturate(0.7)',
                                        }}
                                      />
                                      {isLast && (
                                        <Box sx={{
                                          position: 'absolute',
                                          inset: 0,
                                          bgcolor: 'rgba(0,0,0,0.52)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                                            +{hiddenCount}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  );
                                });
                              })()}
                            </Box>
                        </Card>
                      </Zoom>
                    );
                  })}
                </Box>
              </Box>
            </Slide>
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
          variant="outlined" 
          component={Link} 
          to="/trips"
          size="small"
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            borderRadius: 2,
            borderColor: '#00BFA5',
            color: '#00BFA5',
            '&:hover': {
              borderColor: '#0D47A1',
              bgcolor: alpha('#00BFA5', 0.04),
            }
          }}
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
              {(Array.isArray(featuredTrips) ? featuredTrips : []).map((trip: any, index) => (
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