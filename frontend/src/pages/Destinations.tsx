import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Paper,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Styled components professionnels
const PageHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(6),
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  background: 'linear-gradient(135deg, #1A2027, #2D3748)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.text.secondary,
  maxWidth: 600,
  margin: '0 auto',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const DestinationCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const DestinationImage = styled(Box)({
  height: 160,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: 'white',
  },
});

interface Destination {
  id: number;
  name: string;
  country: string;
  region?: string;
  image?: string;
  trips_count?: number;
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
      
      const enhancedDestinations = response.data.map((dest: Destination) => ({
        ...dest,
        image: `https://source.unsplash.com/400x300/?${dest.name.toLowerCase()},travel`,
        trips_count: Math.floor(Math.random() * 30) + 5,
      }));
      
      setDestinations(enhancedDestinations);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des destinations');
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: destinations.length,
    countries: new Set(destinations.map(d => d.country)).size,
    totalTrips: destinations.reduce((acc, d) => acc + (d.trips_count || 0), 0),
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <PageHeader>
          <Title variant="h1">
            Destinations
          </Title>
          <Subtitle variant="h6">
            Découvrez les plus belles destinations pour vos prochaines aventures
          </Subtitle>
        </PageHeader>

        {/* Search Bar */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <SearchField
            placeholder="Rechercher une destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#00BFA5' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={fetchDestinations}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    <RefreshIcon fontSize="small" />
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ width: '100%', maxWidth: 500 }}
          />
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={4}>
            <StatCard elevation={0}>
              <Avatar sx={{ bgcolor: alpha('#00BFA5', 0.1), color: '#00BFA5' }}>
                <PublicIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Destinations</Typography>
              </Box>
            </StatCard>
          </Grid>
          <Grid item xs={4}>
            <StatCard elevation={0}>
              <Avatar sx={{ bgcolor: alpha('#0D47A1', 0.1), color: '#0D47A1' }}>
                <LocationOnIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{stats.countries}</Typography>
                <Typography variant="caption" color="text.secondary">Pays</Typography>
              </Box>
            </StatCard>
          </Grid>
          <Grid item xs={4}>
            <StatCard elevation={0}>
              <Avatar sx={{ bgcolor: alpha('#FF6B6B', 0.1), color: '#FF6B6B' }}>
                <FlightTakeoffIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{stats.totalTrips}+</Typography>
                <Typography variant="caption" color="text.secondary">Voyages</Typography>
              </Box>
            </StatCard>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#00BFA5' }} />
          </Box>
        ) : filteredDestinations.length === 0 ? (
          <Paper sx={{ textAlign: 'center', py: 6, borderRadius: 2 }}>
            <PublicIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune destination trouvée
            </Typography>
            {searchQuery && (
              <Button variant="outlined" onClick={() => setSearchQuery('')}>
                Effacer la recherche
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredDestinations.map((dest) => (
              <Grid item xs={12} sm={6} md={4} key={dest.id}>
                <DestinationCard onClick={() => navigate(`/trips?destination=${dest.name.toLowerCase()}`)}>
                  <DestinationImage sx={{ backgroundImage: `url(${dest.image})` }} />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {dest.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {dest.country}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        icon={<FlightTakeoffIcon />}
                        label={`${dest.trips_count} voyages`}
                        sx={{ bgcolor: alpha('#00BFA5', 0.1), color: '#00BFA5' }}
                      />
                      <Typography variant="body2" color="primary" fontWeight={600}>
                        Explorer →
                      </Typography>
                    </Box>
                  </CardContent>
                </DestinationCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Destinations;