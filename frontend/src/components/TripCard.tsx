
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
}

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const coverImage = fixImageUrl(trip.images?.find(img => img.is_cover)?.url || trip.images?.[0]?.url || '');
  const destinationName = trip.destinations?.[0]?.name || '';

  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={coverImage || '/placeholder.jpg'}
          alt={trip.title}
          sx={{ objectFit: 'cover' }}
        />
        <Chip 
          icon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
          label={`${trip.duration_days} jours`}
          size="small"
          sx={{ 
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255,255,255,0.95)',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography 
          gutterBottom 
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
            minHeight: '2.6rem',
          }}
        >
          {trip.title}
        </Typography>
        
        {destinationName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {destinationName}
            </Typography>
          </Box>
        )}
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6rem',
          }}
        >
          {trip.short_description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box>
            <Typography variant="h6" color="primary" fontWeight={700} sx={{ fontSize: '1.25rem' }}>
              {trip.base_price}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {trip.currency}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          component={Link}
          to={`/trips/${trip.id}`}
          variant="contained"
          fullWidth
          sx={{ 
            borderRadius: 3,
            py: 1.2,
            background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
            '&:hover': {
              background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
            },
          }}
        >
          Voir détails
        </Button>
      </Box>
    </Card>
  );
};

export default TripCard;
