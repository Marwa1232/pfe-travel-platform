// ═══════════════════════════════════════════════════════
//  Dashboard.tsx  — User Dashboard with Loyalty Points
// ═══════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Card, Button, Grid, Avatar,
  Chip, CircularProgress, LinearProgress, IconButton,
  Badge, Tooltip, Divider, Menu, MenuItem,
  ListItemIcon, ListItemText,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  FlightTakeoff, History, Favorite, TrendingUp,
  CalendarMonth, LocationOn, AccessTime, Star,
  EmojiEvents, BusinessCenter, ArrowForward, Edit,
  Diamond, FamilyRestroom, CheckCircle, Notifications,
  Logout, Dashboard as DashboardIcon, RocketLaunch,
  WorkspacePremium, Celebration, AttachMoney, Menu as MenuIcon,
  BookmarkBorder as BookingsIcon, Explore, BeachAccess,
  Terrain, Restaurant, Spa, DirectionsBike,
  ArrowUpward, People, Bookmark, CardGiftcard,
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import { tripAPI, recommendationAPI, fixImageUrl } from '../services/api';
import { RootState } from '../store';

// ─── Design tokens ────────────────────────────────────
const T = {
  teal:   '#0EA5A0',
  navy:   '#0F2D5C',
  slate:  '#64748B',
  ink:    '#0F172A',
  paper:  '#F8FAFC',
  white:  '#FFFFFF',
  border: '#E2E8F0',
  green:  '#16A34A',
  amber:  '#D97706',
  red:    '#DC2626',
  purple: '#7C3AED',
};

