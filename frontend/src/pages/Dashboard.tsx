import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Card, Button, Grid, Avatar,
  Chip, CircularProgress, LinearProgress, IconButton,
  Divider,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  FlightTakeoff, History, Favorite, TrendingUp,
  CalendarMonth, LocationOn, Star,
  EmojiEvents, ArrowForward, Edit,
  Diamond, FamilyRestroom, CheckCircle,
  Logout, Dashboard as DashboardIcon, RocketLaunch,
  WorkspacePremium, Celebration, AttachMoney,
  BookmarkBorder as BookingsIcon, Explore, BeachAccess,
  Terrain, Restaurant, Spa, DirectionsBike,
  People, Bookmark, CardGiftcard, Save,
  MilitaryTech, SportsScore, Grade,HourglassEmpty,
} from '@mui/icons-material';
import { logout, updateInterests } from '../store/authSlice';
import { tripAPI, recommendationAPI, fixImageUrl } from '../services/api';
import { RootState } from '../store';

// ─── Design tokens ────────────────────────────────────
const T = {
  teal:    '#0EA5A0',
  tealDk:  '#0C8F8A',
  navy:    '#0F2D5C',
  navyLt:  '#1A3F7A',
  slate:   '#64748B',
  ink:     '#0F172A',
  paper:   '#F0F4F8',
  white:   '#FFFFFF',
  border:  '#DDE3EB',
  green:   '#16A34A',
  amber:   '#D97706',
  red:     '#DC2626',
  purple:  '#7C3AED',
};

// ─── Keyframes ────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ─── Styled ───────────────────────────────────────────
const Page = styled(Box)({
  minHeight: '100vh',
  backgroundColor: T.paper,
  padding: '32px 0 80px',
});

const SCard = styled(Paper)({
  backgroundColor: T.white,
  borderRadius: 20,
  border: `1px solid ${T.border}`,
  boxShadow: '0 2px 12px rgba(15,45,92,0.06)',
});

const TimelineDot = styled(Box)({
  position: 'absolute',
  left: -7,
  top: 16,
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: T.teal,
  border: `2px solid ${T.white}`,
  boxShadow: `0 0 0 3px ${alpha(T.teal, 0.2)}`,
});

const NavItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 14px',
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.18s ease',
  color: T.navy,
  fontWeight: 600,
  fontSize: 14,
});

// ─── Interests config ─────────────────────────────────
const INTERESTS = [
  { value: 'aventure',    label: 'Aventure',    icon: <Terrain />,        color: '#16A34A' },
  { value: 'plage',       label: 'Plage',       icon: <BeachAccess />,    color: '#0EA5E9' },
  { value: 'culture',     label: 'Culture',     icon: <Explore />,        color: '#7C3AED' },
  { value: 'gastronomie', label: 'Gastronomie', icon: <Restaurant />,     color: '#DC2626' },
  { value: 'nature',      label: 'Nature',      icon: <Spa />,            color: '#0EA5A0' },
  { value: 'sport',       label: 'Sport',       icon: <DirectionsBike />, color: '#D97706' },
  { value: 'luxe',        label: 'Luxe',        icon: <Diamond />,        color: '#9333EA' },
  { value: 'famille',     label: 'Famille',     icon: <FamilyRestroom />, color: '#0F2D5C' },
];

// ─── Badge config ─────────────────────────────────────
const getBadge = (n: number) => {
  if (n >= 20) return { name: 'Explorateur Légendaire', color: '#D97706', icon: <WorkspacePremium />, next: null };
  if (n >= 10) return { name: 'Maître Aventurier',      color: '#7C3AED', icon: <EmojiEvents />,      next: { target: 20, name: 'Explorateur Légendaire' } };
  if (n >= 5)  return { name: 'Voyageur Confirmé',      color: T.teal,    icon: <Celebration />,      next: { target: 10, name: 'Maître Aventurier' } };
  if (n >= 1)  return { name: 'Explorateur Débutant',   color: '#16A34A', icon: <RocketLaunch />,     next: { target: 5,  name: 'Voyageur Confirmé' } };
  return        { name: 'Nouveau Voyageur',             color: T.slate,   icon: <FlightTakeoff />,    next: { target: 1,  name: 'Explorateur Débutant' } };
};

