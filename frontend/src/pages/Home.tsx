import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Grid, Card,
  CardContent, TextField, Paper, Chip, Skeleton,
  IconButton, Rating, Avatar, Fade, Zoom, Grow, Slide,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TerrainIcon from '@mui/icons-material/Terrain';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import ExploreIcon from '@mui/icons-material/Explore';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import StarIcon from '@mui/icons-material/Star';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { tripAPI, destinationAPI, searchAI, recommendationAPI, reviewAPI, fixImageUrl } from '../services/api';
import { RootState } from '../store/index';
import TripCard from '../components/TripCard';

// ── Animations ───────────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// ─── Hero images ───────────────────────────────────────────────────
const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90',
    label: 'Atlas, Maroc',
    subtitle: 'Explorez la beauté',
    title: 'MONTAGNES',
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=90',
    label: 'Djerba, Tunisie',
    subtitle: 'Découvrez le paradis',
    title: 'PLAGES',
  },
  {
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=90',
    label: 'Sahara, Tunisie',
    subtitle: 'Traversez',
    title: 'DÉSERT',
  },
  {
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=90',
    label: 'Tunis, Tunisie',
    subtitle: 'Plongez dans',
    title: 'HISTOIRE',
  },
];

// ─── Styled ────────────────────────────────────────────────────────
const HorizontalScroll = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  gap: theme.spacing(3),
  padding: theme.spacing(2, 1),
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': { height: 6 },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': {
    background: alpha('#0EA5A0', 0.3),
    borderRadius: 4,
  },
}));

// ─── Types ─────────────────────────────────────────────────────────
interface Destination {
  id: number; name: string; country: string;
  image: string; price: number; trips_count: number; min_price?: number;
}
interface Trip {
  id: number; title: string; short_description: string;
  base_price: string; currency: string; duration_jours: number;
  images: Array<{ url: string; is_cover: boolean }>;
  organizer?: { id: number; agency_name?: string };
  avg_rating?: number; total_reviews?: number; agency_name?: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Vérification des rôles
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isOrganizer = user?.roles?.includes('ROLE_ORGANIZER');
  const isUser = token && !isAdmin && !isOrganizer;
  const isConnectedUser = isUser; // ROLE_USER connecté
  const isNonConnected = !token;
  const showOrganizerCard = isNonConnected || isUser; // Carte organisateur pour non connecté et ROLE_USER

