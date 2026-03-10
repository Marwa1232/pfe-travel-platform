import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Fade,
  Zoom,
  Avatar,
  Paper,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import TerrainIcon from '@mui/icons-material/Terrain';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import ExploreIcon from '@mui/icons-material/Explore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Styled components
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  height: '100%',
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
    boxShadow: '0 12px 32px rgba(0,191,165,0.15)',
  },
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
}));

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
  position: 'relative',
  overflow: 'hidden',
  pt: 12,
  pb: 4,
});

const DestinationImage = styled(Box)({
  height: 180,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
});

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0,191,165,0.15)',
  },
}));

const FloatingIcon = styled(Box)({
  position: 'absolute',
  opacity: 0.1,
  color: '#00BFA5',
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-20px)' },
  },
});

interface Destination {
  id: number;
  name: string;
  country: string;
  region?: string;
  image?: string;
  description?: string;
  trips_count?: number;
  popularity?: number;
}

const Destinations: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/destinations');
      console.log('Destinations response:', response.data);
      
      // Simuler des données pour l'exemple (à remplacer par les vraies données API)
      const enhancedDestinations = response.data.map((dest: Destination, index: number) => ({
        ...dest,
        image: `https://source.unsplash.com/400x300/?${dest.name.toLowerCase()},travel`,
        trips_count: Math.floor(Math.random() * 50) + 10,
        popularity: Math.floor(Math.random() * 100),
      }));
      
      setDestinations(enhancedDestinations);
    } catch (err: any) {
      console.error('Error loading destinations:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des destinations');
    } finally {
      setLoading(false);
    }
  };

  const getDestinationIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('djerba') || lowerName.includes('beach') || lowerName.includes('mer')) {
      return <BeachAccessIcon sx={{ color: '#00BFA5' }} />;
    }
    if (lowerName.includes('sahara') || lowerName.includes('désert') || lowerName.includes('montagne')) {
      return <TerrainIcon sx={{ color: '#0D47A1' }} />;
    }
    return <ExploreIcon sx={{ color: '#FF6B6B' }} />;
  };

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dest.region && dest.region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Statistiques
  const stats = {
    total: destinations.length,
    countries: new Set(destinations.map(d => d.country)).size,
    totalTrips: destinations.reduce((acc, d) => acc + (d.trips_count || 0), 0),
  };

  return (
    <BackgroundBox>
      {/* Éléments décoratifs flottants */}
      <FloatingIcon sx={{ top: '10%', left: '5%', transform: 'rotate(-15deg)' }}>
        <PublicIcon sx={{ fontSize: 120 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '10%', right: '5%', transform: 'rotate(20deg)' }}>
        <FlightTakeoffIcon sx={{ fontSize: 100 }} />
      </FloatingIcon>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                }}
              >
                <PublicIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h2" component="h1" fontWeight="800" sx={{
                background: 'linear-gradient(135deg, #00BFA5, #0D47A1, #667eea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Destinations
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Découvrez les destinations les plus populaires pour vos prochaines aventures
            </Typography>
          </Box>
        </Fade>

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Zoom in timeout={500}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#00BFA5', 0.1), color: '#00BFA5' }}>
                    <PublicIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Destinations</Typography>
                    <Typography variant="h5" fontWeight="700">{stats.total}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Zoom in timeout={600}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#0D47A1', 0.1), color: '#0D47A1' }}>
                    <LocationOnIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Pays</Typography>
                    <Typography variant="h5" fontWeight="700">{stats.countries}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Zoom in timeout={700}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#FF6B6B', 0.1), color: '#FF6B6B' }}>
                    <FlightTakeoffIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Voyages disponibles</Typography>
                    <Typography variant="h5" fontWeight="700">{stats.totalTrips}+</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
        </Grid>

        {/* Barre de recherche et actions */}
        <GlassPaper sx={{ mb: 4, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher une destination, un pays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#00BFA5' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDestinations}
              sx={{ borderRadius: 2 }}
            >
              Actualiser
            </Button>
          </Box>
        </GlassPaper>

        {error && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={fetchDestinations}>
                  Réessayer
                </Button>
              }
            >
              {error}
            </Alert>
          </Fade>
        )}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={50} thickness={4} sx={{ color: '#00BFA5' }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Chargement des destinations...
            </Typography>
          </Box>
        ) : filteredDestinations.length === 0 ? (
          <GlassPaper sx={{ textAlign: 'center', py: 6 }}>
            <PublicIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'Aucune destination trouvée' : 'Aucune destination'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery ? 'Essayez d\'autres termes de recherche' : 'Aucune destination pour le moment'}
            </Typography>
            {searchQuery && (
              <Button variant="outlined" onClick={() => setSearchQuery('')}>
                Effacer la recherche
              </Button>
            )}
          </GlassPaper>
        ) : (
          <Fade in timeout={500}>
            <Grid container spacing={3}>
              {filteredDestinations.map((dest, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={dest.id}>
                  <Zoom in timeout={500 + index * 100}>
                    <GlassCard onClick={() => navigate(`/trips?destination=${dest.name.toLowerCase()}`)}>
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <DestinationImage
                          sx={{
                            backgroundImage: `url(${dest.image})`,
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            borderRadius: 2,
                            px: 1,
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          {getDestinationIcon(dest.name)}
                          <Typography variant="caption" fontWeight="600">
                            {dest.popularity}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h5" fontWeight="700">
                            {dest.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {dest.country}
                          </Typography>
                          {dest.region && (
                            <>
                              <Typography variant="body2" color="text.secondary">•</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {dest.region}
                              </Typography>
                            </>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FlightTakeoffIcon sx={{ fontSize: 16, color: '#00BFA5' }} />
                            <Typography variant="body2" fontWeight="600" color="primary">
                              {dest.trips_count} voyages
                            </Typography>
                          </Box>
                          <Chip
                            label="Explorer"
                            size="small"
                            sx={{
                              bgcolor: alpha('#00BFA5', 0.1),
                              color: '#00BFA5',
                              fontWeight: 600,
                              '&:hover': { bgcolor: alpha('#00BFA5', 0.2) }
                            }}
                          />
                        </Box>
                      </CardContent>
                    </GlassCard>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Fade>
        )}
      </Container>
    </BackgroundBox>
  );
};

export default Destinations;