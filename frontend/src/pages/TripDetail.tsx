import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Alert,
  IconButton,
  Avatar,
  Rating,
  Stack,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Skeleton,
  Tooltip,
  Fade,
  Zoom,
  Modal,
  Backdrop,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  AttachMoney,
  Favorite,
  FavoriteBorder,
  Share,
  CalendarMonth,
  Group,
  Star,
  Verified,
  LocalActivity,
  Restaurant,
  Hotel,
  Close,
  NavigateBefore,
  NavigateNext,
  ZoomIn,
  Add,
  Remove,
  WarningAmber,
  CheckCircleOutline,
  ErrorOutline,
  PeopleAlt,
  Cancel,
  Flight,
  Umbrella,
} from '@mui/icons-material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { tripAPI, bookingAPI, fixImageUrl } from '../services/api';
import { RootState } from '../store';
import BookingForm from '../components/BookingForm';
import TripReviews from '../components/TripReviews';
import CancellationPolicyModal from '../components/CancellationPolicyModal';

// ─── 2 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  white: '#FFFFFF',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Inclusion options pour Quick Info Cards ─────────────────────
const inclusionOptions = [
  { value: 'transport', label: 'Transport', icon: <Flight sx={{ fontSize: 20 }} /> },
  { value: 'hebergement', label: 'Hébergement', icon: <Hotel sx={{ fontSize: 20 }} /> },
  { value: 'guide', label: 'Guide', icon: <Verified sx={{ fontSize: 20 }} /> },
  { value: 'assurance', label: 'Assurance', icon: <Umbrella sx={{ fontSize: 20 }} /> },
  { value: 'repas', label: 'Repas', icon: <Restaurant sx={{ fontSize: 20 }} /> },
  { value: 'activites', label: 'Activités', icon: <LocalActivity sx={{ fontSize: 20 }} /> },
];

// ─── Styled components ──────────────────────────────────────────
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '54vh',
  minHeight: 420,
  overflow: 'hidden',
  borderRadius: 2,
  marginBottom: theme.spacing(4),
  boxShadow: `0 18px 42px ${alpha(COLORS.navy, 0.22)}`,
  [theme.breakpoints.down('md')]: {
    height: '46vh',
    minHeight: 360,
  },
}));

const HeroOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(to bottom, ${alpha(COLORS.navy, 0.3)} 0%, ${alpha(COLORS.navy, 0.7)} 100%)`,
  zIndex: 1,
});

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(6),
  left: theme.spacing(6),
  right: theme.spacing(6),
  color: COLORS.white,
  zIndex: 2,
  [theme.breakpoints.down('sm')]: {
    left: theme.spacing(3),
    right: theme.spacing(3),
    bottom: theme.spacing(3),
  },
}));

const GalleryContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));

const GalleryItem = styled(Box)({
  position: 'relative',
  height: 150,
  borderRadius: 2,
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    '& .gallery-overlay': { opacity: 1 },
    '& img': { transform: 'scale(1.1)' },
  },
});

const GalleryOverlay = styled(Box)({
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  background: alpha(COLORS.navy, 0.4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 1,
});

const StyledImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease',
});

const MainImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  borderRadius: 2,
  border: `1px solid ${alpha(COLORS.teal, 0.12)}`,
  transition: 'all 0.3s ease',
  backgroundColor: COLORS.white,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 30px ${alpha(COLORS.navy, 0.16)}`,
  },
}));

const PriceTag = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(2),
}));

const ModalCloseButton = styled(IconButton)({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: alpha(COLORS.navy, 0.6),
  color: COLORS.white,
  zIndex: 3,
  '&:hover': { backgroundColor: alpha(COLORS.navy, 0.8) },
});

const ModalControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  transform: 'translateY(-50%)',
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  zIndex: 2,
}));

const ModalImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

const ImageCounter = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: alpha(COLORS.navy, 0.7),
  color: COLORS.white,
  padding: theme.spacing(0.5, 2),
  borderRadius: 2,
  fontSize: '0.875rem',
  zIndex: 3,
}));

const CounterButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  border: `1px solid ${alpha(COLORS.teal, 0.3)}`,
  borderRadius: '50%',
  '&:hover': { background: alpha(COLORS.teal, 0.08) },
  '&:disabled': { opacity: 0.35 },
}));

