import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import { styled, alpha } from '@mui/material/styles';
import { fixImageUrl } from '../services/api';

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

// Carte avec dimensions PARFAITEMENT identiques
const StyledCard = styled(Card)(({ theme }) => ({
  width: 300, // Largeur FIXE en pixels
  height: 460, // Hauteur FIXE en pixels
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  margin: '0 auto', // Centre la carte si besoin
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,191,165,0.15)',
  },
}));

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const coverImage = fixImageUrl(trip.images?.find(img => img.is_cover)?.url || trip.images?.[0]?.url || '');
  const destinationName = trip.destinations?.[0]?.name || '';
  const [isFavorite, setIsFavorite] = React.useState(false);

  return (
    <StyledCard>
      {/* Image - Hauteur fixe 180px */}
      <Box sx={{ height: 180, width: '100%', position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80'}
          alt={trip.title}
          sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
        
       

        {/* Bouton favoris */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: 0.5,
            '&:hover': { backgroundColor: 'white' },
          }}
          size="small"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? 
            <FavoriteIcon sx={{ fontSize: 16, color: '#FF6B6B' }} /> : 
            <FavoriteBorderIcon sx={{ fontSize: 16 }} />
          }
        </IconButton>
      </Box>

      {/* Contenu - Hauteur fixe */}
      <CardContent sx={{ 
        height: 216, // Hauteur fixe
        padding: '12px 12px 8px 12px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Titre */}
        <Typography 
          variant="subtitle1"
          sx={{ 
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: 40,
            mb: 0.5,
          }}
        >
          {trip.title}
        </Typography>
        
        {/* Destination */}
        {destinationName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 20, mb: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {destinationName}
            </Typography>
          </Box>
        )}

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: 40,
            lineHeight: 1.4,
            fontSize: '0.8rem',
            mb: 1,
          }}
        >
          {trip.short_description || 'Découvrez cette expérience unique.'}
        </Typography>

        {/* Prix */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: 36,
        }}>
          <Box>
            <Typography variant="h6" color="primary" fontWeight={700} sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
              {trip.base_price}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {trip.currency}/pers
            </Typography>
          </Box>
          
          {trip.rating && trip.rating > 4.5 && (
            <Chip
              label="Populaire"
              size="small"
              sx={{
                backgroundColor: alpha('#00BFA5', 0.1),
                color: '#00BFA5',
                fontWeight: 600,
                height: 20,
                fontSize: '0.65rem',
              }}
            />
          )}
        </Box>
      </CardContent>

      {/* Bouton */}
      <Box sx={{ height: 64, padding: '0 12px 12px 12px' }}>
        <Button
          component={Link}
          to={`/trips/${trip.id}`}
          variant="contained"
          fullWidth
          sx={{ 
            height: 40,
            background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
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