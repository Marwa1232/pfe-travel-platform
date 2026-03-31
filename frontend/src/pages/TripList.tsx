import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Paper,
  Chip,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Pagination,
  Skeleton,
  InputAdornment,
  IconButton,
  Drawer,
  Button,
  useTheme,
  useMediaQuery,
  Fab,
  Badge,
  Divider,
  Breadcrumbs,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha } from '@mui/material/styles';
import {
  Search,
  FilterList,
  Clear,
  Sort,
  AttachMoney,
  LocationOn,
  Category,
  AccessTime,
  Close,
  Tune,
  ViewList,
  ViewModule,
  TrendingUp,
} from '@mui/icons-material';
import { tripAPI, destinationAPI } from '../services/api';
import TripCard from '../components/TripCard';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0,191,165,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
}));

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const FilterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,191,165,0.2)',
  },
  '&.MuiChip-clickable': {
    '&:active': {
      boxShadow: 'none',
    },
  },
}));

const ViewToggle = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  padding: theme.spacing(0.5),
  borderRadius: theme.spacing(2),
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#00BFA5',
    color: 'white',
  },
}));

// Types
interface Trip {
  id: number;
  title: string;
  short_description: string;
  base_price: string;  // Changé de number à string pour correspondre au TripCard
  currency: string;
  duration_days: number;
  difficulty_level: string;
  images: Array<{ url: string; is_cover: boolean }>;
  destinations?: Array<{ id: number; name: string }>;
  categories?: Array<{ id: number; name: string }>;
}

interface Destination {
  id: number;
  name: string;
  country: string;
  trips_count?: number;
}

interface Category {
  id: number;
  name: string;
  trips_count?: number;
}

