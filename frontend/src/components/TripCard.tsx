import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardMedia, Typography, Button, 
  Box, Chip, IconButton, styled, alpha 
} from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fixImageUrl, favoriteAPI } from '../services/api';

// --- Couleurs Luna ---
const LUNA = {
  TEAL: '#0EA5A0',
  NAVY: '#0F2D5C',
  WHITE: '#FFFFFF',
};

// --- Interfaces ---
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

// --- Styled Components ---
const StyledCard = styled(Card)(({ theme }) => ({
  width: 320,
  height: 480,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
  border: `1px solid ${alpha(LUNA.NAVY, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: `0 20px 40px ${alpha(LUNA.NAVY, 0.25)}`,
  },
}));

const PriceBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 15,
  right: 15,
  backgroundColor: LUNA.WHITE,
  padding: '6px 12px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  // Correction Erreur 2: Typage explicite de 'img'
  const coverImage = fixImageUrl(
    trip.images?.find((img: { is_cover: boolean; url: string }) => img.is_cover)?.url || 
    trip.images?.[0]?.url || ''
  );
  
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

  // Correction Erreur 3: Réintégration de handleToggleFavorite
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) return;

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
      <PriceBadge>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
          À partir de
        </Typography>
        <Typography sx={{ color: LUNA.NAVY, fontWeight: 800, fontSize: '1.1rem' }}>
          {trip.base_price} {trip.currency === 'USD' ? 'US' : trip.currency}
        </Typography>
      </PriceBadge>

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
            inset: 0,
            background: `linear-gradient(to top, ${alpha(LUNA.NAVY, 0.9)} 0%, ${alpha(LUNA.NAVY, 0.3)} 50%, transparent 100%)`,
          }}
        />
      </Box>

      <IconButton
        onClick={handleToggleFavorite}
        disabled={loading}
        sx={{
          position: 'absolute',
          top: 15,
          left: 15,
          zIndex: 3,
          bgcolor: alpha(LUNA.WHITE, 0.2),
          backdropFilter: 'blur(8px)',
          color: LUNA.WHITE,
          '&:hover': { bgcolor: alpha(LUNA.WHITE, 0.3) },
        }}
      >
        {isFavorite ? <FavoriteIcon sx={{ color: '#0F2D5C' }} /> : <FavoriteBorderIcon />}
      </IconButton>

      <CardContent sx={{ position: 'relative', zIndex: 2, mt: 'auto', p: 3, color: LUNA.WHITE }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          {trip.duration_days && (
            <Chip 
              icon={<AccessTimeIcon sx={{ fontSize: '14px !important', color: `${LUNA.TEAL} !important` }} />}
              label={`${trip.duration_days} jours`}
              sx={{ bgcolor: alpha(LUNA.WHITE, 0.1), color: LUNA.WHITE, height: 24, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
            />
          )}
          {trip.destinations?.[0] && (
            <Chip 
              icon={<LocationOnIcon sx={{ fontSize: '14px !important', color: `${LUNA.TEAL} !important` }} />}
              label={trip.destinations[0].name}
              sx={{ bgcolor: alpha(LUNA.WHITE, 0.1), color: LUNA.WHITE, height: 24, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
            />
          )}
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          {trip.title}
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.9rem' }}>
          {trip.short_description}
        </Typography>

        <Button
          component={Link}
          to={`/trips/${trip.id}`}
          variant="contained"
          fullWidth
          sx={{ 
            py: 1.2,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            background: `linear-gradient(135deg, ${LUNA.TEAL} 0%, ${LUNA.NAVY} 100%)`,
            boxShadow: `0 4px 15px ${alpha(LUNA.TEAL, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${LUNA.NAVY} 0%, ${LUNA.TEAL} 100%)`,
              boxShadow: `0 6px 20px ${alpha(LUNA.TEAL, 0.6)}`,
            }
          }}
        >
          Découvrir 
        </Button>
      </CardContent>
    </StyledCard>
  );
};

export default TripCard;