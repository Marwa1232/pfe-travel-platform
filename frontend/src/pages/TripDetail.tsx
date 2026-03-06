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
  ImageList,
  ImageListItem,
  Card,
  CardContent,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { tripAPI, bookingAPI } from '../services/api';
import { RootState } from '../store';
import BookingForm from '../components/BookingForm';

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !trip) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Voyage non trouvé'}</Alert>
      </Container>
    );
  }

  const coverImage = trip.images?.find((img: any) => img.is_cover)?.url || trip.images?.[0]?.url;
  const availableSessions = trip.sessions?.filter((s: any) => s.status === 'OPEN') || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Images Section */}
        <Grid  xs={12} md={8}>
          {coverImage && (
            <Box
              component="img"
              src={coverImage}
              alt={trip.title}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 2,
              }}
            />
          )}

          {trip.images && trip.images.length > 1 && (
            <ImageList cols={3} gap={8}>
              {trip.images.slice(1, 4).map((image: any, index: number) => (
                <ImageListItem key={index}>
                  <img
                    src={image.url}
                    alt={`${trip.title} ${index + 2}`}
                    loading="lazy"
                    style={{ borderRadius: 8 }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {/* Description */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h4" gutterBottom>
              {trip.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {trip.short_description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph>
              {trip.long_description || trip.short_description}
            </Typography>
          </Paper>
        </Grid>

        {/* Booking Section */}
        <Grid  xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {trip.base_price} {trip.currency}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                par personne
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {trip.duration_days} jour{trip.duration_days > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {trip.destinations?.map((d: any) => d.name).join(', ') || 'Non spécifié'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={trip.difficulty_level}
                  size="small"
                  color={trip.difficulty_level === 'easy' ? 'success' : trip.difficulty_level === 'medium' ? 'warning' : 'error'}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Categories */}
            {trip.categories && trip.categories.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Catégories:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {trip.categories.map((cat: any) => (
                    <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

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
                disabled={availableSessions.length === 0}
                sx={{ mt: 2 }}
              >
                {availableSessions.length === 0
                  ? 'Aucune session disponible'
                  : 'Réserver maintenant'}
              </Button>
            )}

            {trip.organizer && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Organisé par
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {trip.organizer.agency_name}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TripDetail;