// ─── Points level ─────────────────────────────────────
const getPointsLevel = (points: number) => {
  if (points >= 500) return { name: 'Platine',  color: '#7C3AED', icon: <WorkspacePremium sx={{ fontSize: 14 }} /> };
  if (points >= 200) return { name: 'Or',       color: '#D97706', icon: <EmojiEvents sx={{ fontSize: 14 }} /> };
  if (points >= 100) return { name: 'Argent',   color: '#64748B', icon: <MilitaryTech sx={{ fontSize: 14 }} /> };
  if (points >= 50)  return { name: 'Bronze',   color: '#92400E', icon: <SportsScore sx={{ fontSize: 14 }} /> };
  return                    { name: 'Débutant', color: T.slate,   icon: <Grade sx={{ fontSize: 14 }} /> };
};

// ═══════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════
const Dashboard: React.FC = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const userAny   = user as any;
  const photoUrl  = userAny?.profile_photo_url
    ? (typeof fixImageUrl === 'function' ? fixImageUrl(userAny.profile_photo_url) : userAny.profile_photo_url)
    : null;

  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [pastTrips, setPastTrips]         = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [interests, setInterests]         = useState<string[]>(userAny?.interests || []);
  const [editingInterests, setEditingInterests] = useState(false);
  const [savingInterests, setSavingInterests]   = useState(false);
  const [loyaltyData, setLoyaltyData]     = useState<any>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

  useEffect(() => {
    setInterests(userAny?.interests || []);
  }, [userAny?.interests]);

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
      await loadLoyaltyData();
    } finally { setLoading(false); }
  };

  const loadLoyaltyData = async () => {
    setLoyaltyLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/loyalty/points', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLoyaltyData(await res.json());
    } catch (_) {}
    finally { setLoyaltyLoading(false); }
  };

  const toggleInterest = (value: string) => {
    setInterests(prev =>
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const saveInterests = async () => {
    setSavingInterests(true);
    try {
      const res = await fetch('http://localhost:8000/api/user/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests }),
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(updateInterests(data.interests));
        setEditingInterests(false);
      }
    } catch (e) { console.error(e); }
    finally { setSavingInterests(false); }
  };

  const handleLogout = () => { dispatch(logout() as any); navigate('/'); };

  const totalTrips = upcomingTrips.length + pastTrips.length;
  const badge      = getBadge(totalTrips);
  const progress   = badge.next ? Math.min((totalTrips / badge.next.target) * 100, 100) : 100;

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.paper }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={44} thickness={3} sx={{ color: T.teal, mb: 2 }} />
          <Typography sx={{ fontSize: 14, color: T.slate, fontWeight: 500 }}>Chargement de votre espace…</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Page>
      <Box maxWidth={1240} mx="auto" px={{ xs: 2, md: 4 }}>
        <Grid container spacing={3}>

          {/* ─────────────────── SIDEBAR ─────────────────── */}
          <Grid item xs={12} md={4} lg={3}>
            <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Profile Card */}
              <SCard sx={{ p: 0, overflow: 'hidden', borderRadius: '20px', border: 'none',
                boxShadow: '0 8px 32px rgba(15,45,92,0.12)' }}>
                {/* Navy header with teal accent */}
                <Box sx={{ height: 90, bgcolor: T.navy, position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120,
                    borderRadius: '50%', bgcolor: alpha(T.teal, 0.15) }} />
                  <Box sx={{ position: 'absolute', right: 20, bottom: -20, width: 60, height: 60,
                    borderRadius: '50%', bgcolor: alpha(T.teal, 0.1) }} />
                </Box>
                <Box sx={{ px: 3, pb: 3, textAlign: 'center' }}>
                  <Avatar src={photoUrl || undefined}
                    sx={{ width: 90, height: 90, mx: 'auto', mt: '-45px',
                      border: `4px solid ${T.white}`, bgcolor: T.teal,
                      fontSize: 30, fontWeight: 800,
                      boxShadow: '0 6px 20px rgba(15,45,92,0.18)' }}>
                    {userAny?.first_name?.charAt(0)}
                  </Avatar>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: T.navy, mt: 1.5, lineHeight: 1.2 }}>
                    {userAny?.first_name} {userAny?.last_name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: T.slate, mt: 0.3 }}>
                    {userAny?.email}
                  </Typography>
                  {/* Badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7, mt: 1.5,
                    px: 2, py: 0.8, borderRadius: 10, bgcolor: alpha(badge.color, 0.08),
                    border: `1px solid ${alpha(badge.color, 0.2)}`, mx: 'auto', width: 'fit-content' }}>
                    <Box sx={{ color: badge.color, display: 'flex', '& svg': { fontSize: 14 } }}>{badge.icon}</Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: badge.color }}>{badge.name}</Typography>
                  </Box>
                  {badge.next && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: 10, color: T.slate }}>{totalTrips} voyages</Typography>
                        <Typography sx={{ fontSize: 10, color: T.slate }}>{badge.next.target} pour "{badge.next.name}"</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress}
                        sx={{ height: 5, borderRadius: 3, bgcolor: alpha(T.teal, 0.1),
                          '& .MuiLinearProgress-bar': { bgcolor: T.teal, borderRadius: 3 } }} />
                    </Box>
                  )}
                  <Button fullWidth variant="contained" onClick={() => navigate('/organizer-request')}
                    sx={{ mt: 2.5, py: 1.1, borderRadius: '10px', bgcolor: T.teal,
                      color: T.white, fontSize: 13, fontWeight: 700, textTransform: 'none',
                      boxShadow: `0 4px 14px ${alpha(T.teal, 0.35)}`,
                      '&:hover': { bgcolor: T.tealDk, boxShadow: `0 6px 20px ${alpha(T.teal, 0.4)}` } }}>
                    {userAny?.status_organizer === 'pending' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HourglassEmpty sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Vérification en cours…</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RocketLaunch sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Devenir Organisateur</Typography>
                      </Box>
                    )}
                  </Button>
                </Box>
              </SCard>

              {/* Navigation */}
              <SCard sx={{ p: 1.5 }}>
                {[
                  { label: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
                  { label: 'Mes réservations', icon: <BookingsIcon />, path: '/bookings' },
                  { label: 'Mes favoris',       icon: <Favorite />,     path: '/saved' },
                ].map((item, i) => (
                  <NavItem key={i} onClick={() => navigate(item.path)}
                    sx={{ '&:hover': { bgcolor: alpha(T.teal, 0.07), color: T.teal,
                      '& .nav-icon': { color: T.teal } } }}>
                    <Box className="nav-icon" sx={{ color: T.navy, display: 'flex', transition: '0.18s',
                      '& svg': { fontSize: 20 } }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.label}</Typography>
                  </NavItem>
                ))}
              </SCard>

              {/* Interests */}
              <SCard sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, color: T.navy,
                    letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Mes intérêts
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {editingInterests && (
                      <IconButton size="small" onClick={saveInterests} disabled={savingInterests}
                        sx={{ color: T.teal, bgcolor: alpha(T.teal, 0.08),
                          '&:hover': { bgcolor: alpha(T.teal, 0.15) }, borderRadius: '8px', p: 0.6 }}>
                        {savingInterests
                          ? <CircularProgress size={14} sx={{ color: T.teal }} />
                          : <Save sx={{ fontSize: 16 }} />}
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => { setEditingInterests(!editingInterests); }}
                      sx={{ color: editingInterests ? T.navy : T.slate,
                        bgcolor: editingInterests ? alpha(T.navy, 0.07) : 'transparent',
                        '&:hover': { bgcolor: alpha(T.navy, 0.07) }, borderRadius: '8px', p: 0.6 }}>
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {(editingInterests ? INTERESTS : INTERESTS.filter(i => interests.includes(i.value))).map(item => {
                    const isSelected = interests.includes(item.value);
                    return (
                      <Chip key={item.value} label={item.label}
                        onClick={editingInterests ? () => toggleInterest(item.value) : undefined}
                        sx={{
                          height: 28, fontSize: 11, fontWeight: 700, borderRadius: '8px',
                          cursor: editingInterests ? 'pointer' : 'default',
                          bgcolor: isSelected ? T.navy : alpha(T.navy, 0.05),
                          color: isSelected ? T.white : T.navy,
                          border: `1.5px solid ${isSelected ? T.navy : alpha(T.navy, 0.12)}`,
                          transition: 'all 0.15s',
                          '&:hover': editingInterests ? {
                            bgcolor: isSelected ? T.navyLt : alpha(T.teal, 0.1),
                            borderColor: T.teal,
                          } : {},
                        }} />
                    );
                  })}
                  {!editingInterests && interests.length === 0 && (
                    <Typography sx={{ fontSize: 12, color: T.slate, fontStyle: 'italic' }}>
                      Aucun intérêt sélectionné
                    </Typography>
                  )}
                </Box>
                {editingInterests && (
                  <Typography sx={{ fontSize: 10, color: T.slate, mt: 1.2, fontStyle: 'italic' }}>
                    Cliquez sur les intérêts pour les sélectionner / désélectionner, puis sauvegardez.
                  </Typography>
                )}
              </SCard>

              {/* Logout */}
              <Box onClick={handleLogout}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                  p: 1.8, borderRadius: '12px', cursor: 'pointer', color: T.slate, transition: '0.18s',
                  '&:hover': { color: T.red, bgcolor: alpha(T.red, 0.05) } }}>
                <Logout sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Déconnexion</Typography>
              </Box>
            </Box>
          </Grid>

          {/* ─────────────────── MAIN CONTENT ─────────────────── */}
          <Grid item xs={12} md={8} lg={9}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* ── LOYALTY POINTS ── */}
              <SCard sx={{ p: 3, animation: `${fadeUp} 0.4s ease 0.05s both` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px',
                      background: `linear-gradient(135deg, ${T.amber}, #F59E0B)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 12px ${alpha(T.amber, 0.35)}` }}>
                      <EmojiEvents sx={{ fontSize: 20, color: T.white }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 800, color: T.navy }}>Points Fidélité</Typography>
                      <Typography sx={{ fontSize: 11, color: T.slate }}>1 point gagné par 10 EUR dépensés</Typography>
                    </Box>
                  </Box>
                  {loyaltyData && (
                    <Chip
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getPointsLevel(loyaltyData.available_points).icon}
                          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
                            {getPointsLevel(loyaltyData.available_points).name}
                          </Typography>
                        </Box>
                      }
                      size="small"
                      sx={{ bgcolor: alpha(getPointsLevel(loyaltyData.available_points).color, 0.1),
                        color: getPointsLevel(loyaltyData.available_points).color,
                        fontWeight: 700, fontSize: 11, height: 26, borderRadius: '8px',
                        border: `1px solid ${alpha(getPointsLevel(loyaltyData.available_points).color, 0.25)}` }}
                    />
                  )}
                </Box>

                {loyaltyLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={30} sx={{ color: T.amber }} />
                  </Box>
                ) : loyaltyData ? (
                  <>
                    {/* Stats grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 3 }}>
                      {[
                        { label: 'Disponibles', value: loyaltyData.available_points, color: T.teal,  bg: `linear-gradient(135deg, ${alpha(T.teal, 0.08)}, ${alpha(T.teal, 0.04)})` },
                        { label: 'Gagnés total', value: loyaltyData.total_points,    color: T.amber, bg: `linear-gradient(135deg, ${alpha(T.amber, 0.08)}, ${alpha(T.amber, 0.04)})` },
                        { label: 'Utilisés',     value: loyaltyData.used_points,     color: T.slate, bg: `linear-gradient(135deg, ${alpha(T.slate, 0.07)}, ${alpha(T.slate, 0.03)})` },
                      ].map(stat => (
                        <Box key={stat.label} sx={{ p: 2.5, borderRadius: '14px',
                          background: stat.bg, border: `1px solid ${alpha(stat.color, 0.12)}`,
                          textAlign: 'center' }}>
                          <Typography sx={{ fontSize: 28, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                            {stat.value ?? 0}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: T.slate, mt: 0.6, fontWeight: 500 }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Progress bar */}
                    {(() => {
                      const pts = loyaltyData.available_points;
                      const nextThresholds = [50, 100, 200, 500];
                      const nextTarget  = nextThresholds.find(t => t > pts);
                      const prevTarget  = nextThresholds.filter(t => t <= pts).pop() || 0;
                      const prog = nextTarget
                        ? Math.min(((pts - prevTarget) / (nextTarget - prevTarget)) * 100, 100)
                        : 100;
                      return nextTarget ? (
                        <Box sx={{ mb: 3, p: 2, borderRadius: '12px', bgcolor: alpha(T.amber, 0.04),
                          border: `1px solid ${alpha(T.amber, 0.1)}` }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ fontSize: 11, color: T.slate, fontWeight: 500 }}>
                              Progression vers le niveau suivant
                            </Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, color: T.amber }}>
                              {pts} / {nextTarget} pts
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={prog}
                            sx={{ height: 7, borderRadius: 4, bgcolor: alpha(T.amber, 0.12),
                              '& .MuiLinearProgress-bar': { bgcolor: T.amber, borderRadius: 4 } }} />
                          <Typography sx={{ fontSize: 10, color: T.slate, mt: 0.7 }}>
                            Encore {nextTarget - pts} points pour le niveau suivant
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ mb: 3, p: 2, borderRadius: '12px',
                          bgcolor: alpha('#7C3AED', 0.06), border: `1px solid ${alpha('#7C3AED', 0.15)}`,
                          textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <WorkspacePremium sx={{ fontSize: 18, color: '#7C3AED' }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>
                              Niveau maximum atteint — Platine !
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })()}

                    {/* Transaction history */}
                    {loyaltyData.history?.length > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: T.navy,
                          letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1.5 }}>
                          Historique récent
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          {loyaltyData.history.slice(0, 4).map((tx: any) => (
                            <Box key={tx.id}
                              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                py: 1.2, px: 1.8, borderRadius: '10px',
                                bgcolor: tx.type === 'earn' ? alpha(T.green, 0.04) : alpha(T.red, 0.04),
                                border: `1px solid ${tx.type === 'earn' ? alpha(T.green, 0.1) : alpha(T.red, 0.1)}` }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Box sx={{ width: 30, height: 30, borderRadius: '50%', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  bgcolor: tx.type === 'earn' ? alpha(T.green, 0.1) : alpha(T.red, 0.1) }}>
                                  {tx.type === 'earn'
                                    ? <EmojiEvents sx={{ fontSize: 14, color: T.green }} />
                                    : <CardGiftcard sx={{ fontSize: 14, color: T.red }} />}
                                </Box>
                                <Box>
                                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: T.ink }}>
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

                    {/* CTA si 0 points */}
                    {loyaltyData.total_points === 0 && (
                      <Box sx={{ textAlign: 'center', py: 3, px: 3,
                        border: `2px dashed ${T.border}`, borderRadius: '14px' }}>
                        <EmojiEvents sx={{ fontSize: 40, color: T.border, mb: 1.5 }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.ink, mb: 0.5 }}>
                          Pas encore de points
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: T.slate, mb: 2 }}>
                          Réservez votre premier voyage pour commencer à gagner des points !
                        </Typography>
                        <Button size="small" onClick={() => navigate('/trips')}
                          sx={{ bgcolor: T.teal, color: T.white, borderRadius: '10px',
                            textTransform: 'none', fontWeight: 700, fontSize: 12, px: 3,
                            boxShadow: `0 4px 12px ${alpha(T.teal, 0.3)}`,
                            '&:hover': { bgcolor: T.tealDk } }}>
                          Découvrir les voyages
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ fontSize: 13, color: T.slate }}>
                      Impossible de charger vos points
                    </Typography>
                  </Box>
                )}
              </SCard>

              {/* ── UPCOMING TRIPS ── */}
              <SCard sx={{ p: 3, animation: `${fadeUp} 0.4s ease 0.1s both` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px',
                      background: `linear-gradient(135deg, ${T.teal}, ${T.tealDk})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 12px ${alpha(T.teal, 0.35)}` }}>
                      <CalendarMonth sx={{ fontSize: 20, color: T.white }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 800, color: T.navy }}>Voyages à venir</Typography>
                      <Typography sx={{ fontSize: 11, color: T.slate }}>
                        {upcomingTrips.length} voyage{upcomingTrips.length !== 1 ? 's' : ''} planifié{upcomingTrips.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 13 }} />}
                    onClick={() => navigate('/bookings')}
                    sx={{ fontSize: 12, textTransform: 'none', color: T.teal, fontWeight: 700, p: 0,
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
                    Voir tout
                  </Button>
                </Box>

                {upcomingTrips.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${alpha(T.teal, 0.1)}, ${alpha(T.navy, 0.06)})`,
                      mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FlightTakeoff sx={{ fontSize: 28, color: T.teal }} />
                    </Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.navy, mb: 0.5 }}>
                      Aucun voyage à venir
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: T.slate, mb: 3 }}>
                      Planifiez votre prochaine aventure !
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/trips')}
                      sx={{ bgcolor: T.navy, color: T.white, borderRadius: '10px',
                        textTransform: 'none', fontWeight: 700, px: 4,
                        boxShadow: `0 4px 14px ${alpha(T.navy, 0.3)}`,
                        '&:hover': { bgcolor: T.navyLt } }}>
                      Découvrir des voyages
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 3,
                    borderLeft: `2px solid ${alpha(T.teal, 0.25)}`, position: 'relative' }}>
                    {upcomingTrips.map((booking: any) => (
                      <Box key={booking.id} sx={{ position: 'relative' }}>
                        <TimelineDot />
                        <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${T.border}`,
                          bgcolor: T.white, transition: 'all 0.18s', cursor: 'pointer',
                          '&:hover': { borderColor: alpha(T.teal, 0.5), transform: 'translateX(4px)',
                            boxShadow: `0 4px 16px ${alpha(T.teal, 0.1)}` } }}
                          onClick={() => navigate(`/trips/${booking.trip?.id}`)}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.navy }}>
                              {booking.trip?.title}
                            </Typography>
                            <Chip label={booking.status || 'Confirmé'} size="small"
                              sx={{ height: 22, fontSize: 10, fontWeight: 700,
                                bgcolor: alpha(T.teal, 0.08), color: T.teal, borderRadius: '6px',
                                border: `1px solid ${alpha(T.teal, 0.2)}` }} />
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

              {/* ── PAST TRIPS ── */}
              <SCard sx={{ p: 3, animation: `${fadeUp} 0.4s ease 0.15s both` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px',
                      background: `linear-gradient(135deg, ${alpha(T.slate, 0.6)}, ${alpha(T.navy, 0.5)})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <History sx={{ fontSize: 20, color: T.white }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 800, color: T.navy }}>Voyages passés</Typography>
                      <Typography sx={{ fontSize: 11, color: T.slate }}>
                        {pastTrips.length} voyage{pastTrips.length !== 1 ? 's' : ''} effectué{pastTrips.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {pastTrips.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: T.slate, textAlign: 'center', py: 4 }}>
                    Aucun voyage passé pour le moment
                  </Typography>
                ) : (
                  <Grid container spacing={1.5}>
                    {pastTrips.slice(0, 4).map((booking: any) => (
                      <Grid item xs={12} sm={6} key={booking.id}>
                        <Box sx={{ p: '14px 16px', borderRadius: '12px', border: `1px solid ${T.border}`,
                          cursor: 'pointer', transition: 'all 0.15s',
                          '&:hover': { borderColor: alpha(T.teal, 0.4),
                            boxShadow: `0 4px 16px ${alpha(T.navy, 0.06)}`,
                            transform: 'translateY(-2px)' } }}
                          onClick={() => navigate(`/trips/${booking.trip?.id}`)}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.navy, mb: 0.4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {booking.trip?.title}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: T.slate, mb: 1.2 }}>
                            {booking.trip_session?.start_date}
                          </Typography>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.teal }}>
                            Revivre l'expérience →
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </SCard>

            </Box>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
};

export default Dashboard;