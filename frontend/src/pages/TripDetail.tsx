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
  CircularProgress,
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
  Card,
  CardContent,
  Modal,
  Backdrop,
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
  ArrowBack,
  Verified,
  LocalActivity,
  Restaurant,
  Hotel,
  Info,
  Close,
  NavigateBefore,
  NavigateNext,
  ZoomIn,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { tripAPI, bookingAPI, fixImageUrl } from '../services/api';
import { RootState } from '../store';
import BookingForm from '../components/BookingForm';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '60vh',
  minHeight: 500,
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[10],
  [theme.breakpoints.down('md')]: {
    height: '50vh',
    minHeight: 400,
  },
}));

const HeroOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(to bottom, ${alpha(theme.palette.common.black, 0.3)} 0%, ${alpha(theme.palette.common.black, 0.7)} 100%)`,
  zIndex: 1,
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(6),
  left: theme.spacing(6),
  right: theme.spacing(6),
  color: theme.palette.common.white,
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

const GalleryItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 150,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    '& .gallery-overlay': {
      opacity: 1,
    },
    '& img': {
      transform: 'scale(1.1)',
    },
  },
}));

const GalleryOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: alpha(theme.palette.common.black, 0.3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 1,
}));

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
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const PriceTag = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  padding: theme.spacing(1, 3),
  borderRadius: theme.shape.borderRadius * 3,
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

const ModalCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: alpha(theme.palette.common.black, 0.5),
  color: theme.palette.common.white,
  zIndex: 3,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.7),
  },
}));

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
  backgroundColor: alpha(theme.palette.common.black, 0.6),
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 2),
  borderRadius: 20,
  fontSize: '0.875rem',
  zIndex: 3,
}));

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadTrip();
    }
  }, [id]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.get(Number(id));
      setTrip(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du voyage');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!token) {
      navigate('/login', { state: { returnTo: `/trips/${id}` } });
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    navigate('/bookings');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip.title,
        text: trip.short_description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You can add a snackbar/toast notification here
    }
  };

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

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
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
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

  const coverImage = fixImageUrl(trip.images?.find((img: any) => img.is_cover)?.url || trip.images?.[0]?.url);
  const availableSessions = trip.sessions?.filter((s: any) => s.status === 'OPEN') || [];
  const galleryImages = trip.images?.map((img: any) => fixImageUrl(img.url)) || [];

  return (
    <>
      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ cursor: 'pointer' }}
          >
            Accueil
          </Link>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/trips'); }}
            sx={{ cursor: 'pointer' }}
          >
            Voyages
          </Link>
          <Typography color="text.primary">{trip.title}</Typography>
        </Breadcrumbs>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <HeroSection>
          {/* Main Hero Image */}
          {coverImage && (
            <MainImage 
              src={coverImage} 
              alt={trip.title}
            />
          )}
          
          <HeroOverlay />
          
          <HeroContent>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {trip.categories?.slice(0, 3).map((cat: any) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: 'common.white',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.3),
                    }
                  }}
                />
              ))}
            </Stack>
            
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              component="h1" 
              fontWeight="bold" 
              gutterBottom
            >
              {trip.title}
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              flexWrap="wrap"
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOn />
                <Typography variant="body1">
                  {trip.destinations?.map((d: any) => d.name).join(' • ') || 'Destination non spécifiée'}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTime />
                <Typography variant="body1">
                  {trip.duration_days} jour{trip.duration_days > 1 ? 's' : ''}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating value={4.5} precision={0.5} readOnly size="small" />
                <Typography variant="body2">(128 avis)</Typography>
              </Stack>
            </Stack>
          </HeroContent>
        </HeroSection>

        {/* Gallery Section */}
        {galleryImages.length > 1 && (
          <GalleryContainer>
            {galleryImages.slice(1, 5).map((image: string, index: number) => (
              <GalleryItem key={index} onClick={() => openModal(index + 1)}>
                <StyledImage 
                  src={image} 
                  alt={`${trip.title} - Image ${index + 2}`}
                />
                <GalleryOverlay className="gallery-overlay">
                  <ZoomIn sx={{ color: 'white', fontSize: 30 }} />
                </GalleryOverlay>
                {index === 3 && galleryImages.length > 5 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: alpha(theme.palette.common.black, 0.5),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      zIndex: 2,
                    }}
                  >
                    +{galleryImages.length - 5}
                  </Box>
                )}
              </GalleryItem>
            ))}
          </GalleryContainer>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2, mb: 3 }}>
          <Tooltip title="Ajouter aux favoris">
            <IconButton 
              onClick={() => setIsFavorite(!isFavorite)}
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.9),
                '&:hover': {
                  bgcolor: 'common.white',
                }
              }}
            >
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Partager">
            <IconButton 
              onClick={handleShare}
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.9),
                '&:hover': {
                  bgcolor: 'common.white',
                }
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Left Column - Trip Details */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Quick Info Cards */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <InfoCard elevation={2}>
                    <Stack alignItems="center" spacing={1}>
                      <LocalActivity color="primary" />
                      <Typography variant="body2" color="text.secondary" align="center">
                        Activités
                      </Typography>
                      <Typography variant="h6">12+</Typography>
                    </Stack>
                  </InfoCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <InfoCard elevation={2}>
                    <Stack alignItems="center" spacing={1}>
                      <Group color="primary" />
                      <Typography variant="body2" color="text.secondary" align="center">
                        Groupe
                      </Typography>
                      <Typography variant="h6">8-12 pers.</Typography>
                    </Stack>
                  </InfoCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <InfoCard elevation={2}>
                    <Stack alignItems="center" spacing={1}>
                      <Restaurant color="primary" />
                      <Typography variant="body2" color="text.secondary" align="center">
                        Repas
                      </Typography>
                      <Typography variant="h6">Inclus</Typography>
                    </Stack>
                  </InfoCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <InfoCard elevation={2}>
                    <Stack alignItems="center" spacing={1}>
                      <Hotel color="primary" />
                      <Typography variant="body2" color="text.secondary" align="center">
                        Hébergement
                      </Typography>
                      <Typography variant="h6">4*</Typography>
                    </Stack>
                  </InfoCard>
                </Grid>
              </Grid>

              {/* Description */}
              <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  À propos de ce voyage
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography 
                  variant="body1" 
                  paragraph 
                  color="text.secondary" 
                  sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}
                >
                  {trip.long_description || trip.short_description}
                </Typography>
              </Paper>

              {/* Highlights */}
              <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Points forts
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {(trip.inclusions && trip.inclusions.length > 0 ? trip.inclusions : ['Guide expert local', 'Transport inclus', 'Petits groupes', 'Annulation gratuite']).slice(0, 6).map((item: any, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: '50%',
                          p: 1,
                          display: 'flex',
                        }}>
                          <Verified color="primary" />
                        </Box>
                        <Typography variant="body1">{item}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Itinerary Preview */}
              <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Itinéraire
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={3}>
                  {(trip.programs && trip.programs.length > 0 ? trip.programs : []).slice(0, 3).map((program: any, index: number) => (
                    <Box key={index}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Jour {program.dayNumber || program.day_number || index + 1}: {program.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
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
                  {trip.programs && trip.programs.length > 3 && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      sx={{ alignSelf: 'flex-start' }}
                      onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
                    >
                      Voir l'itinéraire complet
                    </Button>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Column - Booking & Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Zoom in timeout={500}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                  {/* Price */}
                  <PriceTag>
                    <AttachMoney />
                    <Typography variant="h4" fontWeight="bold">
                      {trip.base_price}
                    </Typography>
                    <Typography variant="body2">/ personne</Typography>
                  </PriceTag>

                  {/* Availability */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <CalendarMonth color="action" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Prochaines dates disponibles
                      </Typography>
                    </Stack>
                    {availableSessions.length > 0 ? (
                      <Stack spacing={1}>
                        {availableSessions.slice(0, 3).map((session: any) => (
                          <Paper 
                            key={session.id} 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5, 
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                borderColor: theme.palette.primary.main,
                              }
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {new Date(session.start_date).toLocaleDateString('fr-FR', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.available_seats} places disponibles
                            </Typography>
                          </Paper>
                        ))}
                        {availableSessions.length > 3 && (
                          <Button size="small" color="primary">
                            Voir toutes les dates
                          </Button>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Aucune session disponible pour le moment
                      </Typography>
                    )}
                  </Box>

                  {/* Difficulty Level */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Niveau de difficulté
                    </Typography>
                    <Chip
                      label={trip.difficulty_level === 'easy' ? 'Facile' : 
                             trip.difficulty_level === 'medium' ? 'Intermédiaire' : 'Difficile'}
                      color={trip.difficulty_level === 'easy' ? 'success' : 
                             trip.difficulty_level === 'medium' ? 'warning' : 'error'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  {/* Organizer */}
                  {trip.organizer && (
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          src={trip.organizer.logo} 
                          sx={{ width: 48, height: 48 }}
                        >
                          {trip.organizer.agency_name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Organisé par
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {trip.organizer.agency_name}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  {/* Booking Button */}
                  {showBookingForm ? (
                    <BookingForm
                      trip={trip}
                      sessions={availableSessions}
                      onSuccess={handleBookingSuccess}
                      onCancel={() => setShowBookingForm(false)}
                    />
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleBook}
                      sx={{ 
                        py: 1.5,
                        fontSize: '1.1rem',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                        }
                      }}
                    >
                      {availableSessions.length === 0
                        ? 'Aucune session disponible'
                        : 'Réserver maintenant'}
                    </Button>
                  )}

                  {/* Additional Info */}
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1}>
                      {trip.exclusions && trip.exclusions.length > 0 ? (
                        trip.exclusions.slice(0, 5).map((item: string, index: number) => (
                          <Stack direction="row" justifyContent="space-between" key={index}>
                            <Typography variant="body2" color="text.secondary">
                              {item}
                            </Typography>
                            <Info fontSize="small" color="action" />
                          </Stack>
                        ))
                      ) : (
                        <>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Annulation gratuite
                            </Typography>
                            <Info fontSize="small" color="action" />
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Paiement sécurisé
                            </Typography>
                            <Info fontSize="small" color="action" />
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Meilleur prix garanti
                            </Typography>
                            <Info fontSize="small" color="action" />
                          </Stack>
                        </>
                      )}
                    </Stack>
                  </Box>
                </Paper>
              </Zoom>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Image Gallery Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
          }
        }}
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
              bgcolor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden',
              outline: 'none',
            }}
          >
            <ModalCloseButton onClick={() => setModalOpen(false)}>
              <Close />
            </ModalCloseButton>
            
            <ModalControls>
              <IconButton 
                onClick={handlePrev}
                sx={{
                  bgcolor: alpha(theme.palette.common.black, 0.5),
                  color: 'white',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.black, 0.7),
                  }
                }}
              >
                <NavigateBefore fontSize="large" />
              </IconButton>
              <IconButton 
                onClick={handleNext}
                sx={{
                  bgcolor: alpha(theme.palette.common.black, 0.5),
                  color: 'white',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.black, 0.7),
                  }
                }}
              >
                <NavigateNext fontSize="large" />
              </IconButton>
            </ModalControls>

            <Box sx={{ width: '100%', height: '100%', bgcolor: 'black' }}>
              <ModalImage 
                src={galleryImages[currentImageIndex]} 
                alt={`${trip.title} - Image ${currentImageIndex + 1}`}
              />
            </Box>

            <ImageCounter>
              {currentImageIndex + 1} / {galleryImages.length}
            </ImageCounter>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default TripDetail;