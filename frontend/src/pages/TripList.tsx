import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Container, TextField, Select, MenuItem, FormControl,
  Typography, Box, Paper, Chip, Slider, FormGroup,
  FormControlLabel, Checkbox, Pagination, Skeleton,
  InputAdornment, IconButton, Drawer, Button,
  useTheme, useMediaQuery, Fab, Badge, Stack,
  Breadcrumbs,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha } from '@mui/material/styles';
import {
  Search, FilterList, Clear, Sort, AttachMoney,
  LocationOn, Category, AccessTime, Close, Tune,
  TrendingUp,
} from '@mui/icons-material';
import { tripAPI, destinationAPI } from '../services/api';
import TripCard2 from '../pages/TripCard2';

// ─── Design tokens ─────────────────────────────────────────────────
const T = {
  teal:   '#0EA5A0',
  navy:   '#0F2D5C',
  paper:  '#FFFFFF',
  white:  '#FFFFFF',
  border: '#E8EDF2',
  slate:  '#64748B',
};

// ─── Styled ────────────────────────────────────────────────────────
const FilterPanel = styled(Paper)({
  padding: 24,
  borderRadius: 20,
  backgroundColor: T.white,
  border: `1px solid ${T.border}`,
  boxShadow: '0 4px 20px rgba(15,45,92,0.06)',
});

const SectionTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: T.navy,
  marginBottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

// ─── Types ─────────────────────────────────────────────────────────
interface Trip {
  id: number;
  title: string;
  short_description: string;
  base_price: string;
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

// ─── Filter state (single source of truth) ────────────────────────
interface Filters {
  search: string;
  destination: string;
  category: string;
  min_price: string;
  max_price: string;
  difficulty: string;
  duration: string;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  destination: '',
  category: '',
  min_price: '',
  max_price: '',
  difficulty: '',
  duration: '',
};

const CATEGORIES = [
  { id: 1, name: 'Aventure' },
  { id: 2, name: 'Détente' },
  { id: 3, name: 'Culturel' },
  { id: 4, name: 'Gastronomique' },
  { id: 5, name: 'Sportif' },
];

const DIFFICULTIES = [
  { value: 'easy',     label: 'Facile' },
  { value: 'medium',   label: 'Intermédiaire' },
  { value: 'hard',     label: 'Difficile' },
];

const DURATIONS = [
  { value: '',      label: 'Toutes les durées' },
  { value: '1-3',   label: '1-3 jours' },
  { value: '4-7',   label: '4-7 jours' },
  { value: '8-14',  label: '8-14 jours' },
  { value: '15+',   label: '15+ jours' },
];

// ═══════════════════════════════════════════════════════════════════
const TripList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet  = useMediaQuery(theme.breakpoints.down('sm'));

