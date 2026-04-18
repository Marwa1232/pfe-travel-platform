import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Fade,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha } from '@mui/material/styles';
import {
  Favorite,
  FavoriteBorder,
  Delete,
  Explore,
  FlightTakeoff,
  LocationOn,
} from '@mui/icons-material';
import { favoriteAPI, fixImageUrl } from '../services/api';

interface FavoriteTrip {
  id: number;
  title: string;
  short_description: string;
  base_price: string;
  currency: string;
  duration_days: number;
  difficulty_level: string;
  status: string;
  images: Array<{ url: string; is_cover: boolean }>;
  destinations: Array<{ id: number; name: string }>;
  favorite_id: number;
  favorited_at: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,191,165,0.1)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: 320,
  height: 480,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 4px 12px rgba(105, 100, 100, 0.05)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(210, 218, 217, 0.15)',
  },
}));

const Saved: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await favoriteAPI.list();
      setFavorites(response.data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (tripId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await favoriteAPI.remove(tripId);
      setFavorites(prev => prev.filter(f => f.id !== tripId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderFavoriteCard = (trip: FavoriteTrip) => {
    const coverImage = fixImageUrl(trip.images?.find(img => img.is_cover)?.url || trip.images?.[0]?.url || '');
    const destinationName = trip.destinations?.[0]?.name || '';

    return (
      <Grid xs={12} sm={6} md={4} key={trip.id}>
        <StyledCard>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <CardMedia
              component="img"
              image={coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80'}
              alt={trip.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.2))'
              }}
            />
          </Box>

          <IconButton
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: 0.5,
              zIndex: 2,
              '&:hover': { backgroundColor: 'white' },
            }}
            size="small"
            onClick={(e) => handleRemoveFavorite(trip.id, e)}
          >
            <Favorite sx={{ fontSize: 30, color: '#FF6B6B' }} />
          </IconButton>

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '50%',
              zIndex: 1,
              backdropFilter: 'blur(3px)',
              maskImage: 'linear-gradient(to top, black 0%, black 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, black 0%, black 70%, transparent 100%)',
              background: 'linear-gradient(to top, rgba(172, 168, 168, 0.6) 0%, rgba(213, 210, 210, 0.2) 100%)',
            }}
          />

          <CardContent
            sx={{
              position: 'relative',
              zIndex: 2,
              marginTop: 'auto',
              padding: '16px',
              color: 'white',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {trip.title}
            </Typography>

            {destinationName && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LocationOn sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }} noWrap>
                  {destinationName}
                </Typography>
              </Box>
            )}

            <Typography
              variant="body2"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
                fontSize: '0.85rem',
                mb: 1.5,
                textShadow: '0 1px 1px rgba(0,0,0,0.3)',
              }}
            >
              {trip.short_description || 'Découvrez cette expérience unique.'}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#FFFFFF', fontSize: '1.5rem' }}>
                a partir de <Box component="span" sx={{ fontWeight: 600 }}>{trip.base_price} {trip.currency}</Box>
              </Typography>
            </Box>
          </CardContent>

          <Box sx={{ position: 'relative', zIndex: 2, padding: '0 16px 16px 16px' }}>
            <Button
              component={Link}
              to={`/trips/${trip.id}`}
              variant="contained"
              fullWidth
              sx={{ 
                height: 40,
                background: 'linear-gradient(90deg,rgb(0, 191, 166),rgb(13, 72, 161))',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Voir détails
            </Button>
          </Box>
        </StyledCard>
      </Grid>
    );
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Favorite sx={{ fontSize: 32, color: '#FF6B6B' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: '#0D47A1' }}>
              Mes favoris
            </Typography>
          </Box>

          {!isLoggedIn ? (
            <StyledPaper>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <FavoriteBorder sx={{ fontSize: 80, color: alpha('#FF6B6B', 0.3), mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Connectez-vous pour voir vos favoris
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Connectez-vous pour sauvegarder vos voyages préférés.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                    borderRadius: 2,
                    px: 4,
                    py: 1.2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
                    },
                  }}
                >
                  Se connecter
                </Button>
              </Box>
            </StyledPaper>
          ) : loading ? (
            <StyledPaper>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  Chargement...
                </Typography>
              </Box>
            </StyledPaper>
          ) : favorites.length === 0 ? (
            <StyledPaper>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <FavoriteBorder sx={{ fontSize: 80, color: alpha('#FF6B6B', 0.3), mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun favori pour le moment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Explorez nos voyages et ajoutez vos destinations préférées ici.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Explore />}
                  onClick={() => navigate('/trips')}
                  sx={{
                    background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                    borderRadius: 2,
                    px: 4,
                    py: 1.2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
                    },
                  }}
                >
                  Explorer les voyages
                </Button>
              </Box>
            </StyledPaper>
          ) : (
            <Grid container spacing={3}>
              {favorites.map(renderFavoriteCard)}
            </Grid>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default Saved;
