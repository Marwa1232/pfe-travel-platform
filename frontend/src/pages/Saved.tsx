import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container, Typography, Box, Button, Grid,
  Fade, Skeleton, Chip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Favorite, FavoriteBorder, Explore, FlightTakeoff } from '@mui/icons-material';
import { favoriteAPI } from '../services/api';
import TripCard from '../components/TripCard';
import { RootState } from '../store';

// ─── Tokens ───────────────────────────────────────────────────────
const T = {
  teal:   '#0EA5A0',
  tealDk: '#0C8F8A',
  navy:   '#0F2D5C',
  navyLt: '#1A3F7A',
  white:  '#FFFFFF',
  paper:  '#F0F4F8',
  border: '#DDE3EB',
  slate:  '#64748B',
  ink:    '#0F172A',
  Navy:  '#0F2D5C',
};

// ─── Styled ───────────────────────────────────────────────────────
const PageWrapper = styled(Box)({
  minHeight: '100vh',
  backgroundColor: T.paper,
  paddingTop: 40,
  paddingBottom: 80,
});

const EmptyCard = styled(Box)({
  backgroundColor: T.white,
  borderRadius: 20,
  border: `1px solid ${T.border}`,
  boxShadow: '0 2px 12px rgba(15,45,92,0.06)',
  padding: '64px 32px',
  textAlign: 'center',
});

// ─── Types ────────────────────────────────────────────────────────
interface FavoriteTrip {
  id: number;
  title: string;
  short_description: string;
  base_price: string;
  currency: string;
  duration_days: number;
  difficulty_level: string;
  status: string;
  cover_image: string | null;
  images: Array<{ url: string; is_cover: boolean }>;
  destinations: Array<{ id: number; name: string }>;
  favorite_id: number;
  favorited_at: string;
}

// ─── Component ────────────────────────────────────────────────────
const Saved: React.FC = () => {
  const navigate = useNavigate();

  const token = useSelector((state: RootState) => state.auth.token);
  const isLoggedIn = !!token;

  const [favorites, setFavorites]   = useState<FavoriteTrip[]>([]);
  const [loading, setLoading]       = useState(true);
  const [removing, setRemoving]     = useState<number | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoriteAPI.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (tripId: number) => {
    setRemoving(tripId);
    try {
      await favoriteAPI.remove(tripId);
      setFavorites(prev => prev.filter(f => f.id !== tripId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    } finally {
      setRemoving(null);
    }
  };

  // ── Skeleton loader ──────────────────────────────────────────
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton variant="rounded" height={360}
            sx={{ borderRadius: '16px', bgcolor: alpha(T.navy, 0.05) }} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <Fade in timeout={400}>
          <Box>

            {/* ── Header ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4,
              pb: 2.5, borderBottom: `2px solid ${alpha(T.teal, 0.15)}` }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '14px',
                background: `linear-gradient(135deg, ${T.teal}, ${T.navy})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 14px ${alpha(T.teal, 0.35)}` }}>
                <Favorite sx={{ fontSize: 22, color: T.white }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: T.navy, lineHeight: 1.1 }}>
                  Mes favoris
                </Typography>
                <Typography sx={{ fontSize: 12, color: T.slate }}>
                  Vos voyages sauvegardés
                </Typography>
              </Box>
              {favorites.length > 0 && (
                <Chip
                  label={`${favorites.length} voyage${favorites.length > 1 ? 's' : ''}`}
                  size="small"
                  sx={{ ml: 'auto', bgcolor: alpha(T.teal, 0.1), color: T.teal,
                    fontWeight: 700, borderRadius: '8px', fontSize: 12,
                    border: `1px solid ${alpha(T.teal, 0.2)}` }}
                />
              )}
            </Box>

            {/* ── Not logged in ── */}
            {!isLoggedIn ? (
              <EmptyCard>
                <Box sx={{ width: 88, height: 88, borderRadius: '50%',
                  bgcolor: alpha(T.navy, 0.07), display: 'flex',
                  alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <FavoriteBorder sx={{ fontSize: 44, color: T.navy, opacity: 0.55 }} />
                </Box>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: T.navy, mb: 1 }}>
                  Connectez-vous pour voir vos favoris
                </Typography>
                <Typography sx={{ fontSize: 13, color: T.slate, mb: 4, maxWidth: 380, mx: 'auto' }}>
                  Sauvegardez vos voyages préférés et retrouvez-les facilement ici.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={() => navigate('/login')}
                    sx={{ bgcolor: T.teal, color: T.white, borderRadius: '10px', px: 4,
                      textTransform: 'none', fontWeight: 700,
                      boxShadow: `0 4px 14px ${alpha(T.teal, 0.35)}`,
                      '&:hover': { bgcolor: T.tealDk } }}>
                    Se connecter
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/register')}
                    sx={{ borderColor: T.navy, color: T.navy, borderRadius: '10px', px: 4,
                      textTransform: 'none', fontWeight: 700,
                      '&:hover': { borderColor: T.teal, bgcolor: alpha(T.teal, 0.05), color: T.teal } }}>
                    Créer un compte
                  </Button>
                </Box>
              </EmptyCard>

            /* ── Loading ── */
            ) : loading ? (
              renderSkeletons()

            /* ── Empty favorites ── */
            ) : favorites.length === 0 ? (
              <EmptyCard>
                <Box sx={{ width: 88, height: 88, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(T.teal, 0.1)}, ${alpha(T.navy, 0.06)})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <FlightTakeoff sx={{ fontSize: 44, color: T.teal, opacity: 0.65 }} />
                </Box>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: T.navy, mb: 1 }}>
                  Aucun favori pour le moment
                </Typography>
                <Typography sx={{ fontSize: 13, color: T.slate, mb: 4, maxWidth: 380, mx: 'auto' }}>
                  Explorez nos voyages et ajoutez vos destinations préférées ici.
                </Typography>
                <Button variant="contained" startIcon={<Explore />} onClick={() => navigate('/trips')}
                  sx={{ bgcolor: T.navy, color: T.white, borderRadius: '10px', px: 4,
                    textTransform: 'none', fontWeight: 700,
                    boxShadow: `0 4px 14px ${alpha(T.navy, 0.25)}`,
                    '&:hover': { bgcolor: T.navyLt } }}>
                  Explorer les voyages
                </Button>
              </EmptyCard>

            /* ── Favorites grid ── */
            ) : (
              <Grid container spacing={3}>
                {favorites.map(trip => (
                  <Grid item xs={12} sm={6} md={4} key={trip.id}>
                    <Box sx={{ position: 'relative' }}>
                      <TripCard trip={trip} />
                      {/* Remove from favorites button */}
                      <Box
                        onClick={() => handleRemoveFavorite(trip.id)}
                        sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2,
                          width: 32, height: 32, borderRadius: '50%',
                          bgcolor: removing === trip.id ? alpha(T.navy, 0.15) : 'rgba(255,255,255,0.9)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.18s',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          '&:hover': { bgcolor: alpha(T.navy, 0.12), transform: 'scale(1.1)' } }}>
                        <Favorite sx={{ fontSize: 15,
                          color: removing === trip.id ? alpha(T.navy, 0.5) : T.navy }} />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}

          </Box>
        </Fade>
      </Container>
    </PageWrapper>
  );
};

export default Saved;