  const [trips, setTrips]               = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading]           = useState(true);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalItems, setTotalItems]     = useState(0);

  // ── Single filter state ──────────────────────────────────────────
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    search:      searchParams.get('search')      || '',
    destination: searchParams.get('destination') || '',
    category:    searchParams.get('category')    || '',
    max_price:   searchParams.get('max_price')   || '',
  }));

  // Local slider state (committed on release)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  // ── Load destinations once ───────────────────────────────────────
  useEffect(() => {
    destinationAPI.list()
      .then(r => setDestinations(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, []);

  // ── Load trips whenever filters/page change ─────────────────
  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const urlIds = searchParams.get('ids');

      if (urlIds) {
        // AI search result — load specific trip IDs
        const ids = urlIds.split(',').map(Number).filter(Boolean);
        const responses = await Promise.all(ids.map(id => tripAPI.get(id)));
        setTrips(responses.map(r => r.data));
        setTotalPages(1);
        setTotalItems(ids.length);
        return;
      }

      // Build params — only send non-empty values
      const params: Record<string, any> = { page, limit: 12 };

      if (filters.search)      params.search      = filters.search;
      if (filters.destination) params.destination = filters.destination;
      if (filters.category)    params.category    = filters.category;
      if (filters.difficulty)  params.difficulty  = filters.difficulty;
      if (filters.duration)    params.duration    = filters.duration;
      if (filters.min_price)   params.min_price   = filters.min_price;
      if (filters.max_price)   params.max_price   = filters.max_price;

      const response = await tripAPI.list(params);
      const data = response.data;

      // Handle both API Platform hydra format and plain array
      const tripsData: Trip[] = data['hydra:member'] ?? (Array.isArray(data) ? data : []);
      const total: number     = data['hydra:totalItems'] ?? tripsData.length;

      setTrips(tripsData);
      setTotalItems(total);
      setTotalPages(Math.max(1, Math.ceil(total / 12)));
    } catch (error) {
      console.error('Error loading trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter helpers ───────────────────────────────────────────────
  const setFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const toggleDestination = (id: number) => {
    setFilter('destination', filters.destination === String(id) ? '' : String(id));
  };

  const toggleCategory = (id: number) => {
    setFilter('category', filters.category === String(id) ? '' : String(id));
  };

  const toggleDifficulty = (value: string) => {
    setFilter('difficulty', filters.difficulty === value ? '' : value);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPriceRange([0, 5000]);
    setPage(1);
  };

  const activeCount =
    Object.values(filters).filter(v => v !== '').length;

  // ── Filter sidebar ───────────────────────────────────────────────
  const FilterContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>

      {/* Search */}
      <TextField
        fullWidth size="small"
        placeholder="Rechercher un voyage..."
        value={filters.search}
        onChange={e => setFilter('search', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: T.teal, fontSize: 18 }} />
            </InputAdornment>
          ),
          endAdornment: filters.search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setFilter('search', '')}>
                <Clear sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: { borderRadius: '12px' },
        }}
      />

      {/* Destinations */}
      <Box>
        <SectionTitle>
          <LocationOn sx={{ fontSize: 14, color: T.teal }} />
          Destinations
        </SectionTitle>
        <Box sx={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {destinations.map(dest => {
            const active = filters.destination === String(dest.id);
            return (
              <Chip key={dest.id}
                label={dest.name}
                size="small"
                onClick={() => toggleDestination(dest.id)}
                sx={{
                  height: 28, fontSize: 12, fontWeight: 600, borderRadius: '10px',
                  bgcolor: active ? T.navy : 'transparent',
                  color: active ? T.white : T.navy,
                  border: `1.5px solid ${active ? T.navy : alpha(T.navy, 0.15)}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: active ? T.navy : alpha(T.teal, 0.08), borderColor: T.teal },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Categories */}
      <Box>
        <SectionTitle>
          <Category sx={{ fontSize: 14, color: T.teal }} />
          Catégories
        </SectionTitle>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {CATEGORIES.map(cat => {
            const active = filters.category === String(cat.id);
            return (
              <Chip key={cat.id}
                label={cat.name}
                size="small"
                onClick={() => toggleCategory(cat.id)}
                sx={{
                  height: 28, fontSize: 12, fontWeight: 600, borderRadius: '10px',
                  bgcolor: active ? T.teal : 'transparent',
                  color: active ? T.white : T.navy,
                  border: `1.5px solid ${active ? T.teal : alpha(T.navy, 0.15)}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: active ? T.teal : alpha(T.teal, 0.08), borderColor: T.teal },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Price range */}
      <Box>
        <SectionTitle>
          <AttachMoney sx={{ fontSize: 14, color: T.teal }} />
          Budget
        </SectionTitle>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={(_, val) => setPriceRange(val as [number, number])}
            onChangeCommitted={(_, val) => {
              const [min, max] = val as [number, number];
              setFilters(prev => ({ ...prev, min_price: String(min), max_price: String(max) }));
              setPage(1);
            }}
            valueLabelDisplay="auto"
            min={0} max={5000} step={100}
            sx={{
              color: T.teal,
              '& .MuiSlider-thumb': { 
                '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${alpha(T.teal, 0.14)}` } 
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: T.slate }}>{priceRange[0].toLocaleString()} DT</Typography>
            <Typography sx={{ fontSize: 11, color: T.slate }}>{priceRange[1].toLocaleString()} DT</Typography>
          </Box>
        </Box>
      </Box>

      {/* Difficulty */}
      <Box>
        <SectionTitle>
          <TrendingUp sx={{ fontSize: 14, color: T.teal }} />
          Difficulté
        </SectionTitle>
        <FormGroup>
          {DIFFICULTIES.map(d => (
            <FormControlLabel key={d.value}
              control={
                <Checkbox
                  size="small"
                  checked={filters.difficulty === d.value}
                  onChange={() => toggleDifficulty(d.value)}
                  sx={{ 
                    color: T.slate, 
                    '&.Mui-checked': { color: T.teal }, 
                    p: 0.5 
                  }}
                />
              }
              label={<Typography sx={{ fontSize: 13, color: T.navy }}>{d.label}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Duration */}
      <Box>
        <SectionTitle>
          <AccessTime sx={{ fontSize: 14, color: T.teal }} />
          Durée
        </SectionTitle>
        <Select
          fullWidth size="small" value={filters.duration}
          onChange={e => setFilter('duration', e.target.value)}
          sx={{ 
            borderRadius: '12px', 
            fontSize: 13,
            '& .MuiSelect-select': { py: 1.2 },
          }}
        >
          {DURATIONS.map(d => (
            <MenuItem key={d.value} value={d.value} sx={{ fontSize: 13 }}>{d.label}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Clear */}
      {activeCount > 0 && (
        <Button fullWidth variant="outlined" startIcon={<Clear />} onClick={clearFilters}
          sx={{ 
            borderRadius: '12px', 
            borderColor: alpha(T.navy, 0.2), 
            color: T.navy,
            fontWeight: 600, 
            textTransform: 'none', 
            fontSize: 13,
            py: 1,
            '&:hover': { borderColor: T.teal, color: T.teal, bgcolor: alpha(T.teal, 0.04) } 
          }}>
          Effacer les filtres ({activeCount})
        </Button>
      )}
    </Box>
  );

  // ── Skeletons ────────────────────────────────────────────────────
  const Skeletons = () => (
    <Stack spacing={2}>
      {Array(6).fill(0).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={250}
          sx={{ borderRadius: '16px', bgcolor: alpha(T.navy, 0.04) }} />
      ))}
    </Stack>
  );

  // ── Render ───────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFE', pt: 4, pb: 8 }}>
      <Container maxWidth="xl">

        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3, fontSize: 13 }}>
          <Link to="/" style={{ textDecoration: 'none', color: T.slate }}>Accueil</Link>
          <Typography sx={{ fontSize: 13, color: T.navy, fontWeight: 600 }}>Voyages</Typography>
        </Breadcrumbs>

        {/* Header with results count */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: T.navy, mb: 1 }}>
            Découvrez nos voyages
          </Typography>
          <Typography sx={{ fontSize: 15, color: T.slate }}>
            {loading ? 'Chargement en cours...' : `${totalItems} voyage${totalItems !== 1 ? 's' : ''} disponible${totalItems !== 1 ? 's' : ''}`}
          </Typography>
        </Box>

        {/* Mobile FAB */}
        {isMobile && (
          <Fab variant="extended" onClick={() => setMobileOpen(true)}
            sx={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20, 
              zIndex: 1000,
              bgcolor: T.navy, 
              color: T.white, 
              fontWeight: 700, 
              fontSize: 13,
              '&:hover': { bgcolor: T.teal },
              boxShadow: `0 4px 20px ${alpha(T.navy, 0.3)}` 
            }}>
            <Badge badgeContent={activeCount || undefined}
              sx={{ '& .MuiBadge-badge': { bgcolor: T.teal, color: T.white } }}>
              <Tune sx={{ mr: 1, fontSize: 18 }} />
            </Badge>
            Filtres
          </Fab>
        )}

        {/* Mobile drawer */}
        <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}
          PaperProps={{ sx: { width: '85%', maxWidth: 360, p: 3, bgcolor: T.white } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: T.navy }}>Filtres</Typography>
            <IconButton onClick={() => setMobileOpen(false)} size="small" sx={{ color: T.slate }}>
              <Close />
            </IconButton>
          </Box>
          <FilterContent />
        </Drawer>

        <Grid container spacing={3}>

          {/* Desktop sidebar */}
          {!isMobile && (
            <Grid xs={12} md={3}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <FilterPanel>
                  <FilterContent />
                </FilterPanel>
              </Box>
            </Grid>
          )}

          {/* Main content */}
          <Grid xs={12} md={!isMobile ? 9 : 12}>

            {/* Simple toolbar with only results count and active filters */}
            <Paper sx={{ 
              p: '16px 20px', 
              mb: 3, 
              borderRadius: '16px',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap', 
              gap: 2, 
              bgcolor: T.white, 
              border: `1px solid ${T.border}`,
              boxShadow: '0 2px 8px rgba(15,45,92,0.04)' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: 14, color: T.slate, fontWeight: 500 }}>
                  {loading ? 'Chargement...' : `${totalItems} résultat${totalItems !== 1 ? 's' : ''}`}
                </Typography>
                {activeCount > 0 && !isMobile && (
                  <Chip 
                    label={`${activeCount} filtre${activeCount > 1 ? 's actif' : ' actif'}`}
                    onDelete={clearFilters}
                    sx={{ 
                      height: 28, 
                      fontSize: 12, 
                      fontWeight: 600, 
                      borderRadius: '10px',
                      bgcolor: alpha(T.teal, 0.1), 
                      color: T.teal,
                      '& .MuiChip-deleteIcon': { color: T.teal, fontSize: 16 }
                    }} 
                  />
                )}
              </Box>
            </Paper>

            {/* Results */}
            {loading ? (
              <Skeletons />
            ) : trips.length === 0 ? (
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: '20px', 
                border: `1px solid ${T.border}`,
                bgcolor: T.white 
              }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: T.navy, mb: 1 }}>
                  Aucun voyage trouvé
                </Typography>
                <Typography sx={{ fontSize: 14, color: T.slate, mb: 3 }}>
                  Essayez de modifier vos filtres
                </Typography>
                <Button variant="contained" onClick={clearFilters}
                  sx={{ 
                    bgcolor: T.teal, 
                    borderRadius: '12px', 
                    textTransform: 'none',
                    fontWeight: 700, 
                    px: 3,
                    '&:hover': { bgcolor: T.navy } 
                  }}>
                  Effacer les filtres
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2.5}>
                {trips.map(trip => <TripCard2 key={trip.id} trip={trip} />)}
              </Stack>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination 
                  count={totalPages} 
                  page={page}
                  onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  sx={{ 
                    '& .MuiPaginationItem-root': { 
                      borderRadius: '10px', 
                      fontWeight: 600,
                      fontSize: 14,
                    },
                    '& .Mui-selected': { 
                      bgcolor: T.navy, 
                      color: T.white,
                      '&:hover': { bgcolor: T.navy }
                    },
                    '& .MuiPaginationItem-page:hover': {
                      bgcolor: alpha(T.teal, 0.08),
                    }
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