  const [featuredTrips, setFeaturedTrips]   = useState<Trip[]>([]);
  const [recommendations, setRecommendations] = useState<Trip[]>([]);
  const [destinations, setDestinations]     = useState<Destination[]>([]);
  const [loading, setLoading]               = useState(true);
  const [destLoading, setDestLoading]       = useState(true);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchFocused, setSearchFocused]   = useState(false);
  const [heroIdx, setHeroIdx]               = useState(0);
  const [heroVisible, setHeroVisible]       = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeaturedTrips();
    loadDestinations();
    loadRecommendations();
    const iv = setInterval(() => {
      setHeroVisible(false);
      setTimeout(() => {
        setHeroIdx(p => (p + 1) % HERO_IMAGES.length);
        setHeroVisible(true);
      }, 600);
    }, 6000);
    return () => clearInterval(iv);
  }, [token]);

  const loadFeaturedTrips = async () => {
    try {
      const res = await tripAPI.list({ limit: 10 });
      let trips = res.data;
      if (trips && typeof trips === 'object') trips = trips['hydra:member'] || trips;
      setFeaturedTrips(Array.isArray(trips) ? trips : []);
    } catch { setFeaturedTrips([]); }
    finally { setLoading(false); }
  };

  const loadDestinations = async () => {
    try {
      const res = await destinationAPI.list();
      const d = res.data;
      setDestinations(Array.isArray(d) ? d : d['hydra:member'] || []);
    } catch { }
    finally { setDestLoading(false); }
  };

  const loadRecommendations = async () => {
    try {
      const res = await recommendationAPI.getTrending(4);
      const data = res.data;
      if (data.trending?.length) {
        const trips = await Promise.all(data.trending.map(async (item: any) => {
          const trip = item.trip;
          try {
            const rRes = await reviewAPI.getTripReviews(trip.id);
            return { ...trip, images: trip.images || [], avg_rating: Number(rRes.data?.avg_rating ?? 0), total_reviews: Number(rRes.data?.total ?? 0), agency_name: trip.organizer?.agency_name || `Agence #${trip.organizer?.id ?? '-'}` };
          } catch { return { ...trip, images: trip.images || [], avg_rating: 0, total_reviews: 0 }; }
        }));
        setRecommendations(trips);
      }
    } catch { setRecommendations([]); }
  };

  const handleSearch = async () => {
    try {
      const res = await searchAI.smartSearch(searchQuery);
      const parsed = res.data;
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (parsed?.trips?.length) params.append('ids', parsed.trips.map((t: any) => t.id).join(','));
      navigate(`/trips?${params.toString()}`);
    } catch {
      navigate(`/trips?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Auto-scroll destinations
  useEffect(() => {
    const row = scrollRef.current;
    if (!row || destinations.length === 0) return;
    let animId: number;
    let isPaused = false;
    let scrollLeft = 0;
    const speed = 0.6;
    const animate = () => {
      if (!isPaused && row) {
        row.scrollLeft += speed;
        if (row.scrollLeft >= row.scrollWidth / 2) row.scrollLeft = 0;
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    const onEnter = () => { isPaused = true; };
    const onLeave = () => { isPaused = false; };
    row.addEventListener('mouseenter', onEnter);
    row.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(animId);
      row.removeEventListener('mouseenter', onEnter);
      row.removeEventListener('mouseleave', onLeave);
    };
  }, [destinations]);

  const hero = HERO_IMAGES[heroIdx];

  return (
    <Box sx={{ overflow: 'hidden', bgcolor: '#fff' }}>

      {/* ════════════════════════════════════════════════
          HERO — Fullscreen avec search bar flottante
      ════════════════════════════════════════════════ */}
      <Box sx={{ position: 'relative', width: '100%', height: '100vh', minHeight: 600, maxHeight: 900,  mt: '-72px',pt: '72px'   }}>

        {/* Background images avec crossfade */}
        {HERO_IMAGES.map((img, i) => (
          <Box key={i} sx={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${img.url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            transition: 'opacity 1s ease-in-out',
            opacity: i === heroIdx ? 1 : 0,
            '&::after': {
              content: '""', position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)',
            },
          }} />
        ))}

        {/* Left/Right location labels (style Travalo) */}
        <Box sx={{
          position: 'absolute', top: '50%', left: 40,
          transform: 'translateY(-50%)',
          zIndex: 5, display: { xs: 'none', md: 'flex' },
          flexDirection: 'column', alignItems: 'center', gap: 1,
        }}>
          <IconButton onClick={() => setHeroIdx(p => (p - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 2,
            textTransform: 'uppercase', writingMode: 'vertical-rl', mt: 1 }}>
            {HERO_IMAGES[(heroIdx - 1 + HERO_IMAGES.length) % HERO_IMAGES.length].label}
          </Typography>
        </Box>

        <Box sx={{
          position: 'absolute', top: '50%', right: 40,
          transform: 'translateY(-50%)',
          zIndex: 5, display: { xs: 'none', md: 'flex' },
          flexDirection: 'column', alignItems: 'center', gap: 1,
        }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 2,
            textTransform: 'uppercase', writingMode: 'vertical-rl', mb: 1 }}>
            {HERO_IMAGES[(heroIdx + 1) % HERO_IMAGES.length].label}
          </Typography>
          <IconButton onClick={() => setHeroIdx(p => (p + 1) % HERO_IMAGES.length)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Hero content */}
        <Box sx={{
          position: 'relative', zIndex: 3, height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          px: 2, pb: 12,
        }}>
          {/* Subtitle script */}
          <Fade in={heroVisible} timeout={800}>
            <Typography sx={{
              fontFamily: '"Dancing Script", "Brush Script MT", cursive',
              fontSize: { xs: '1.6rem', md: '2.4rem' },
              color: 'rgba(255,255,255,0.92)',
              letterSpacing: 1, mb: 0,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              animation: `${fadeInUp} 0.8s ease`,
            }}>
              {hero.subtitle}
            </Typography>
          </Fade>

          {/* Big title */}
          <Fade in={heroVisible} timeout={1000}>
            <Typography sx={{
              fontSize: { xs: '14vw', sm: '10vw', md: '9vw', lg: '8vw' },
              fontWeight: 900,
              color: '#fff',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              textShadow: '0 8px 40px rgba(0,0,0,0.3)',
              mb: 2,
              animation: `${fadeInUp} 0.9s ease`,
            }}>
              {hero.title}
            </Typography>
          </Fade>

          {/* Location pill */}
          <Fade in={heroVisible} timeout={1200}>
            <Chip label={hero.label}
              icon={<LocationOnIcon sx={{ fontSize: 14, color: '#fff !important' }} />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
                color: '#fff', fontSize: '0.85rem', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.3)', mb: 3,
                animation: `${fadeInUp} 1s ease`,
              }} />
          </Fade>

          {/* Dots navigation */}
          <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
            {HERO_IMAGES.map((_, i) => (
              <Box key={i} onClick={() => setHeroIdx(i)} sx={{
                width: i === heroIdx ? 32 : 8, height: 4, borderRadius: 2,
                bgcolor: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#fff' },
              }} />
            ))}
          </Box>
        </Box>

        {/* ── Search bar flottante — chevauche hero + section blanche ── */}
        <Box sx={{
          position: 'absolute', bottom: -65, left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '90%', md: '85%' },
          maxWidth: 1100,  zIndex: 10,
        }}>
          <Paper component="form" onSubmit={e => { e.preventDefault(); handleSearch(); }}
            elevation={0}
            sx={{
              display: 'flex', alignItems: 'center',
              bgcolor: '#fff', borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
              px: 2, py: 3,
              border: searchFocused ? '1px solid #0EA5A0' : '2px solid transparent',
              transition: 'border-color 0.2s',
            }}>
            <SearchIcon sx={{ color: '#0EA5A0', fontSize: 24, mr: 1.5, flexShrink: 0 }} />
            <TextField fullWidth variant="standard"
              placeholder="Où voulez-vous aller ? (ex: Djerba, safari, montagne...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              InputProps={{ disableUnderline: true, sx: { fontSize: { xs: '0.9rem', md: '1rem' }, py: 0.8 } }}
            />
            <Button type="submit" variant="contained"
              sx={{
                ml: 1, flexShrink: 0, borderRadius: '12px',
                px: { xs: 2, md: 3.5 }, py: 1.2,
                background: 'linear-gradient(135deg, #0EA5A0, #0F2D5C)',
                textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                '&:hover': { background: 'linear-gradient(135deg, #0c9490, #0d2550)' },
              }}>
              Rechercher
            </Button>
          </Paper>

          {/* Suggestions rapides */}
          <Fade in={searchFocused}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5, px: 1 }}>
              {['Djerba', 'Sahara', 'Montagne', 'Plage', 'Culture'].map(s => (
                <Chip key={s} label={s} size="small" onClick={() => setSearchQuery(s)}
                  sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer',
                    fontSize: '0.8rem', '&:hover': { borderColor: '#0EA5A0', color: '#0EA5A0' } }} />
              ))}
            </Box>
          </Fade>
        </Box>
      </Box>
       
      {/* ════════════════════════════════════════════════
          DESTINATIONS populaires
      ════════════════════════════════════════════════ */}
    
      {/* Popular Destinations Section */}
      <Box sx={{ py: { xs: 4, md: 6 },pt: { xs: 12, md: 20 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
            <Typography sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 800, color: '#0F2D5C' }}>
                Destinations populaires
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#64748B', mb: 4 }}>
                Les destinations préférées de nos voyageurs
              </Typography>
            </Box>
            <Button
              variant="outlined"
              component={Link}
              to="/destinations"
              size="small"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 2, borderColor: '#0d2550', color: '#0d2550', '&:hover': { borderColor: '#0d2550', bgcolor: alpha('#0d2550', 0.04) } }}
            >
              Voir tout
            </Button>
          </Box>
           {destLoading ? (
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


     {/* ════════════════════════════════════════════════
          RECOMMENDATIONS — 
      ════════════════════════════════════════════════ */}
      {recommendations.length > 0 && (
        <Box sx={{
          position: 'relative',
          py: { xs: 6, md: 9 },
          overflow: 'hidden',
          bgcolor: '#F8F9FA',
        }}>

          {/* Watermark montagne en bas */}
          <Box sx={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '100%',
            backgroundImage: 'url(https://i.pinimg.com/736x/fe/17/78/fe17784f7dcf764a6a7cf67dd0511829.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.07,
            filter: 'grayscale(100%)',
          }} />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>

            {/* Header row - Texte dynamique selon le rôle */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon sx={{ color: '#0F2D5C', fontSize: 55 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, fontWeight: 800, color: '#0F2D5C', letterSpacing: '0.05em' }}>
                    {/* Condition: "Recommandations pour vous" uniquement pour ROLE_USER connecté */}
                    {/* Sinon: "Tendances du moment qui inspirent nos voyageurs" */}
                    {isUser ? 'Recommandations pour vous' : 'Tendances du moment qui inspirent nos voyageurs'}
                  </Typography>
                </Box>
              </Box>
              
              <Typography
                onClick={() => navigate('/trips')}
                sx={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#0F2D5C',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Voir tous les voyages →
              </Typography>
            </Box>

            {/* Cards grid */}
            <Grid container spacing={3}>
              {recommendations.slice(0, 3).map((trip: any, i: number) => (
                <Grid item xs={12} md={4} key={trip.id}>
                  <Box
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.22s ease',
                      '&:hover': { transform: 'translateY(-4px)' },
                      '&:hover .trip-img': { transform: 'scale(1.04)' },
                    }}
                  >
                    {/* Image */}
                    <Box sx={{
                      height: 210,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      mb: 1.5,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                    }}>
                      <Box
                        component="img"
                        className="trip-img"
                        src={fixImageUrl(trip.images?.find((img: any) => img.is_cover)?.url || trip.images?.[0]?.url)}
                        alt={trip.title}
                        sx={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          transition: 'transform 0.35s ease',
                        }}
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=70';
                        }}
                      />
                    </Box>

                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                      <Rating value={Number(trip.avg_rating || 5)} precision={0.1} readOnly size="small"
                        sx={{ '& .MuiRating-iconFilled': { color: '#FFB300' } }} />
                      <Typography sx={{ fontSize: '0.78rem', color: '#666' }}>
                        ({trip.total_reviews || 1} Avis{(trip.total_reviews || 1) > 1 ? 's' : ''})
                      </Typography>
                    </Box>

                    {/* Title */}
                    <Typography sx={{
                      fontWeight: 700,
                      fontSize: '0.97rem',
                      color: '#1a1a2e',
                      lineHeight: 1.35,
                      mb: 0.8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {trip.title}
                    </Typography>

                    {/* Duration */}
                    {trip.duration_jours && (
                      <Typography sx={{ fontSize: '0.8rem', color: '#888', mb: 0.4 }}>
                        {trip.duration_days} jours {Math.max(trip.duration_jours - 1, 1)} nuit
                      </Typography>
                    )}

                    {/* Destination */}
                    <Typography sx={{ fontSize: '0.8rem', color: '#888', mb: 1 }}>
                      {trip.destinations?.map((d: any) => d.name).join(', ') || trip.destination || ''}
                    </Typography>

                    {/* Prix */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#999' }}>"À partir de</Typography>
                      {trip.original_price && trip.original_price > trip.base_price && (
                        <Typography sx={{
                          fontSize: '0.82rem',
                          color: '#aaa',
                          textDecoration: 'line-through',
                        }}>
                          ${Number(trip.original_price).toLocaleString()}
                        </Typography>
                      )}
                      <Typography sx={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#FF6D00',
                      }}>
                        {Number(trip.base_price).toLocaleString()} {trip.currency || 'TND'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

          </Container>
        </Box>
      )}
      {/* ════════════════════════════════════════════════
          VOYAGES POPULAIRES
      ════════════════════════════════════════════════ */}
       {/* Featured Trips Section */}
       <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h3" color="#0F2D5C" sx={{ fontWeight: 700, mb: 1 }}>
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
          sx={{ borderRadius: 2, borderColor: '#0d2550', color: '#0d2550', '&:hover': { borderColor: '#0d2550', bgcolor: alpha('#0d2550', 0.04) } }}

        >
          Voir tout
        </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ minWidth: 280 }}>
                  <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <HorizontalScroll>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {(Array.isArray(featuredTrips) ? featuredTrips : []).map((trip: any) => (
                <Grow key={trip.id} in={true} timeout={1000}>
                  <Box sx={{ minWidth: 280, maxWidth: 320 }}>
                    <TripCard trip={trip} />
                  </Box>
                </Grow>
              ))}
            </Box>
          </HorizontalScroll>
          )}
        </Container>
      </Box>
      {/* ════════════════════════════════════════════════
          COMMENT ÇA MARCHE — 3 étapes
      ════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 800, color: '#0F2D5C', mb: 1 }}>
              Comment ça marche ?
            </Typography>
            <Typography sx={{ fontSize: 15, color: '#64748B', maxWidth: 500, mx: 'auto' }}>
              Réservez votre prochain voyage en quelques étapes simples
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { icon: <SearchIcon sx={{ fontSize: 36 }} />, color: '#0EA5A0', bg: alpha('#0EA5A0', 0.08),
                num: '01', title: 'Recherchez', desc: 'Explorez des centaines de voyages avec notre IA et trouvez l\'expérience parfaite selon vos envies et votre budget.' },
              { icon: <HowToRegIcon sx={{ fontSize: 36 }} />, color: '#0F2D5C', bg: alpha('#0F2D5C', 0.08),
                num: '02', title: 'Réservez', desc: 'Choisissez vos dates, confirmez votre réservation et payez en toute sécurité via notre système de paiement Stripe.' },
              { icon: <FlightTakeoffIcon sx={{ fontSize: 36 }} />, color: '#D97706', bg: alpha('#D97706', 0.08),
                num: '03', title: 'Profitez', desc: 'Vivez une expérience inoubliable et gagnez des points fidélité à chaque voyage pour débloquer des réductions exclusives.' },
            ].map((step, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Zoom in timeout={800} style={{ transitionDelay: `${i * 150}ms` }}>
                  <Box sx={{
                    p: 4, borderRadius: '20px', height: '100%',
                    border: '1px solid #E2E8F0', bgcolor: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(0,0,0,0.1)', borderColor: step.color },
                    '&::before': { content: `"${step.num}"`, position: 'absolute', top: 16, right: 20,
                      fontSize: '4rem', fontWeight: 900, color: alpha(step.color, 0.06), lineHeight: 1 },
                  }}>
                    <Box sx={{ width: 68, height: 68, borderRadius: '18px', bgcolor: step.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: step.color, mb: 3 }}>
                      {step.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', mb: 1.5 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.7 }}>
                      {step.desc}
                    </Typography>
                  </Box>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════
          PUBLICITÉ PLATEFORME + CTA ORGANISATEUR
      ════════════════════════════════════════════════ */}
      <Box sx={{ position: 'relative', py: { xs: 7, md: 11 }, overflow: 'hidden', bgcolor: '#fff' }}>
        {/* Background dégradé - now using subtle white/gray gradient */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
        }} />
        {/* Cercles décoratifs with brand colors */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400,
          borderRadius: '50%', bgcolor: 'rgba(14,165,160,0.06)', animation: `${float} 8s ease-in-out infinite` }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300,
          borderRadius: '50%', bgcolor: 'rgba(15,45,92,0.04)', animation: `${float} 10s ease-in-out infinite reverse` }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">

            {/* Left — Stats plateforme */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: { xs: 4, md: 6 } }}>
                <Fade in timeout={800}>
                  <Typography sx={{
                    fontFamily: '"Dancing Script", "Brush Script MT", cursive',
                    fontSize: { xs: '1.6rem', md: '2.4rem' },
                    color: '#0EA5A0',
                    letterSpacing: 1,
                    mb: 1,
                  }}>
                    Voyagez autrement
                  </Typography>
                </Fade>

                <Fade in timeout={1000}>
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '2rem', md: '3.5rem' }, 
                      fontWeight: 800,
                      color: '#0F2D5C', 
                      lineHeight: 1.1,
                      mb: 2,
                    }}
                  >
                    L'excellence du voyage en <br />
                    <Box component="span" sx={{ color: '#0EA5A0' }}>Afrique du Nord.</Box>
                  </Typography>
                </Fade>

                <Fade in timeout={1200}>
                  <Typography 
                    sx={{ 
                      color: '#64748B', 
                      fontSize: '1.1rem', 
                      fontWeight: 500, 
                      maxWidth: '500px',
                      mb: 4,
                    }}
                  >
                    Découvrez des expériences authentiques via notre écosystème complet.
                  </Typography>
                </Fade>
              </Box>

              {/* Stats */}
              <Grid container spacing={2}>
                {[
                  { icon: <GroupsIcon />, value: '10K+', label: 'Voyageurs satisfaits' },
                  { icon: <BusinessCenterIcon />, value: '200+', label: 'Organisateurs certifiés' },
                  { icon: <FlightTakeoffIcon />, value: '500+', label: 'Voyages disponibles' },
                  { icon: <StarIcon />, value: '4.8/5', label: 'Note moyenne' },
                ].map((stat, i) => (
                  <Grid item xs={6} key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 2, borderRadius: '14px', bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0' }}>
                      <Box sx={{ color: '#0EA5A0', '& svg': { fontSize: 22 } }}>{stat.icon}</Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F2D5C', lineHeight: 1 }}>
                          {stat.value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.3 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Right — CTA cards */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {/* Card voyageur - s'affiche uniquement pour les non connectés */}
                {!token && (
                  <Box sx={{
                    p: 3.5, borderRadius: '20px',
                    bgcolor: '#ffffff',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '14px',
                        bgcolor: alpha('#0EA5A0', 0.1), display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#0EA5A0' }}>
                        <FlightTakeoffIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F2D5C' }}>
                          Je suis un voyageur
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Rejoignez +10 000 voyageurs
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', color: '#475569', mb: 2.5, lineHeight: 1.6 }}>
                      Créez votre compte gratuitement et accédez à des recommandations personnalisées, 
                      un système de fidélité et des offres exclusives.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button fullWidth variant="contained" onClick={() => navigate('/register')}
                        sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 700,
                          background: 'linear-gradient(135deg, #0EA5A0, #0F2D5C)',
                          '&:hover': { opacity: 0.9 } }}>
                        Créer un compte
                      </Button>
                      <Button fullWidth variant="outlined" onClick={() => navigate('/login')}
                        sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 600,
                          borderColor: '#0EA5A0', color: '#0EA5A0',
                          '&:hover': { borderColor: '#0F2D5C', color: '#0F2D5C' } }}>
                        Se connecter
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Card organisateur - s'affiche uniquement pour les non connectés ET les ROLE_USER */}
                {showOrganizerCard && (
                  <Box sx={{
                    p: 3.5, borderRadius: '20px',
                    background: 'linear-gradient(135deg, #0F2D5C 0%, #0EA5A0 100%)',
                    border: '1px solid rgba(14,165,160,0.3)',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '14px',
                        bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff' }}>
                        <BusinessCenterIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                          Je suis un organisateur
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                          Développez votre activité
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', mb: 2.5, lineHeight: 1.6 }}>
                      Publiez vos voyages, gérez vos réservations et accédez à un tableau de bord 
                      complet pour développer votre agence de voyage.
                    </Typography>

                    {/* Étapes devenir organisateur */}
                    {[
                      { step: '1', text: 'Inscrivez-vous et créez votre profil' },
                      { step: '2', text: 'Soumettez une demande d\'organisateur' },
                      { step: '3', text: 'Publiez vos voyages après validation' },
                    ].map(s => (
                      <Box key={s.step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#0EA5A0' }}>{s.step}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.85)' }}>{s.text}</Typography>
                      </Box>
                    ))}

                    <Button fullWidth variant="contained" onClick={() => navigate(token ? '/organizer-request' : '/register')}
                      sx={{
                        mt: 2.5, borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 700,
                        bgcolor: '#fff', color: '#0F2D5C',
                        '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-2px)' },
                      }}>
                      Devenir organisateur
                    </Button>
                  </Box>
                )}

              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;