const SessionCard = styled(Paper, {
  shouldForwardProp: (p) => p !== 'selected' && p !== 'disabled',
})<{ selected?: boolean; disabled?: boolean }>(({ theme, selected, disabled }) => ({
  padding: theme.spacing(1.5),
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.55 : 1,
  border: selected
    ? `2px solid ${COLORS.teal}`
    : `1px solid ${alpha(COLORS.teal, 0.15)}`,
  background: selected ? alpha(COLORS.teal, 0.05) : 'transparent',
  transition: 'all 0.2s ease',
  borderRadius: 2,
  '&:hover': !disabled
    ? {
        borderColor: selected ? COLORS.teal : alpha(COLORS.teal, 0.5),
        background: alpha(COLORS.teal, 0.04),
      }
    : {},
}));

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 10,
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '1rem',
  padding: '12px 24px',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: alpha(COLORS.navy, 0.4),
    color: COLORS.white,
  },
});

const ExclusionsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 2,
  border: `1px solid ${alpha(COLORS.navy, 0.15)}`,
  backgroundColor: alpha(COLORS.navy, 0.02),
}));

const PolicyCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 2,
  border: `1px solid ${alpha(COLORS.navy, 0.2)}`,
  backgroundColor: alpha(COLORS.navy, 0.04),
}));

// ─── Helpers ────────────────────────────────────────────────────
const getAvailableSeats = (session: any): number => {
  if (session.status !== 'OPEN') return 0;
  const startDate = new Date(session.start_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) return 0;
  
  if (session.availableSeats !== undefined) return session.availableSeats;
  if (session.available_seats !== undefined) return session.available_seats;
  const booked = session.bookedSeats ?? session.booked_seats ?? 0;
  return (session.max_capacity ?? session.total_seats ?? 0) - booked;
};

const getTotalSeats = (session: any): number =>
  session.max_capacity ?? session.total_seats ?? 0;

const getAvailStatus = (avail: number, total: number) => {
  if (avail === 0) return 'full';
  if (avail <= 3) return 'low';
  return 'ok';
};

