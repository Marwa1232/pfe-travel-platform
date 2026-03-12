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
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
  reviews_count?: number;
}

interface TripCardProps {
  trip: Trip;
}

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 360,
  minWidth: 280,
  height: 480,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #00BFA5, #0D47A1, #00BFA5)',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0,191,165,0.2)',
  },
}));

const StyledCardMedia = styled(CardMedia)({
  height: 200,
  width: '100%',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
});

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.2),
  fontSize: '0.95rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0,191,165,0.3)',
  },
}));

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const coverImage = fixImageUrl(trip.images?.find(img => img.is_cover)?.url || trip.images?.[0]?.url || '');
  const destinationName = trip.destinations?.[0]?.name || '';
  const [isFavorite, setIsFavorite] = React.useState(false);
  


  return (
    <StyledCard>
      {/* Image Container avec hauteur fixe */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: 200, flexShrink: 0 }}>
        <CardMedia
          component="img"
          image={coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80'}
          alt={trip.title}
          sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
        
        {/* Badge de durée */}
        <Chip 
          icon={<CalendarMonthIcon sx={{ fontSize: 14 }} />}
          label={`${trip.duration_days} jours`}
          size="small"
          sx={{ 
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(5px)',
            fontWeight: 600,
            fontSize: '0.8rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />

        {/* Bouton favoris */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(5px)',
            '&:hover': { backgroundColor: 'white' },
          }}
          size="small"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? 
            <FavoriteIcon sx={{ fontSize: 20, color: '#FF6B6B' }} /> : 
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
          }
        </IconButton>
      </Box>

      {/* Contenu avec hauteur fixe */}
      <CardContent sx={{ 
        flexGrow: 1, 
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        height: 200,
      }}>
        {/* Titre */}
        <Typography 
          variant="h6" 
          component="h2"
          sx={{ 
            fontWeight: 700,
            fontSize: '1.1rem',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: 42,
            mb: 0.5,
          }}
        >
          {trip.title}
        </Typography>
        
        {/* Destination */}
        {destinationName && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            mb: 1,
            height: 24,
          }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {destinationName}
            </Typography>
          </Box>
        )}

        
        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: 40,
            lineHeight: 1.5,
          }}
        >
          {trip.short_description || 'Découvrez cette expérience unique et inoubliable.'}
        </Typography>

        {/* Prix */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 'auto',
          height: 40,
        }}>
          <Box>
            <Typography variant="h6" color="primary" fontWeight={700} sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
              {trip.base_price}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {trip.currency} / personne
            </Typography>
          </Box>
          
          {/* Badge "Populaire" */}
          {trip.rating && trip.rating > 4.5 && (
            <Chip
              label="Populaire"
              size="small"
              sx={{
                backgroundColor: alpha('#00BFA5', 0.1),
                color: '#00BFA5',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>
      </CardContent>

      {/* Bouton */}
      <Box sx={{ p: 2, pt: 0, height: 64, flexShrink: 0 }}>
        <Button
          component={Link}
          to={`/trips/${trip.id}`}
          variant="contained"
          fullWidth
          sx={{ 
            height: 44,
            background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0,191,165,0.3)',
            },
          }}
        >
          Voir détails
        </Button>
      </Box>
    </StyledCard>
  );
};

export default TripCard;