// ─── Keyframes ────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
`;

// ─── Styled ───────────────────────────────────────────
const Page = styled(Box)({
  minHeight: '100vh',
  backgroundColor: T.paper,
  padding: '28px 0 64px',
});

const SCard = styled(Paper)({
  backgroundColor: T.white,
  borderRadius: 16,
  border: `1px solid ${T.border}`,
  boxShadow: 'none',
});

const TimelineDot = styled(Box)({
  position: 'absolute',
  left: -6,
  top: 4,
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: T.teal,
  border: `2px solid ${T.white}`,
  boxShadow: `0 0 0 2px ${alpha(T.teal, 0.3)}`,
});

// ─── Interests config ─────────────────────────────────
const INTERESTS = [
  { value: 'aventure',     label: 'Aventure',    icon: <Terrain />,        color: '#16A34A' },
  { value: 'plage',        label: 'Plage',        icon: <BeachAccess />,    color: '#0EA5E9' },
  { value: 'culture',      label: 'Culture',      icon: <Explore />,        color: '#7C3AED' },
  { value: 'gastronomie',  label: 'Gastronomie',  icon: <Restaurant />,     color: '#DC2626' },
  { value: 'nature',       label: 'Nature',       icon: <Spa />,            color: '#0EA5A0' },
  { value: 'sport',        label: 'Sport',        icon: <DirectionsBike />, color: '#D97706' },
  { value: 'luxe',         label: 'Luxe',         icon: <Diamond />,        color: '#9333EA' },
  { value: 'famille',      label: 'Famille',      icon: <FamilyRestroom />, color: '#0F2D5C' },
];

// ─── Badge config ─────────────────────────────────────
const getBadge = (n: number) => {
  if (n >= 20) return { name: 'Explorateur Légendaire', color: '#D97706', icon: <WorkspacePremium />, next: null };
  if (n >= 10) return { name: 'Maître Aventurier',      color: '#7C3AED', icon: <EmojiEvents />,      next: { target: 20, name: 'Explorateur Légendaire' } };
  if (n >= 5)  return { name: 'Voyageur Confirmé',      color: T.teal,    icon: <Celebration />,      next: { target: 10, name: 'Maître Aventurier' } };
  if (n >= 1)  return { name: 'Explorateur Débutant',   color: '#16A34A', icon: <RocketLaunch />,     next: { target: 5,  name: 'Voyageur Confirmé' } };
  return        { name: 'Nouveau Voyageur',              color: T.slate,   icon: <FlightTakeoff />,    next: { target: 1,  name: 'Explorateur Débutant' } };
};

// ─── Points badge level ───────────────────────────────
const getPointsLevel = (points: number) => {
  if (points >= 500) return { name: 'Platine',  color: '#7C3AED', icon: '💎' };
  if (points >= 200) return { name: 'Or',       color: '#D97706', icon: '🥇' };
  if (points >= 100) return { name: 'Argent',   color: '#64748B', icon: '🥈' };
  if (points >= 50)  return { name: 'Bronze',   color: '#92400E', icon: '🥉' };
  return                    { name: 'Débutant', color: T.slate,   icon: '⭐' };
};

// ═══════════════════════════════════════════════════════
//  TRIP CARD
// ═══════════════════════════════════════════════════════
export const TripCard: React.FC<{ trip: any }> = ({ trip }) => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const imgSrc = trip.cover_image
    ? (typeof fixImageUrl === 'function' ? fixImageUrl(trip.cover_image) : trip.cover_image)
    : `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75`;

  return (
    <Box
      onClick={() => navigate(`/trips/${trip.id}`)}
      sx={{
        borderRadius: '14px', overflow: 'hidden',
        border: `1px solid ${T.border}`, bgcolor: T.white,
        cursor: 'pointer', transition: 'all 0.22s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
          borderColor: alpha(T.teal, 0.4),
          '& .trip-img': { transform: 'scale(1.05)' },
        },
      }}
    >
      <Box sx={{ height: 175, overflow: 'hidden', position: 'relative' }}>
        <Box component="img" className="trip-img" src={imgSrc} alt={trip.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=75'; }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,18,28,0.55) 0%, transparent 55%)' }} />
        <IconButton size="small" onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          sx={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32,
            bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.25)', color: saved ? '#F59E0B' : T.white,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
          {saved ? <Bookmark sx={{ fontSize: 15 }} /> : <BookingsIcon sx={{ fontSize: 15 }} />}
        </IconButton>
        {trip.duration_days && (
          <Box sx={{ position: 'absolute', top: 10, left: 10, px: 1.2, py: 0.3, borderRadius: 10,
            bgcolor: 'rgba(15,18,28,0.55)', backdropFilter: 'blur(6px)' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.white }}>{trip.duration_days}j</Typography>
          </Box>
        )}
        <Box sx={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
            <LocationOn sx={{ fontSize: 12, color: alpha(T.white, 0.8) }} />
            <Typography sx={{ fontSize: 11, color: alpha(T.white, 0.85), fontWeight: 500 }}>
              {trip.destinations?.map((d: any) => d.name || d).join(', ') || trip.destination || '—'}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: '12px 14px 14px' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.ink, mb: 0.5, lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {trip.title}
        </Typography>
        {trip.short_description && (
          <Typography sx={{ fontSize: 12, color: T.slate, lineHeight: 1.6, mb: 1.2,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {trip.short_description}
          </Typography>
        )}
        <Divider sx={{ mb: 1.2, borderColor: T.border }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: 10, color: T.slate, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              À partir de
            </Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: T.teal, lineHeight: 1 }}>
              {Number(trip.base_price || 0).toLocaleString('fr-TN')}
              <Typography component="span" sx={{ fontSize: 11, fontWeight: 600, color: T.slate, ml: 0.4 }}>
                {trip.currency || 'TND'}
              </Typography>
            </Typography>
          </Box>
          {trip.average_rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4,
              px: 1, py: 0.4, borderRadius: 8, bgcolor: alpha('#F59E0B', 0.09) }}>
              <Star sx={{ fontSize: 12, color: '#F59E0B' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                {Number(trip.average_rating).toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════
const Dashboard: React.FC = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const userAny   = user as any;
  const photoUrl  = userAny?.profile_photo_url ? fixImageUrl(userAny.profile_photo_url) : null;

  const [anchorEl, setAnchorEl]               = useState<null | HTMLElement>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [upcomingTrips, setUpcomingTrips]      = useState<any[]>([]);
  const [pastTrips, setPastTrips]              = useState<any[]>([]);
  const [loading, setLoading]                  = useState(true);
  const [interests, setInterests]              = useState<string[]>(user?.interests || []);
  const [editingInterests, setEditingInterests] = useState(false);

  // ── Loyalty state ─────────────────────────────────
  const [loyaltyData, setLoyaltyData]         = useState<any>(null);
  const [loyaltyLoading, setLoyaltyLoading]   = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Bookings
      try {
        const res = await fetch('http://localhost:8000/api/user/bookings/upcoming', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const d = await res.json();
          setUpcomingTrips(d.upcoming || []);
          setPastTrips(d.past || []);
        }
      } catch (e) { console.error(e); }

      // Recommendations
      let recs: any[] = [];
      try {
        const r = await recommendationAPI.getTrending(4);
        if (r.data?.trending?.length) {
          recs = await Promise.all(r.data.trending.map((x: any) => tripAPI.get(x.trip.id).then((res: any) => res.data)));
        }
      } catch (_) {}
      if (!recs.length) {
        try {
          const r = await tripAPI.list({ limit: 4 });
          recs = r.data['hydra:member'] || [];
        } catch (_) {}
      }
      setRecommendations(recs);

      // Loyalty points
      await loadLoyaltyData();

    } finally { setLoading(false); }
  };

  const loadLoyaltyData = async () => {
    setLoyaltyLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/loyalty/points', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setLoyaltyData(d);
      }
    } catch (_) {}
    finally { setLoyaltyLoading(false); }
  };

  const handleLogout = () => { dispatch(logout() as any); navigate('/'); };

  const saveInterests = async () => {
    try {
      await fetch('http://localhost:8000/api/user/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests }),
      });
      setEditingInterests(false);
    } catch (e) { console.error(e); }
  };

  const totalTrips = upcomingTrips.length + pastTrips.length;
  const badge      = getBadge(totalTrips);
  const progress   = badge.next ? Math.min((totalTrips / badge.next.target) * 100, 100) : 100;

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.paper }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={44} thickness={3} sx={{ color: T.teal, mb: 1.5 }} />
          <Typography sx={{ fontSize: 14, color: T.slate }}>Chargement de votre espace…</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Page>
      <Box maxWidth={1200} mx="auto" px={{ xs: 2, md: 4 }}>

        {/* ── Top bar ──────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4,
          animation: `${fadeUp} 0.4s ease` }}>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: T.ink }}>
              Bon retour, {user?.first_name} 👋
            </Typography>
            <Typography sx={{ fontSize: 13, color: T.slate, mt: 0.3 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Typography>
          </Box>
        </Box>

        {/* Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: `1px solid ${T.border}`, mt: 1, minWidth: 200 } }}>
          {[
            { label: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
            { label: 'Mes réservations', icon: <BookingsIcon />, path: '/bookings' },
            { label: 'Mes favoris',      icon: <Favorite />,     path: '/saved' },
          ].map(item => (
            <MenuItem key={item.path} onClick={() => { navigate(item.path); setAnchorEl(null); }}
              sx={{ py: 1.2, '&:hover': { bgcolor: alpha(T.teal, 0.05) } }}>
              <ListItemIcon sx={{ color: T.teal, minWidth: 34 }}>{React.cloneElement(item.icon, { fontSize: 'small' })}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}>{item.label}</ListItemText>
            </MenuItem>
          ))}
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { handleLogout(); setAnchorEl(null); }}
            sx={{ py: 1.2, color: T.red, '&:hover': { bgcolor: alpha(T.red, 0.05) } }}>
            <ListItemIcon sx={{ color: T.red, minWidth: 34 }}><Logout fontSize="small" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: T.red }}>Déconnexion</ListItemText>
          </MenuItem>
        </Menu>

        <Grid container spacing={3}>

          {/* ── Left sidebar ──────────────────────── */}
          <Grid item xs={12} md={4} lg={3}>
            <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Profile card */}
              <SCard sx={{ overflow: 'hidden', animation: `${fadeUp} 0.4s ease 0.05s both` }}>
                <Box sx={{ height: 80, background: `linear-gradient(135deg, ${T.teal}, ${T.navy})`, position: 'relative' }} />
                <Box sx={{ px: 3, pb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: -4, mb: 2 }}>
                    <Avatar src={photoUrl || undefined}
                      sx={{ width: 120, height: 120, border: `3px solid ${T.white}`, bgcolor: T.navy, fontSize: 34, fontWeight: 700 }} />
                  </Box>

                  {/* Badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: '10px 12px', borderRadius: 2,
                    bgcolor: alpha(badge.color, 0.07), border: `1px solid ${alpha(badge.color, 0.2)}`, mb: 2 }}>
                    <Box sx={{ color: badge.color, display: 'flex', '& svg': { fontSize: 20 } }}>{badge.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: badge.color }}>{badge.name}</Typography>
                      {badge.next && (
                        <Typography sx={{ fontSize: 10, color: T.slate }}>{totalTrips}/{badge.next.target} voyages</Typography>
                      )}
                    </Box>
                  </Box>

                  {badge.next && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress variant="determinate" value={progress}
                        sx={{ height: 4, borderRadius: 2, bgcolor: alpha(badge.color, 0.12),
                          '& .MuiLinearProgress-bar': { bgcolor: badge.color, borderRadius: 2 } }} />
                      <Typography sx={{ fontSize: 10, color: T.slate, mt: 0.5 }}>
                        Prochain niveau: {badge.next.name}
                      </Typography>
                    </Box>
                  )}

                  {user?.status_organizer !== 'approved' && (
                    user?.status_organizer === 'pending' ? (
                      <Box sx={{ p: '10px 12px', borderRadius: 2, bgcolor: alpha(T.amber, 0.07),
                        border: `1px solid ${alpha(T.amber, 0.2)}`, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <AccessTime sx={{ fontSize: 16, color: T.amber }} />
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.amber }}>Demande en attente</Typography>
                          <Typography sx={{ fontSize: 11, color: T.slate }}>Réponse sous 24h</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Button fullWidth variant="outlined" startIcon={<BusinessCenter sx={{ fontSize: 16 }} />}
                        onClick={() => navigate('/organizer-request')}
                        sx={{ py: 1, borderRadius: 2, borderColor: alpha(T.teal, 0.4), color: T.teal,
                          fontSize: 13, textTransform: 'none', fontWeight: 600,
                          '&:hover': { borderColor: T.teal, bgcolor: alpha(T.teal, 0.04) } }}>
                        Devenir organisateur
                      </Button>
                    )
                  )}
                </Box>
              </SCard>

              {/* Interests card */}
              <SCard sx={{ p: 2.5, animation: `${fadeUp} 0.4s ease 0.1s both` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Centres d'intérêt</Typography>
                  {editingInterests ? (
                    <Button size="small" onClick={saveInterests}
                      sx={{ fontSize: 11, textTransform: 'none', bgcolor: T.teal, color: T.white,
                        px: 1.5, py: 0.4, borderRadius: 1.5, '&:hover': { bgcolor: '#0c9490' } }}>
                      Enregistrer
                    </Button>
                  ) : (
                    <IconButton size="small" onClick={() => setEditingInterests(true)} sx={{ color: T.slate }}>
                      <Edit sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {(editingInterests ? INTERESTS : INTERESTS.filter(i => interests.includes(i.value))).map(item => {
                    const selected = interests.includes(item.value);
                    return (
                      <Chip key={item.value} icon={item.icon as React.ReactElement} label={item.label} size="small"
                        onClick={editingInterests ? () => setInterests(p => p.includes(item.value) ? p.filter(x => x !== item.value) : [...p, item.value]) : undefined}
                        sx={{ fontSize: 11, fontWeight: 600, height: 26,
                          bgcolor: selected ? alpha(item.color, 0.12) : alpha(T.border, 0.6),
                          color: selected ? item.color : T.slate,
                          border: `1px solid ${selected ? alpha(item.color, 0.3) : 'transparent'}`,
                          cursor: editingInterests ? 'pointer' : 'default', transition: 'all 0.15s',
                          '& .MuiChip-icon': { color: item.color, fontSize: 13 },
                          '&:hover': editingInterests ? { bgcolor: alpha(item.color, 0.18) } : {},
                        }} />
                    );
                  })}
                  {!editingInterests && interests.length === 0 && (
                    <Typography sx={{ fontSize: 12, color: T.slate, fontStyle: 'italic' }}>
                      Aucun centre d'intérêt — cliquez sur ✏️ pour en ajouter
                    </Typography>
                  )}
                </Box>
              </SCard>

              {/* Quick links */}
              <SCard sx={{ p: 2, animation: `${fadeUp} 0.4s ease 0.15s both` }}>
                {[
                  { label: 'Mes réservations', icon: <BookingsIcon />, path: '/bookings',  color: T.teal },
                  { label: 'Mes favoris',       icon: <Favorite />,    path: '/saved',     color: '#E11D48' },
                  { label: 'Déconnexion',       icon: <Logout />,      action: handleLogout, color: T.slate },
                ].map((item, i) => (
                  <Box key={i} onClick={item.action || (() => navigate(item.path!))}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: '9px 10px', borderRadius: 2,
                      cursor: 'pointer', transition: 'all 0.15s', '&:hover': { bgcolor: alpha(item.color, 0.06) } }}>
                    <Box sx={{ color: item.color, display: 'flex', '& svg': { fontSize: 18 } }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: item.color === T.slate ? T.slate : T.ink }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </SCard>

            </Box>
          </Grid>

          {/* ── Main content ──────────────────────── */}
          <Grid item xs={12} md={8} lg={9}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* ══════════════════════════════════════
                  LOYALTY POINTS SECTION
              ══════════════════════════════════════ */}
              <SCard sx={{ p: 3, animation: `${fadeUp} 0.4s ease 0.05s both` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(T.amber, 0.1),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.amber }}>
                      <EmojiEvents sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Points Fidélité</Typography>
                      <Typography sx={{ fontSize: 11, color: T.slate }}>
                        Gagnez 1 point par 10 EUR payés
                      </Typography>
                    </Box>
                  </Box>
                  {loyaltyData && (
                    <Chip
                      label={getPointsLevel(loyaltyData.available_points).icon + ' ' + getPointsLevel(loyaltyData.available_points).name}
                      size="small"
                      sx={{
                        bgcolor: alpha(getPointsLevel(loyaltyData.available_points).color, 0.1),
                        color: getPointsLevel(loyaltyData.available_points).color,
                        fontWeight: 700, fontSize: 11, height: 24,
                      }}
                    />
                  )}
                </Box>

                {loyaltyLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={28} sx={{ color: T.amber }} />
                  </Box>
                ) : loyaltyData ? (
                  <>
                    {/* Points stats */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 2.5 }}>
                      {[
                        { label: 'Disponibles', value: loyaltyData.available_points, color: T.teal,  bg: alpha(T.teal, 0.06) },
                        { label: 'Gagnés total', value: loyaltyData.total_points,    color: T.amber, bg: alpha(T.amber, 0.06) },
                        { label: 'Utilisés',     value: loyaltyData.used_points,     color: T.slate, bg: alpha(T.slate, 0.06) },
                      ].map(stat => (
                        <Box key={stat.label} sx={{ p: 2, borderRadius: 2, bgcolor: stat.bg, textAlign: 'center' }}>
                          <Typography sx={{ fontSize: 24, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: T.slate, mt: 0.5 }}>{stat.label}</Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Progress vers niveau suivant */}
                    {(() => {
                      const pts   = loyaltyData.available_points;
                      const level = getPointsLevel(pts);
                      const nextThresholds = [50, 100, 200, 500];
                      const nextTarget     = nextThresholds.find(t => t > pts);
                      const prevTarget     = nextThresholds.filter(t => t <= pts).pop() || 0;
                      const prog = nextTarget
                        ? Math.min(((pts - prevTarget) / (nextTarget - prevTarget)) * 100, 100)
                        : 100;
                      return nextTarget ? (
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                            <Typography sx={{ fontSize: 11, color: T.slate }}>
                              Progression vers le niveau suivant
                            </Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.amber }}>
                              {pts} / {nextTarget} pts
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={prog}
                            sx={{ height: 6, borderRadius: 3, bgcolor: alpha(T.amber, 0.12),
                              '& .MuiLinearProgress-bar': { bgcolor: T.amber, borderRadius: 3 } }} />
                          <Typography sx={{ fontSize: 10, color: T.slate, mt: 0.5 }}>
                            Encore {nextTarget - pts} points pour atteindre le niveau suivant
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ mb: 2.5, p: 1.5, borderRadius: 2, bgcolor: alpha('#7C3AED', 0.07),
                          border: `1px solid ${alpha('#7C3AED', 0.2)}`, textAlign: 'center' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#7C3AED' }}>
                            💎 Vous avez atteint le niveau maximum — Platine !
                          </Typography>
                        </Box>
                      );
                    })()}

                    {/* Historique transactions */}
                    {loyaltyData.history?.length > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.ink, mb: 1.2 }}>
                          Historique récent
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          {loyaltyData.history.slice(0, 4).map((tx: any) => (
                            <Box key={tx.id} sx={{ display: 'flex', justifyContent: 'space-between',
                              alignItems: 'center', py: 1, px: 1.5, borderRadius: 2,
                              bgcolor: tx.type === 'earn' ? alpha(T.green, 0.04) : alpha(T.red, 0.04),
                              border: `1px solid ${tx.type === 'earn' ? alpha(T.green, 0.1) : alpha(T.red, 0.1)}` }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  bgcolor: tx.type === 'earn' ? alpha(T.green, 0.1) : alpha(T.red, 0.1) }}>
                                  {tx.type === 'earn'
                                    ? <EmojiEvents sx={{ fontSize: 14, color: T.green }} />
                                    : <CardGiftcard sx={{ fontSize: 14, color: T.red }} />}
                                </Box>
                                <Box>
                                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: T.ink }}>
                                    {tx.description}
                                  </Typography>
                                  <Typography sx={{ fontSize: 10, color: T.slate }}>{tx.created_at}</Typography>
                                </Box>
                              </Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 800,
                                color: tx.type === 'earn' ? T.green : T.red }}>
                                {tx.type === 'earn' ? '+' : ''}{tx.points} pts
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* CTA si aucun point */}
                    {loyaltyData.total_points === 0 && (
                      <Box sx={{ textAlign: 'center', py: 2, px: 3,
                        border: `2px dashed ${T.border}`, borderRadius: 3 }}>
                        <EmojiEvents sx={{ fontSize: 36, color: T.border, mb: 1 }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink, mb: 0.5 }}>
                          Vous n'avez pas encore de points
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: T.slate, mb: 2 }}>
                          Faites votre premier voyage et gagnez des points fidélité !
                        </Typography>
                        <Button size="small" onClick={() => navigate('/trips')}
                          sx={{ bgcolor: T.teal, color: T.white, borderRadius: 2, textTransform: 'none',
                            fontWeight: 600, fontSize: 12, px: 2.5,
                            '&:hover': { bgcolor: '#0c9490' } }}>
                          Découvrir les voyages
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography sx={{ fontSize: 12, color: T.slate }}>
                      Impossible de charger vos points
                    </Typography>
                  </Box>
                )}
              </SCard>

              {/* Upcoming trips */}
              <SCard sx={{ p: 3, animation: `${fadeUp} 0.4s ease 0.1s both` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(T.teal, 0.1),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.teal }}>
                      <CalendarMonth sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Voyages à venir</Typography>
                      <Typography sx={{ fontSize: 11, color: T.slate }}>
                        {upcomingTrips.length} voyage{upcomingTrips.length !== 1 ? 's' : ''} planifié{upcomingTrips.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 13 }} />}
                    onClick={() => navigate('/bookings')}
                    sx={{ fontSize: 12, textTransform: 'none', color: T.teal, fontWeight: 600, p: 0,
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
                    Voir tout
                  </Button>
                </Box>

                {upcomingTrips.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5, px: 2 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: alpha(T.teal, 0.08),
                      mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FlightTakeoff sx={{ fontSize: 26, color: T.teal }} />
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: T.ink, mb: 0.5 }}>Aucun voyage à venir</Typography>
                    <Typography sx={{ fontSize: 13, color: T.slate, mb: 2.5 }}>Commencez à planifier votre prochaine aventure !</Typography>
                    <Button variant="contained" onClick={() => navigate('/trips')}
                      sx={{ bgcolor: T.navy, color: T.white, borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3,
                        '&:hover': { bgcolor: '#0D2550' } }}>
                      Découvrir des voyages
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2.5,
                    borderLeft: `2px solid ${alpha(T.teal, 0.2)}`, position: 'relative' }}>
                    {upcomingTrips.map((booking: any) => (
                      <Box key={booking.id} sx={{ position: 'relative' }}>
                        <TimelineDot />
                        <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${T.border}`, bgcolor: T.white,
                          transition: 'all 0.18s', cursor: 'pointer',
                          '&:hover': { borderColor: alpha(T.teal, 0.5), bgcolor: alpha(T.teal, 0.01), transform: 'translateX(4px)' } }}
                          onClick={() => navigate(`/trips/${booking.trip?.id}`)}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.ink }}>
                              {booking.trip?.title}
                            </Typography>
                            <Chip label={booking.status || 'Confirmé'} size="small"
                              sx={{ height: 20, fontSize: 10, fontWeight: 700,
                                bgcolor: alpha(T.teal, 0.09), color: T.teal, borderRadius: '5px' }} />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                            {booking.trip?.destination && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOn sx={{ fontSize: 13, color: T.slate }} />
                                <Typography sx={{ fontSize: 12, color: T.slate }}>{booking.trip.destination}</Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarMonth sx={{ fontSize: 13, color: T.slate }} />
                              <Typography sx={{ fontSize: 12, color: T.slate }}>
                                {booking.trip_session?.start_date} → {booking.trip_session?.end_date}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <AttachMoney sx={{ fontSize: 13, color: T.teal }} />
                              <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.teal }}>
                                {booking.total_price} {booking.currency}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </SCard>

              {/* Past trips */}
              <SCard sx={{ p: 3, animation: `${fadeUp} 0.4s ease 0.15s both` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(T.slate, 0.1),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.slate }}>
                      <History sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Voyages passés</Typography>
                      <Typography sx={{ fontSize: 11, color: T.slate }}>
                        {pastTrips.length} voyage{pastTrips.length !== 1 ? 's' : ''} effectué{pastTrips.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {pastTrips.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: T.slate, textAlign: 'center', py: 3 }}>
                    Aucun voyage passé pour le moment
                  </Typography>
                ) : (
                  <Grid container spacing={1.5}>
                    {pastTrips.slice(0, 4).map((booking: any) => (
                      <Grid item xs={12} sm={6} key={booking.id}>
                        <Box sx={{ p: '12px 14px', borderRadius: 2, border: `1px solid ${T.border}`,
                          cursor: 'pointer', transition: 'all 0.15s',
                          '&:hover': { borderColor: alpha(T.teal, 0.4), bgcolor: alpha(T.teal, 0.01) } }}
                          onClick={() => navigate(`/trips/${booking.trip?.id}`)}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink, mb: 0.3,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {booking.trip?.title}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: T.slate, mb: 1 }}>
                            {booking.trip_session?.start_date}
                          </Typography>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: T.teal }}>
                            Revivre l'expérience →
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </SCard>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <SCard sx={{ p: 3, animation: `${fadeUp} 0.4s ease 0.2s both` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(T.purple, 0.1),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.purple }}>
                        <TrendingUp sx={{ fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Recommandés pour vous</Typography>
                        <Typography sx={{ fontSize: 11, color: T.slate }}>Basés sur vos centres d'intérêt</Typography>
                      </Box>
                    </Box>
                    <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 13 }} />}
                      onClick={() => navigate('/trips')}
                      sx={{ fontSize: 12, textTransform: 'none', color: T.teal, fontWeight: 600, p: 0,
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
                      Voir tout
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    {recommendations.map((trip: any) => (
                      <Grid item xs={12} sm={6} key={trip.id}>
                        <TripCard trip={trip} />
                      </Grid>
                    ))}
                  </Grid>
                </SCard>
              )}

            </Box>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
};

export default Dashboard;