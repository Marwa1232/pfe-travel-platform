import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import { styled, alpha } from '@mui/material/styles';
import { fixImageUrl, favoriteAPI } from '../services/api';

interface Trip {
  id: number;
  title: string;
  short_description: string;
  base_price: string;
  currency: string;
  duration_days: number;
  images: Array<{ url: string; is_cover: boolean }>;
  destinations?: Array<{ name: string }>;
  rating?: number;
}

interface TripCardProps {
  trip: Trip;
}

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
  margin: '0 auto',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(210, 218, 217, 0.15)',
  },
}));

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const coverImage = fixImageUrl(trip.images?.find(img => img.is_cover)?.url || trip.images?.[0]?.url || '');
  const destinationName = trip.destinations?.[0]?.name || '';
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await favoriteAPI.check(trip.id);
          setIsFavorite(response.data.is_favorite);
        } catch (error) {
          console.log('Error checking favorite:', error);
        }
      }
    };
    checkFavorite();
  }, [trip.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const response = await favoriteAPI.toggle(trip.id);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        onClick={handleToggleFavorite}
        disabled={loading}
      >
        {isFavorite ? 
          <FavoriteIcon sx={{ fontSize: 30, color: '#FF6B6B' }} /> : 
          <FavoriteBorderIcon sx={{ fontSize: 30 }} />
        }
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
            <LocationOnIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }} />
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
          <Box>
          <Typography sx={{ color: '#FFFFFF', fontSize: '1.5rem' }}>
          a partir de <Box component="span" sx={{ fontWeight: 600 }}>{trip.base_price} ${trip.currency === 'USD' ? 'US' : trip.currency}</Box>
        </Typography>
          
          </Box>

          {trip.rating && trip.rating > 4.5 && (
            <Chip
              label="Populaire"
              size="small"
              sx={{
                backgroundColor: alpha('#00BFA5', 0.2),
                color: '#00BFA5',
                fontWeight: 600,
                height: 22,
                fontSize: '0.7rem',
                border: '1px solid rgba(0, 0, 0, 0.5)',
              }}
            />
          )}
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
  );
};

export default TripCard;