const TripList: React.FC = () => {
  const navigate = useNavigate(); // Ajout de useNavigate
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('sm'));

  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedDestinations, setSelectedDestinations] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [filters, setFilters] = useState({
    destination: '',
    category: '',
    min_price: '',
    max_price: '',
    search: '',
    difficulty: '',
    duration: '',
  });

  // Catégories statiques en attendant l'API
  const staticCategories: Category[] = [
    { id: 1, name: 'Aventure', trips_count: 12 },
    { id: 2, name: 'Détente', trips_count: 8 },
    { id: 3, name: 'Culturel', trips_count: 15 },
    { id: 4, name: 'Gastronomique', trips_count: 6 },
    { id: 5, name: 'Sportif', trips_count: 9 },
  ];

  useEffect(() => {
    loadInitialData();
    
    // Read URL search params and set filters
    const urlSearch = searchParams.get('search') || '';
    const urlDestination = searchParams.get('destination') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlMaxPrice = searchParams.get('max_price') || '';
    const urlIds = searchParams.get('ids') || '';
    
    console.log('[TripList] URL params:', { urlSearch, urlDestination, urlCategory, urlMaxPrice, urlIds });
    
    if (urlSearch || urlDestination || urlCategory || urlMaxPrice) {
      console.log('[TripList] Setting filters from URL');
      setFilters(prev => ({
        ...prev,
        search: urlSearch,
        destination: urlDestination,
        category: urlCategory,
        max_price: urlMaxPrice,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, sortBy, selectedDestinations, selectedCategories, searchParams]);

  const loadInitialData = async () => {
    try {
      const destinationsRes = await destinationAPI.list();
      setDestinations(destinationsRes.data);
      setCategories(staticCategories); // Utilisation des catégories statiques
    } catch (error) {
      console.error('Error loading filters data:', error);
    }
  };

  const loadTrips = async () => {
    try {
      setLoading(true);
      
      // Check if we have specific trip IDs from AI search
      const urlIds = searchParams.get('ids');
      
      if (urlIds) {
        // AI search mode: fetch only the specific trips by ID
        console.log('[TripList] AI search mode - fetching trips by IDs:', urlIds);
        const tripIds = urlIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        
        if (tripIds.length > 0) {
          // Fetch each trip by ID
          const tripsPromises = tripIds.map(id => tripAPI.get(id));
          const responses = await Promise.all(tripsPromises);
          const tripsData = responses.map(res => res.data);
          
          console.log('[TripList] AI search trips loaded:', tripsData);
          setTrips(tripsData);
          setTotalPages(1); // No pagination for AI search results
        } else {
          setTrips([]);
          setTotalPages(1);
        }
      } else {
        // Regular filter mode: use the standard list endpoint
        console.log('[TripList] Loading trips with filters:', filters);
        const params: any = {
          ...filters,
          page,
          limit: 12,
        };
        
        // Add selected destinations and categories to filters
        if (selectedDestinations.length > 0) {
          params.destination = selectedDestinations.join(',');
        }
        if (selectedCategories.length > 0) {
          params.category = selectedCategories.join(',');
        }
        
        // Ajout du tri
        if (sortBy === 'price_asc') params.order = { base_price: 'asc' };
        if (sortBy === 'price_desc') params.order = { base_price: 'desc' };
        
        const response = await tripAPI.list(params);
        console.log('[TripList] API Response:', response.data);
        // Handle both Hydra format and regular array response
        const tripsData = response.data['hydra:member'] || response.data;
        console.log('[TripList] Trips data:', tripsData);
        setTrips(tripsData);
        // Calculate total pages from response
        const totalItems = response.data['hydra:totalItems'] || tripsData.length || 0;
        setTotalPages(Math.ceil(totalItems / 12));
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleDestinationToggle = (destinationId: number) => {
    setSelectedDestinations(prev =>
      prev.includes(destinationId)
        ? prev.filter(id => id !== destinationId)
        : [...prev, destinationId]
    );
    setPage(1);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      destination: '',
      category: '',
      min_price: '',
      max_price: '',
      search: '',
      difficulty: '',
      duration: '',
    });
    setSelectedDestinations([]);
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setPage(1);
  };

  const activeFiltersCount = 
    Object.values(filters).filter(v => v && v !== '').length +
    selectedDestinations.length +
    selectedCategories.length;

  // Skeleton loading
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Grid xs={12} sm={6} md={4} key={index}>
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
      </Grid>
    ));
  };

  const FilterContent = () => (
    <Box>
      {/* Search Bar */}
      <FilterSection>
        <TextField
          fullWidth
          placeholder="Rechercher un voyage..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#00BFA5' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.common.white, 0.8),
            }
          }}
        />
      </FilterSection>

      {/* Destinations */}
      <FilterSection>
        <FilterTitle>
          <LocationOn sx={{ color: '#00BFA5' }} />
          Destinations
        </FilterTitle>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {destinations.map((dest) => (
            <StyledChip
              key={dest.id}
              label={`${dest.name} ${dest.trips_count ? `(${dest.trips_count})` : ''}`}
              onClick={() => handleDestinationToggle(dest.id)}
              color={selectedDestinations.includes(dest.id) ? 'primary' : 'default'}
              variant={selectedDestinations.includes(dest.id) ? 'filled' : 'outlined'}
              size="small"
              sx={{ 
                backgroundColor: selectedDestinations.includes(dest.id) 
                  ? '#00BFA5' 
                  : 'transparent',
              }}
            />
          ))}
        </Box>
      </FilterSection>

      {/* Categories */}
      <FilterSection>
        <FilterTitle>
          <Category sx={{ color: '#00BFA5' }} />
          Catégories
        </FilterTitle>
        <Box>
          {categories.map((cat) => (
            <StyledChip
              key={cat.id}
              label={`${cat.name} ${cat.trips_count ? `(${cat.trips_count})` : ''}`}
              onClick={() => handleCategoryToggle(cat.id)}
              color={selectedCategories.includes(cat.id) ? 'primary' : 'default'}
              variant={selectedCategories.includes(cat.id) ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
      </FilterSection>

      {/* Price Range */}
      <FilterSection>
        <FilterTitle>
          <AttachMoney sx={{ color: '#00BFA5' }} />
          Budget
        </FilterTitle>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
            onChangeCommitted={() => {
              handleFilterChange('min_price', priceRange[0]);
              handleFilterChange('max_price', priceRange[1]);
            }}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            step={50}
            sx={{
              color: '#00BFA5',
              '& .MuiSlider-thumb': {
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0 0 0 8px ${alpha('#00BFA5', 0.16)}`,
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {priceRange[0]} DT
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {priceRange[1]} DT
            </Typography>
          </Box>
        </Box>
      </FilterSection>

      {/* Difficulty */}
      <FilterSection>
        <FilterTitle>
          <TrendingUp sx={{ color: '#00BFA5' }} />
          Difficulté
        </FilterTitle>
        <FormGroup>
          {['Facile', 'Intermédiaire', 'Difficile'].map((level) => (
            <FormControlLabel
              key={level}
              control={
                <Checkbox
                  checked={filters.difficulty === level.toLowerCase()}
                  onChange={(e) => handleFilterChange('difficulty', e.target.checked ? level.toLowerCase() : '')}
                  sx={{
                    color: 'text.secondary',
                    '&.Mui-checked': { color: '#00BFA5' },
                  }}
                />
              }
              label={level}
            />
          ))}
        </FormGroup>
      </FilterSection>

      {/* Duration */}
      <FilterSection>
        <FilterTitle>
          <AccessTime sx={{ color: '#00BFA5' }} />
          Durée
        </FilterTitle>
        <Select
          fullWidth
          value={filters.duration}
          onChange={(e) => handleFilterChange('duration', e.target.value)}
          displayEmpty
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="">Toutes les durées</MenuItem>
          <MenuItem value="1-3">1-3 jours</MenuItem>
          <MenuItem value="4-7">4-7 jours</MenuItem>
          <MenuItem value="8-14">8-14 jours</MenuItem>
          <MenuItem value="15+">15+ jours</MenuItem>
        </Select>
      </FilterSection>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Clear />}
          onClick={clearFilters}
          sx={{ 
            mt: 2, 
            borderRadius: 2,
            borderColor: alpha(theme.palette.primary.main, 0.3),
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          Effacer les filtres ({activeFiltersCount})
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      pt: 4,
      pb: 6,
    }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3, color: 'text.secondary' }}>
          <Link 
            color="inherit" 
            to="/" 
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            Accueil
          </Link>
          <Typography color="text.primary">Voyages</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Découvrez nos voyages
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {trips.length}+ voyages extraordinaires vous attendent
          </Typography>
        </Box>

        {/* Mobile Filter Button */}
        {isMobile && (
          <Fab
            variant="extended"
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
            }}
            onClick={() => setMobileFilterOpen(true)}
          >
            <StyledBadge badgeContent={activeFiltersCount} color="primary">
              <Tune sx={{ mr: 1 }} />
            </StyledBadge>
            Filtres
          </Fab>
        )}

        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="left"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          PaperProps={{
            sx: {
              width: '85%',
              maxWidth: 360,
              p: 3,
              backgroundColor: 'background.default',
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>Filtres</Typography>
            <IconButton onClick={() => setMobileFilterOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <FilterContent />
        </Drawer>

        <Grid container spacing={3}>
          {/* Desktop Filters */}
          {!isMobile && (
            <Grid xs={12} md={3}>
              <StyledPaper>
                <FilterContent />
              </StyledPaper>
            </Grid>
          )}

          {/* Trip List */}
          <Grid xs={12} md={!isMobile ? 9 : 12}>
            {/* Toolbar */}
            <Paper
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {trips.length} voyages trouvés
                </Typography>
                {activeFiltersCount > 0 && !isMobile && (
                  <Chip
                    label={`${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif${activeFiltersCount > 1 ? 's' : ''}`}
                    onDelete={clearFilters}
                    size="small"
                    sx={{ borderRadius: 1.5 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Sort */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    displayEmpty
                    sx={{ borderRadius: 2 }}
                    startAdornment={
                      <InputAdornment position="start">
                        <Sort sx={{ color: '#00BFA5', fontSize: 20 }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="popular">Les plus populaires</MenuItem>
                    <MenuItem value="price_asc">Prix croissant</MenuItem>
                    <MenuItem value="price_desc">Prix décroissant</MenuItem>
                    <MenuItem value="newest">Nouveautés</MenuItem>
                  </Select>
                </FormControl>

                {/* View Toggle - Desktop only */}
                {!isTablet && (
                  <ViewToggle>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('grid')}
                      sx={{
                        backgroundColor: viewMode === 'grid' ? 'primary.main' : 'transparent',
                        color: viewMode === 'grid' ? 'white' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: viewMode === 'grid' ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <ViewModule />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('list')}
                      sx={{
                        backgroundColor: viewMode === 'list' ? 'primary.main' : 'transparent',
                        color: viewMode === 'list' ? 'white' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: viewMode === 'list' ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <ViewList />
                    </IconButton>
                  </ViewToggle>
                )}
              </Box>
            </Paper>

            {/* Trip Cards */}
            {loading ? (
              <Grid container spacing={3}>
                {renderSkeletons()}
              </Grid>
            ) : trips.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun voyage trouvé
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Essayez de modifier vos filtres
                </Typography>
                <Button
                  variant="contained"
                  onClick={clearFilters}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Effacer les filtres
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {trips.map((trip) => (
                  <Grid 
                    xs={12} 
                    sm={viewMode === 'grid' ? 6 : 12} 
                    md={viewMode === 'grid' ? 4 : 12} 
                    key={trip.id}
                  >
                    <TripCard trip={trip} />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TripList;