// ─── Component ──────────────────────────────────────────────────
const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Vérification des rôles
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isOrganizer = user?.roles?.includes('ROLE_ORGANIZER');
  // Le booking sidebar et les reviews s'affichent pour:
  // - Non connecté (token = false)
  // - ROLE_USER (token = true && !isAdmin && !isOrganizer)
  const showBookingAndReviews = !token || (token && !isAdmin && !isOrganizer);

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [bookingAlert, setBookingAlert] = useState<{
    type: 'error' | 'warning' | 'success';
    message: string;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policy, setPolicy] = useState<{
    rules: { days: number; refund: number }[];
    allowVoucher: boolean;
    allowRebooking: boolean;
  } | null>(null);

  useEffect(() => {
    if (id) loadTrip();
  }, [id]);

  useEffect(() => {
    validateBooking();
  }, [selectedSession, participantCount]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const [tripResponse, policyResponse] = await Promise.all([
        tripAPI.get(Number(id)),
        tripAPI.getPolicy(Number(id)).catch(() => ({ data: null })),
      ]);
      setTrip(tripResponse.data);
      setPolicy(policyResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du voyage');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = (session: any) => {
    const avail = getAvailableSeats(session);
    if (avail === 0) return;
    setSelectedSession(session);
    if (participantCount > avail) {
      setParticipantCount(avail);
    }
  };

  const handleCountChange = (delta: number) => {
    if (!selectedSession) return;
    const avail = getAvailableSeats(selectedSession);
    const next = participantCount + delta;
    if (next < 1 || next > avail) return;
    setParticipantCount(next);
  };

  const validateBooking = (): boolean => {
    if (!selectedSession) {
      setBookingAlert(null);
      return false;
    }

    const avail = getAvailableSeats(selectedSession);

    if (avail === 0) {
      setBookingAlert({
        type: 'error',
        message: 'Cette session est complète. Veuillez choisir une autre date.',
      });
      return false;
    }

    if (participantCount > avail) {
      setBookingAlert({
        type: 'error',
        message: `Il ne reste que ${avail} place${avail > 1 ? 's' : ''} pour cette session.`,
      });
      return false;
    }

    if (avail <= 3) {
      setBookingAlert({
        type: 'warning',
        message: `Attention : seulement ${avail} place${avail > 1 ? 's' : ''} restante${avail > 1 ? 's' : ''} !`,
      });
      return true;
    }

    setBookingAlert({
      type: 'success',
      message: `${avail} places disponibles pour cette session.`,
    });
    return true;
  };

  const handleBook = () => {
    if (!token) {
      navigate('/login', { state: { returnTo: `/trips/${id}` } });
      return;
    }
    if (!selectedSession) {
      setSnackbar('Veuillez sélectionner une date de départ.');
      return;
    }
    const avail = getAvailableSeats(selectedSession);
    if (avail === 0) {
      setSnackbar('Cette session est complète. Choisissez une autre date.');
      return;
    }
    if (participantCount > avail) {
      setSnackbar(`Seulement ${avail} place${avail > 1 ? 's' : ''} disponible${avail > 1 ? 's' : ''}.`);
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (bookingId?: number, paymentMethod?: string) => {
    setShowBookingForm(false);
    if (bookingId && paymentMethod === 'CARD_SIMULATED') {
      navigate(`/checkout/${bookingId}`);
    } else {
      navigate('/bookings');
    }
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: trip.title, text: trip.short_description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar('Lien copié !');
    }
  };

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const handleNext = () =>
    setCurrentImageIndex((p) => (p === galleryImages.length - 1 ? 0 : p + 1));

  const handlePrev = () =>
    setCurrentImageIndex((p) => (p === 0 ? galleryImages.length - 1 : p - 1));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={30} width="60%" />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !trip) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in>
          <Alert
            severity="error"
            sx={{ borderRadius: 2, bgcolor: alpha(COLORS.navy, 0.05), borderLeft: `4px solid ${COLORS.navy}` }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/trips')}>
                Voir tous les voyages
              </Button>
            }
          >
            {error || 'Voyage non trouvé'}
          </Alert>
        </Fade>
      </Container>
    );
  }

  const coverImage = fixImageUrl(
    trip.images?.find((img: any) => img.is_cover)?.url || trip.images?.[0]?.url,
  );
  const availableSessions = trip.sessions?.filter((s: any) => {
    if (s.status !== 'OPEN') return false;
    const startDate = new Date(s.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return startDate >= today;
  }) || [];
  const galleryImages = trip.images?.map((img: any) => fixImageUrl(img.url)) || [];

  const selectedAvail = selectedSession ? getAvailableSeats(selectedSession) : 0;
  const totalPrice = participantCount * (trip.base_price || 0);
  const canBook =
    !!selectedSession &&
    selectedAvail > 0 &&
    participantCount >= 1 &&
    participantCount <= selectedAvail;

  // Liste des inclusions pour les Quick Info Cards
  const inclusionsList = trip.inclusions || [];
  const exclusionsList = trip.exclusions || [];

  // Quick info cards - Toutes les inclusions (6 cartes)
  const quickInfoItems = inclusionOptions.map(option => ({
    icon: React.cloneElement(option.icon, { sx: { fontSize: 20, color: COLORS.teal } }),
    label: option.label,
    value: inclusionsList.includes(option.value) ? 'Inclus' : 'Non inclus',
    isIncluded: inclusionsList.includes(option.value),
  }));

  const getExclusionLabel = (item: string) => {
    const labels: Record<string, string> = {
      depenses_personnelles: 'Dépenses personnelles',
      activites_optionnelles: 'Activités optionnelles',
      repas_libres: 'Repas libres',
      boissons: 'Boissons',
      pourboires: 'Pourboires',
    };
    return labels[item] || item;
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 5 }}>
        {/* Breadcrumbs */}
        <Container maxWidth="lg" sx={{ mt: 3, mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              color="inherit"
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              sx={{ cursor: 'pointer', color: alpha(COLORS.navy, 0.7), textDecoration: 'none', '&:hover': { color: COLORS.teal } }}
            >
              Accueil
            </Link>
            <Link
              color="inherit"
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/trips'); }}
              sx={{ cursor: 'pointer', color: alpha(COLORS.navy, 0.7), textDecoration: 'none', '&:hover': { color: COLORS.teal } }}
            >
              Voyages
            </Link>
            <Typography sx={{ color: COLORS.navy, fontWeight: 600 }}>{trip.title}</Typography>
          </Breadcrumbs>
        </Container>

        {/* Hero Section */}
        <HeroSection>
          {coverImage && <MainImage src={coverImage} alt={trip.title} />}
          <HeroOverlay />
          <HeroContent>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {trip.categories?.slice(0, 3).map((cat: any) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  size="small"
                  sx={{
                    bgcolor: alpha(COLORS.white, 0.2),
                    color: COLORS.white,
                    backdropFilter: 'blur(10px)',
                  }}
                />
              ))}
            </Stack>
            <Typography variant={isMobile ? 'h3' : 'h2'} component="h1" fontWeight="bold" gutterBottom>
              {trip.title}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }} flexWrap="wrap">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOn sx={{ color: COLORS.teal }} />
                <Typography variant="body1">
                  {trip.destinations?.map((d: any) => d.name).join(' • ') || 'Destination non spécifiée'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTime sx={{ color: COLORS.teal }} />
                <Typography variant="body1">
                  {trip.duration_days} jour{trip.duration_days > 1 ? 's' : ''}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating value={trip.avg_rating || 0} precision={0.5} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: COLORS.teal } }} />
                <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>({trip.review_count || 0} avis)</Typography>
              </Stack>
            </Stack>
          </HeroContent>
        </HeroSection>

        {/* Gallery */}
        {galleryImages.length > 1 && (
          <GalleryContainer>
            {galleryImages.slice(1, 5).map((image: string, index: number) => (
              <GalleryItem key={index} onClick={() => openModal(index + 1)}>
                <StyledImage src={image} alt={`${trip.title} - Image ${index + 2}`} />
                <GalleryOverlay className="gallery-overlay">
                  <ZoomIn sx={{ color: COLORS.white, fontSize: 30 }} />
                </GalleryOverlay>
                {index === 3 && galleryImages.length > 5 && (
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: alpha(COLORS.navy, 0.5), display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.white, fontSize: '1.5rem', fontWeight: 'bold', zIndex: 2 }}>
                    +{galleryImages.length - 5}
                  </Box>
                )}
              </GalleryItem>
            ))}
          </GalleryContainer>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1, mb: 4 }}>
          <Tooltip title="Ajouter aux favoris">
            <IconButton
              onClick={() => setIsFavorite(!isFavorite)}
              sx={{ bgcolor: COLORS.white, border: `1px solid ${alpha(COLORS.teal, 0.16)}`, borderRadius: 2, '&:hover': { bgcolor: alpha(COLORS.teal, 0.05) } }}
            >
              {isFavorite ? <Favorite sx={{ color: COLORS.teal }} /> : <FavoriteBorder sx={{ color: COLORS.navy }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Partager">
            <IconButton
              onClick={handleShare}
              sx={{ bgcolor: COLORS.white, border: `1px solid ${alpha(COLORS.teal, 0.16)}`, borderRadius: 2, '&:hover': { bgcolor: alpha(COLORS.teal, 0.05) } }}
            >
              <Share sx={{ color: COLORS.navy }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>

              {/* Quick Info Cards - Toutes les inclusions (6 cartes) */}
              <Grid container spacing={2}>
                {quickInfoItems.map((item, i) => (
                  <Grid item xs={6} sm={4} md={2} key={i}>
                    <InfoCard elevation={2}>
                      <Stack alignItems="center" spacing={1}>
                        <Box sx={{ 
                          bgcolor: item.isIncluded ? alpha(COLORS.teal, 0.1) : alpha(COLORS.navy, 0.05),
                          borderRadius: '50%', 
                          p: 1.5, 
                          display: 'flex',
                          color: item.isIncluded ? COLORS.teal : COLORS.navy
                        }}>
                          {item.icon}
                        </Box>
                        <Typography variant="body2" color="text.secondary" align="center">
                          {item.label}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="bold" 
                          sx={{ 
                            color: item.isIncluded ? COLORS.teal : COLORS.navy,
                            fontSize: '0.9rem'
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Stack>
                    </InfoCard>
                  </Grid>
                ))}
              </Grid>

              {/* Ce qui n'est pas inclus */}
              {exclusionsList.length > 0 && (
                <ExclusionsCard elevation={0}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: COLORS.navy }}>
                    Ce qui n'est pas inclus
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    {exclusionsList.map((item: string, index: number) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ bgcolor: alpha(COLORS.navy, 0.1), borderRadius: '50%', p: 1, display: 'flex' }}>
                            <Cancel sx={{ color: COLORS.navy }} />
                          </Box>
                          <Typography variant="body1" sx={{ color: COLORS.navy }}>{getExclusionLabel(item)}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </ExclusionsCard>
              )}

              {/* Description */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.12)}`, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: COLORS.navy }}>
                  À propos de ce voyage
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body1" paragraph color="text.secondary" sx={{
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflow: 'visible',
                  display: 'block'
                }}>
                  {trip.long_description || trip.short_description}
                </Typography>
              </Paper>

              {/* Itinerary */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.12)}`, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: COLORS.navy }}>
                  Itinéraire
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={3}>
                  {(trip.programs?.length > 0 ? trip.programs : []).slice(0, 3).map((program: any, index: number) => (
                    <Box key={index}>
                      <Typography variant="h6" gutterBottom sx={{ color: COLORS.teal }}>
                        Jour {program.dayNumber || program.day_number || index + 1}: {program.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '1.1rem',
                          lineHeight: 1.8,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          overflow: 'visible',
                          display: 'block'
                        }}
                        paragraph
                      >
                        {program.description || 'Description non disponible'}
                      </Typography>
                      {index < 2 && <Divider sx={{ my: 2 }} />}
                    </Box>
                  ))}
                  {(!trip.programs || trip.programs.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      L'itinéraire détaillé sera bientôt disponible.
                    </Typography>
                  )}
                </Stack>
              </Paper>

              {/* Reviews - Affiché seulement si showBookingAndReviews est true (USER ou non connecté) */}
              {showBookingAndReviews && (
                <TripReviews tripId={Number(id)} tripTitle={trip.title} />
              )}

              {/* Message pour les admins/organisateurs */}
              {!showBookingAndReviews && (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${alpha(COLORS.navy, 0.12)}`, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: COLORS.navy }}>
                    En tant qu'organisateur ou administrateur, vous ne pouvez pas laisser d'avis sur ce voyage.
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Right Column – Booking Sidebar - Affiché seulement si showBookingAndReviews est true */}
          {showBookingAndReviews && (
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <Zoom in timeout={500}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.teal, 0.14)}`,
                      boxShadow: '0 14px 30px rgba(15,23,42,0.14)',
                    }}
                  >
                    {/* Price */}
                    <PriceTag>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: COLORS.teal }}>
                        {trip.base_price?.toLocaleString('fr-FR')}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                        EUR&nbsp;/&nbsp;personne
                      </Typography>
                    </PriceTag>

                    <Divider sx={{ mb: 2.5 }} />

                    {/* Session list */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <CalendarMonth color="action" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: COLORS.navy }}>
                        Choisir une date de départ
                      </Typography>
                    </Stack>

                    {availableSessions.length === 0 ? (
                      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                        Aucune session disponible pour le moment.
                      </Alert>
                    ) : (
                      <Stack spacing={1} sx={{ mb: 2.5 }}>
                        {availableSessions.map((session: any) => {
                          const avail = getAvailableSeats(session);
                          const total = getTotalSeats(session);
                          const booked = total - avail;
                          const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
                          const status = getAvailStatus(avail, total);
                          const isFull = status === 'full';
                          const isSelected = selectedSession?.id === session.id;

                          const barColor = isFull ? COLORS.navy : COLORS.teal;

                          const chipProps = isFull
                            ? { label: 'Complet', sx: { bgcolor: alpha(COLORS.navy, 0.1), color: COLORS.navy, fontWeight: 'bold' } }
                            : status === 'low'
                            ? { label: `${avail} place${avail > 1 ? 's' : ''}`, sx: { bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, fontWeight: 'bold' } }
                            : { label: `${avail} dispo.`, sx: { bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, fontWeight: 'bold' } };

                          return (
                            <SessionCard
                              key={session.id}
                              selected={isSelected}
                              disabled={isFull}
                              variant="outlined"
                              onClick={() => handleSelectSession(session)}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: COLORS.navy }}>
                                  {new Date(session.start_date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </Typography>
                              </Stack>

                              <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={pct}
                                  sx={{
                                    height: 5,
                                    borderRadius: 2,
                                    bgcolor: alpha(barColor, 0.15),
                                    '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 2 },
                                  }}
                                />
                                <Stack direction="row" justifyContent="space-between" mt={0.5}>
                                  <Typography variant="caption" color="text.secondary">
                                    {booked}/{total} réservés
                                  </Typography>
                                  {!isFull && (
                                    <Typography variant="caption" sx={{ color: barColor, fontWeight: 500 }}>
                                      {avail} libre{avail > 1 ? 's' : ''}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            </SessionCard>
                          );
                        })}
                      </Stack>
                    )}

                    <Divider sx={{ mb: 2.5 }} />

                    {/* Participant counter */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <PeopleAlt color="action" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: COLORS.navy }}>
                        Nombre de participants
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 0.5 }}>
                      <CounterButton size="small" onClick={() => handleCountChange(-1)} disabled={participantCount <= 1}>
                        <Remove fontSize="small" />
                      </CounterButton>

                      <Typography variant="h5" fontWeight="bold" sx={{ minWidth: 32, textAlign: 'center', color: COLORS.navy }}>
                        {participantCount}
                      </Typography>

                      <CounterButton size="small" onClick={() => handleCountChange(1)} disabled={!selectedSession || participantCount >= selectedAvail}>
                        <Add fontSize="small" />
                      </CounterButton>

                      {selectedSession && (
                        <Typography variant="caption" color="text.secondary">
                          max {selectedAvail} place{selectedAvail > 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Stack>

                    {/* Booking alert */}
                    {bookingAlert && (
                      <Alert
                        severity={bookingAlert.type}
                        icon={
                          bookingAlert.type === 'error' ? <ErrorOutline fontSize="small" /> :
                          bookingAlert.type === 'warning' ? <WarningAmber fontSize="small" /> :
                          <CheckCircleOutline fontSize="small" />
                        }
                        sx={{ mt: 1.5, mb: 1, borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}
                      >
                        {bookingAlert.message}
                      </Alert>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Tarif détaillé */}
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: COLORS.navy, mb: 1 }}>
                      Récapitulatif du tarif
                    </Typography>

                    <Stack spacing={0.5} sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          {participantCount} personne{participantCount > 1 ? 's' : ''} × {trip.base_price?.toLocaleString('fr-FR')} EUR
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.navy }}>
                          {(participantCount * (trip.base_price || 0)).toLocaleString('fr-FR')} EUR
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Frais de service</Typography>
                        <Typography variant="body2" sx={{ color: COLORS.teal, fontWeight: 600 }}>Gratuit</Typography>
                      </Stack>
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: COLORS.navy }}>Total</Typography>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: COLORS.teal }}>
                          {totalPrice.toLocaleString('fr-FR')} EUR
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Organizer */}
                    {trip.organizer && (
                      <>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar src={trip.organizer.logo} sx={{ width: 40, height: 40, bgcolor: COLORS.teal, color: COLORS.white }}>
                            {trip.organizer.agency_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Organisé par</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ color: COLORS.navy }}>{trip.organizer.agency_name}</Typography>
                          </Box>
                        </Stack>
                      </>
                    )}

                    {/* Difficulty */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Niveau :</Typography>
                      <Chip
                        label={
                          trip.difficulty_level === 'easy' ? 'Facile' :
                          trip.difficulty_level === 'medium' ? 'Intermédiaire' : 'Difficile'
                        }
                        size="small"
                        sx={{ 
                          bgcolor: trip.difficulty_level === 'easy' ? alpha(COLORS.teal, 0.1) : alpha(COLORS.navy, 0.1),
                          color: trip.difficulty_level === 'easy' ? COLORS.teal : COLORS.navy,
                          fontWeight: 'bold',
                          borderRadius: 3
                        }}
                      />
                    </Stack>

                    {/* Politique d'annulation - Carte séparée */}
                    {policy && (
                      <PolicyCard elevation={0}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: COLORS.navy, mb: 1 }}>
                          Politique d'annulation
                        </Typography>
                        <Stack spacing={1}>
                          {policy.rules?.slice(0, 3).map((rule, idx) => (
                            <Stack key={idx} direction="row" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">
                                {rule.days === 0 ? 'Moins de 7 jours' : `Plus de ${rule.days} jours`}
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" sx={{ color: COLORS.teal }}>
                                {rule.refund}% remboursé
                              </Typography>
                            </Stack>
                          ))}
                          <Button
                            size="small"
                            onClick={() => setPolicyModalOpen(true)}
                            sx={{ mt: 1, color: COLORS.teal, justifyContent: 'flex-start', p: 0 }}
                          >
                            Voir tous les détails →
                          </Button>
                        </Stack>
                      </PolicyCard>
                    )}
                    <Divider sx={{ mb: 2.5 }} />
                    {/* Booking form or button */}
                    {showBookingForm ? (
                      <BookingForm
                        trip={trip}
                        sessions={availableSessions}
                        selectedSession={selectedSession}
                        participantCount={participantCount}
                        onSuccess={handleBookingSuccess}
                        onCancel={() => setShowBookingForm(false)}
                      />
                    ) : (
                      <GradientButton
                        fullWidth
                        onClick={handleBook}
                        disabled={availableSessions.length === 0}
                      >
                        {availableSessions.length === 0
                          ? 'Aucune session disponible'
                          : !selectedSession
                          ? 'Sélectionner une date'
                          : !canBook
                          ? 'Vérifier les disponibilités'
                          : `Réserver — ${totalPrice.toLocaleString('fr-FR')} EUR`}
                      </GradientButton>
                    )}

                    {/* Trust badges */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, gap: 0.5 }}>
                      {['Paiement sécurisé', 'Meilleur prix garanti'].map((txt) => (
                        <Chip
                          key={txt}
                          label={txt}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', borderColor: alpha(COLORS.teal, 0.3), color: alpha(COLORS.navy, 0.7) }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Zoom>
              </Box>
            </Grid>
          )}

          {/* Si l'utilisateur est admin/organisateur, on affiche un message dans la colonne de droite */}
          {!showBookingAndReviews && (
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    border: `1px solid ${alpha(COLORS.navy, 0.14)}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.navy, mb: 2 }}>
                    Réservation indisponible
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                    En tant qu'organisateur ou administrateur, vous ne pouvez pas réserver ce voyage.
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Image Gallery Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500, sx: { backgroundColor: alpha(COLORS.navy, 0.95) } } }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              height: '90vh',
              bgcolor: COLORS.white,
              borderRadius: 2,
              overflow: 'hidden',
              outline: 'none',
            }}
          >
            <ModalCloseButton onClick={() => setModalOpen(false)}>
              <Close />
            </ModalCloseButton>
            <ModalControls>
              <IconButton onClick={handlePrev} sx={{ bgcolor: alpha(COLORS.navy, 0.6), color: COLORS.white, '&:hover': { bgcolor: alpha(COLORS.navy, 0.8) } }}>
                <NavigateBefore fontSize="large" />
              </IconButton>
              <IconButton onClick={handleNext} sx={{ bgcolor: alpha(COLORS.navy, 0.6), color: COLORS.white, '&:hover': { bgcolor: alpha(COLORS.navy, 0.8) } }}>
                <NavigateNext fontSize="large" />
              </IconButton>
            </ModalControls>
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'black' }}>
              <ModalImage src={galleryImages[currentImageIndex]} alt={`${trip.title} - Image ${currentImageIndex + 1}`} />
            </Box>
            <ImageCounter>
              {currentImageIndex + 1} / {galleryImages.length}
            </ImageCounter>
          </Box>
        </Fade>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Cancellation Policy Modal */}
      <CancellationPolicyModal
        open={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        policy={policy}
        onViewTerms={() => {
          setPolicyModalOpen(false);
          navigate('/terms');
        }}
      />
    </>
  );
};

export default TripDetail;