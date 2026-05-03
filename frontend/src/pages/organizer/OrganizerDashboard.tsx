import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha } from '@mui/material/styles';
import {
  FlightTakeoff,
  People,
  AttachMoney,
  Add,
  CalendarMonth,
  Receipt,
  Star,
  ArrowForward,
  HourglassEmpty,
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  LocalOffer,
  Delete,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { RootState } from '../../store';
import api, { organizerAPI } from '../../services/api';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

// ─── Styled ─────────────────────────────────────────────────────
const Page = styled(Box)({
  minHeight: '100vh',
  backgroundColor: alpha(COLORS.navy, 0.02),
  padding: '28px 32px',
});

const SCard = styled(Card)({
  backgroundColor: COLORS.white,
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(COLORS.navy, 0.04)}`,
  overflow: 'visible',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.08)}`,
  },
});

const StyledInput = styled('input')({
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${alpha(COLORS.navy, 0.2)}`,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
  '&:focus': {
    borderColor: COLORS.teal,
  },
});

const StyledSelect = styled('select')({
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${alpha(COLORS.navy, 0.2)}`,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  cursor: 'pointer',
  backgroundColor: COLORS.white,
  transition: 'border-color 0.15s',
  '&:focus': {
    borderColor: COLORS.teal,
  },
});

// ─── Mock chart data ────────────────────────────────────────────
const revenueDataMock = [
  { month: 'Jan', rev: 1200, prev: 900 },
  { month: 'Fév', rev: 1900, prev: 1400 },
  { month: 'Mar', rev: 1500, prev: 1600 },
  { month: 'Avr', rev: 2800, prev: 2000 },
  { month: 'Mai', rev: 2200, prev: 1800 },
  { month: 'Jui', rev: 3100, prev: 2400 },
];

const weeklyDataMock = [
  { d: 'L', v: 4 }, { d: 'M', v: 7 }, { d: 'M', v: 3 },
  { d: 'J', v: 9 }, { d: 'V', v: 6 }, { d: 'S', v: 11 }, { d: 'D', v: 5 },
];

const statusDataMock = [
  { name: 'Confirmées', value: 52, color: COLORS.teal },
  { name: 'En attente', value: 30, color: COLORS.amber },
  { name: 'Annulées',   value: 18, color: alpha(COLORS.navy, 0.2) },
];

// ─── Status maps ─────────────────────────────────────────────────
const bookingStatus: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: 'Confirmée', color: COLORS.teal, bg: alpha(COLORS.teal, 0.08) },
  PENDING:   { label: 'En attente', color: COLORS.amber, bg: alpha(COLORS.amber, 0.08) },
  CANCELLED: { label: 'Annulée',   color: COLORS.amber, bg: alpha(COLORS.amber, 0.08) },
};

const reviewStatus: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'En attente', color: COLORS.amber, bg: alpha(COLORS.amber, 0.08) },
  approved: { label: 'Approuvé',   color: COLORS.teal, bg: alpha(COLORS.teal, 0.08) },
  rejected: { label: 'Rejeté',     color: COLORS.amber, bg: alpha(COLORS.amber, 0.08) },
};

// ─── Custom tooltip ──────────────────────────────────────────────
const CTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: COLORS.white,
      border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
      borderRadius: 2,
      px: 1.5,
      py: 1,
      boxShadow: `0 4px 16px ${alpha(COLORS.navy, 0.08)}`,
    }}>
      <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Typography key={i} sx={{ fontSize: 12, fontWeight: 600, color: p.color || COLORS.navy }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </Typography>
      ))}
    </Box>
  );
};

// ─── KPI card ───────────────────────────────────────────────────
const KPI = ({
  label, value, sub, icon, accent, trend,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; accent: string; trend?: number;
}) => (
  <SCard>
    <CardContent sx={{ p: '20px 24px !important' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 10,
          bgcolor: alpha(accent, 0.1), color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& svg': { fontSize: 20 },
        }}>
          {icon}
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            {trend >= 0
              ? <TrendingUp sx={{ fontSize: 13, color: COLORS.teal }} />
              : <TrendingDown sx={{ fontSize: 13, color: COLORS.amber }} />}
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: trend >= 0 ? COLORS.teal : COLORS.amber }}>
              {trend >= 0 ? '+' : ''}{trend}%
            </Typography>
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize: 26, fontWeight: 700, color: COLORS.navy, lineHeight: 1, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, mb: 0.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6) }}>{sub}</Typography>
    </CardContent>
  </SCard>
);

// ─── Main ────────────────────────────────────────────────────────
const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState({
    total_trips: 0, total_bookings: 0,
    total_revenue: 0, pending_bookings: 0, pending_reviews: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentReviews, setRecentReviews]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [revenueData, setRevenueData] = useState<any[]>(revenueDataMock);
  const [statusData, setStatusData]   = useState<any[]>(statusDataMock);
  const [weeklyData, setWeeklyData]   = useState<any[]>(weeklyDataMock);

  const [loyaltyOffers, setLoyaltyOffers]   = useState<any[]>([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [offerSuccess, setOfferSuccess]     = useState<string | null>(null);
  const [offerError, setOfferError]         = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState({
    title:           '',
    description:     '',
    discount_type:   'percentage_discount',
    discount_value:  '10',
    points_required: '100',
  });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (!user?.roles?.includes('ROLE_ORGANIZER')) { navigate('/dashboard'); return; }
    loadData();
  }, [token, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sR, bR, rR] = await Promise.allSettled([
        organizerAPI.getStats(),
        organizerAPI.getBookings({ limit: 5 }),
        organizerAPI.getReviews({ status: 'pending', limit: 3 }),
      ]);
      if (sR.status === 'fulfilled') {
        const data = sR.value.data;
        setStats(p => ({ ...p, ...data }));
        setRevenueData(data.monthly_revenue?.length ? data.monthly_revenue : revenueDataMock);
        setStatusData(data.status_breakdown?.length ? data.status_breakdown : statusDataMock);
        setWeeklyData(data.weekly_data?.length ? data.weekly_data : weeklyDataMock);
      }
      if (bR.status === 'fulfilled') setRecentBookings(bR.value.data?.slice(0, 5) || []);
      if (rR.status === 'fulfilled') {
        const d = rR.value.data;
        setRecentReviews(d?.reviews?.slice(0, 3) || []);
        setStats(p => ({ ...p, pending_reviews: d?.pending_count || 0 }));
      }
      await loadLoyaltyOffers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadLoyaltyOffers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/loyalty/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setLoyaltyOffers(d.offers || []);
      }
    } catch (_) {}
  };

  const handleCreateOffer = async () => {
    if (!newOffer.title.trim()) {
      setOfferError('Le titre est requis');
      return;
    }
    setLoyaltyLoading(true);
    setOfferError(null);
    setOfferSuccess(null);
    try {
      const res = await fetch('http://localhost:8000/api/loyalty/offers', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(newOffer),
      });
      if (!res.ok) throw new Error('Erreur création offre');
      setOfferSuccess('Offre créée avec succès !');
      setNewOffer({ title: '', description: '', discount_type: 'percentage_discount',
        discount_value: '10', points_required: '100' });
      await loadLoyaltyOffers();
    } catch (e: any) {
      setOfferError(e.message || 'Erreur lors de la création');
    } finally {
      setLoyaltyLoading(false);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/loyalty/offers/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadLoyaltyOffers();
    } catch (_) {}
  };

  if (loading) {
    return (
      <Page sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} thickness={3} sx={{ color: COLORS.teal }} />
      </Page>
    );
  }

  return (
    <Page>
      <Box maxWidth={1400} mx="auto">

        {/* ── KPIs ─────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} sm={6} lg={3}>
            <KPI label="Voyages actifs" value={stats.total_trips}
              sub="Total catalogue" icon={<FlightTakeoff />} accent={COLORS.teal} trend={8} />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <KPI label="Réservations" value={stats.total_bookings}
              sub="30 derniers jours" icon={<People />} accent={COLORS.navy} trend={12} />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <KPI label="Revenus" value={`${(stats.total_revenue || 0).toLocaleString('fr-TN')} TND`}
              sub="Ce mois-ci" icon={<AttachMoney />} accent={COLORS.teal} trend={-3} />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <KPI label="En attente" value={stats.pending_bookings}
              sub="À traiter" icon={<HourglassEmpty />} accent={COLORS.amber} trend={5} />
          </Grid>
        </Grid>

        {/* ── Charts row ───────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>

          {/* Area – Revenue */}
          <Grid xs={12} lg={8}>
            <SCard>
              <CardContent sx={{ p: '20px 24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>
                      Évolution des revenus
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6) }}>
                      6 derniers mois — comparaison N-1
                    </Typography>
                  </Box>
                  <Chip label="+14% vs N-1" size="small"
                    sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, fontWeight: 700, fontSize: 11, height: 22 }} />
                </Box>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gNavy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.navy} stopOpacity={0.08} />
                        <stop offset="100%" stopColor={COLORS.navy} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={alpha(COLORS.navy, 0.08)} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }}
                      tickFormatter={v => `${v / 1000}k`} />
                    <Tooltip content={<CTooltip />} />
                    <Area type="monotone" dataKey="prev" name="N-1"
                      stroke={COLORS.navy} strokeWidth={1.5} strokeDasharray="4 4"
                      fill="url(#gNavy)" dot={false} />
                    <Area type="monotone" dataKey="rev" name="Revenus"
                      stroke={COLORS.teal} strokeWidth={2.5} fill="url(#gTeal)"
                      dot={{ fill: COLORS.teal, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
                <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 18, height: 2.5, borderRadius: 2, bgcolor: COLORS.teal }} />
                    <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>Cette année</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 18, height: 2.5, borderRadius: 2, bgcolor: COLORS.navy, border: `1.5px dashed ${COLORS.navy}` }} />
                    <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>Année N-1</Typography>
                  </Box>
                </Box>
              </CardContent>
            </SCard>
          </Grid>

          {/* Donut – status */}
          <Grid xs={12} lg={4}>
            <SCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: '20px 24px !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, mb: 0.3 }}>
                  Statut des réservations
                </Typography>
                <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6), mb: 2 }}>Distribution globale</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', flex: 1 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%"
                        innerRadius={52} outerRadius={78}
                        paddingAngle={3} dataKey="value"
                        startAngle={90} endAngle={-270} strokeWidth={0}>
                        {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, lineHeight: 1 }}>
                      {statusData[0]?.value || 0}%
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: alpha(COLORS.navy, 0.6) }}>confirmées</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {statusData.map(item => (
                    <Box key={item.name} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6) }}>{item.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS.navy }}>{item.value}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={item.value}
                        sx={{ height: 3, borderRadius: 2, bgcolor: alpha(item.color, 0.12),
                          '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 2 } }} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* ── Mid row ──────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>

          {/* Bar – weekly */}
          <Grid xs={12} md={5}>
            <SCard>
              <CardContent sx={{ p: '20px 24px !important' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, mb: 0.3 }}>
                  Réservations / semaine
                </Typography>
                <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6), mb: 2 }}>7 derniers jours</Typography>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={weeklyData} barSize={20} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <CartesianGrid stroke={alpha(COLORS.navy, 0.08)} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                    <Tooltip content={<CTooltip />} cursor={{ fill: alpha(COLORS.teal, 0.05) }} />
                    <Bar dataKey="v" name="Réservations" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((_, i) => (
                        <Cell key={i} fill={i === 3 ? COLORS.teal : alpha(COLORS.teal, 0.22)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </SCard>
          </Grid>

          {/* Quick nav grid */}
          <Grid xs={12} md={7}>
            <SCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: '20px 24px !important' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, mb: 2 }}>
                  Navigation rapide
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Mes voyages',  sub: `${stats.total_trips} actifs`, icon: <FlightTakeoff />, accent: COLORS.teal, path: '/organizer/trips' },
                    { label: 'Réservations', sub: `${stats.pending_bookings} en attente`, icon: <Receipt />, accent: COLORS.navy, path: '/organizer/bookings' },
                    { label: 'Calendrier',   sub: 'Planning sessions', icon: <CalendarMonth />, accent: COLORS.amber, path: '/organizer/calendar' },
                    { label: 'Avis clients', sub: stats.pending_reviews > 0 ? `${stats.pending_reviews} à traiter` : 'À jour', icon: <Star />, accent: COLORS.amber, path: '/organizer/reviews' },
                  ].map(item => (
                    <Grid xs={6} key={item.label}>
                      <Box onClick={() => navigate(item.path)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          p: '12px 14px', borderRadius: 10, cursor: 'pointer',
                          border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
                          transition: 'all 0.15s',
                          '&:hover': {
                            borderColor: item.accent,
                            bgcolor: alpha(item.accent, 0.04),
                            '& .arr': { opacity: 1, transform: 'translateX(0)' }
                          },
                        }}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: 9,
                          bgcolor: alpha(item.accent, 0.1), color: item.accent,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, '& svg': { fontSize: 18 }
                        }}>
                          {item.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{item.label}</Typography>
                          <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</Typography>
                        </Box>
                        <ArrowForward className="arr" sx={{
                          fontSize: 14, color: item.accent,
                          opacity: 0, transform: 'translateX(-4px)',
                          transition: 'all 0.15s'
                        }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* ════════════════════════════════════════════════════════
            LOYALTY OFFERS SECTION
        ════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12}>
            <SCard>
              <CardContent sx={{ p: '24px !important' }}>

                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 10,
                    bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    '& svg': { fontSize: 20 }
                  }}>
                    <EmojiEvents />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>
                      Gestion des Offres Fidélité
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6) }}>
                      Créez des offres exclusives pour récompenser vos clients fidèles
                    </Typography>
                  </Box>
                  <Chip
                    label={`${loyaltyOffers.length} offre${loyaltyOffers.length !== 1 ? 's' : ''} active${loyaltyOffers.length !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      ml: 'auto',
                      bgcolor: alpha(COLORS.amber, 0.1),
                      color: COLORS.amber,
                      fontWeight: 700,
                      fontSize: 11,
                      height: 24
                    }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '420px 1fr' }, gap: 3 }}>

                  {/* ── Formulaire création ── */}
                  <Box>
                    <Typography sx={{
                      fontSize: 13, fontWeight: 700, color: COLORS.navy, mb: 2,
                      display: 'flex', alignItems: 'center', gap: 1
                    }}>
                      <LocalOffer sx={{ fontSize: 16, color: COLORS.teal }} />
                      Créer une nouvelle offre
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>
                          Titre de l'offre *
                        </Typography>
                        <StyledInput
                          placeholder="Ex: Offre VIP — 10% de réduction"
                          value={newOffer.title}
                          onChange={e => setNewOffer(p => ({ ...p, title: e.target.value }))}
                        />
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>
                          Description (optionnel)
                        </Typography>
                        <StyledInput
                          placeholder="Ex: Réservée aux membres avec 100+ points"
                          value={newOffer.description}
                          onChange={e => setNewOffer(p => ({ ...p, description: e.target.value }))}
                        />
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>
                          Type de réduction
                        </Typography>
                        <StyledSelect
                          value={newOffer.discount_type}
                          onChange={e => setNewOffer(p => ({ ...p, discount_type: e.target.value }))}
                        >
                          <option value="percentage_discount">Réduction en pourcentage (%)</option>
                          <option value="fixed_discount">Réduction fixe (EUR)</option>
                        </StyledSelect>
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        <Box>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>
                            {newOffer.discount_type === 'percentage_discount' ? 'Valeur (%)' : 'Valeur (EUR)'}
                          </Typography>
                          <StyledInput
                            type="number"
                            placeholder={newOffer.discount_type === 'percentage_discount' ? 'Ex: 10' : 'Ex: 50'}
                            value={newOffer.discount_value}
                            onChange={e => setNewOffer(p => ({ ...p, discount_value: e.target.value }))}
                            min="1"
                            max={newOffer.discount_type === 'percentage_discount' ? '100' : undefined}
                          />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>
                            Points requis
                          </Typography>
                          <StyledInput
                            type="number"
                            placeholder="Ex: 100"
                            value={newOffer.points_required}
                            onChange={e => setNewOffer(p => ({ ...p, points_required: e.target.value }))}
                            min="1"
                          />
                        </Box>
                      </Box>

                      {/* Aperçu */}
                      {newOffer.title && (
                        <Box sx={{
                          p: 2, borderRadius: 2, bgcolor: alpha(COLORS.teal, 0.05),
                          border: `1px dashed ${alpha(COLORS.teal, 0.3)}`
                        }}>
                          <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Aperçu de l'offre :</Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.teal }}>{newOffer.title}</Typography>
                          <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>
                            {newOffer.discount_type === 'percentage_discount'
                              ? `${newOffer.discount_value}% de réduction`
                              : `${newOffer.discount_value} EUR de réduction`}
                            {' · '}{newOffer.points_required} points requis
                          </Typography>
                        </Box>
                      )}

                      {offerError && (
                        <Alert severity="error" sx={{ borderRadius: 2, fontSize: 12, bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber }}>
                          {offerError}
                        </Alert>
                      )}
                      {offerSuccess && (
                        <Alert severity="success" sx={{ borderRadius: 2, fontSize: 12, bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal }}>
                          {offerSuccess}
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        disabled={loyaltyLoading || !newOffer.title.trim()}
                        onClick={handleCreateOffer}
                        startIcon={loyaltyLoading ? <CircularProgress size={14} sx={{ color: COLORS.white }} /> : <Add />}
                        sx={{
                          bgcolor: COLORS.teal,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.2,
                          '&:hover': { bgcolor: alpha(COLORS.teal, 0.85) },
                          '&:disabled': { bgcolor: alpha(COLORS.teal, 0.4), color: COLORS.white },
                        }}
                      >
                        {loyaltyLoading ? 'Création...' : 'Créer l\'offre'}
                      </Button>
                    </Box>
                  </Box>

                  {/* ── Liste offres actives ── */}
                  <Box>
                    <Typography sx={{
                      fontSize: 13, fontWeight: 700, color: COLORS.navy, mb: 2,
                      display: 'flex', alignItems: 'center', gap: 1
                    }}>
                      <EmojiEvents sx={{ fontSize: 16, color: COLORS.amber }} />
                      Offres actives
                    </Typography>

                    {loyaltyOffers.length === 0 ? (
                      <Box sx={{
                        textAlign: 'center', py: 6, px: 2,
                        border: `2px dashed ${alpha(COLORS.teal, 0.2)}`,
                        borderRadius: 3
                      }}>
                        <EmojiEvents sx={{ fontSize: 40, color: alpha(COLORS.teal, 0.3), mb: 1.5 }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, mb: 0.5 }}>
                          Aucune offre créée
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6) }}>
                          Créez votre première offre fidélité pour récompenser vos clients
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {loyaltyOffers.map((offer: any) => (
                          <Box key={offer.id} sx={{
                            p: 2, borderRadius: 2,
                            border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', gap: 2,
                            transition: 'border-color 0.15s',
                            '&:hover': { borderColor: alpha(COLORS.amber, 0.5) },
                          }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>
                                  {offer.title}
                                </Typography>
                                <Chip
                                  label={offer.discount_type === 'percentage_discount'
                                    ? `-${offer.discount_value}%`
                                    : `-${offer.discount_value}€`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: 10,
                                    fontWeight: 800,
                                    bgcolor: alpha(COLORS.amber, 0.1),
                                    color: COLORS.amber,
                                  }}
                                />
                              </Box>
                              {offer.description && (
                                <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>
                                  {offer.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <EmojiEvents sx={{ fontSize: 13, color: COLORS.amber }} />
                                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: COLORS.amber }}>
                                    {offer.points_required} points requis
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            <Button
                              size="small"
                              onClick={() => handleDeleteOffer(offer.id)}
                              sx={{
                                color: COLORS.amber,
                                fontSize: 11,
                                textTransform: 'none',
                                minWidth: 0,
                                p: '6px 10px',
                                borderRadius: 1.5,
                                border: `1px solid ${alpha(COLORS.amber, 0.2)}`,
                                '&:hover': { bgcolor: alpha(COLORS.amber, 0.06), borderColor: COLORS.amber },
                              }}
                            >
                              Désactiver
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}

                  </Box>
                </Box>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* ── Bottom row ───────────────────────────────────────── */}
        <Grid container spacing={2}>

          {/* Recent bookings table */}
          <Grid xs={12} lg={7}>
            <SCard>
              <CardContent sx={{ p: '20px 24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>
                    Réservations récentes
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
                    onClick={() => navigate('/organizer/bookings')}
                    sx={{
                      fontSize: 12, textTransform: 'none', color: COLORS.teal, fontWeight: 600,
                      p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                    }}>
                    Voir tout
                  </Button>
                </Box>

                {recentBookings.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Receipt sx={{ fontSize: 36, color: alpha(COLORS.teal, 0.3), mb: 1 }} />
                    <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6) }}>Aucune réservation récente</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Voyage', 'Client', 'Prix', 'Statut'].map(h => (
                            <TableCell key={h} sx={{
                              fontSize: 11, fontWeight: 700, color: alpha(COLORS.navy, 0.6),
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                              py: 1, borderBottom: `1px solid ${alpha(COLORS.teal, 0.15)}`
                            }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentBookings.map((b: any) => {
                          const sc = bookingStatus[b.status] || { label: b.status, color: COLORS.navy, bg: alpha(COLORS.navy, 0.08) };
                          return (
                            <TableRow key={b.id} sx={{
                              '&:last-child td': { borderBottom: 0 },
                              '&:hover td': { bgcolor: alpha(COLORS.teal, 0.02) },
                            }}>
                              <TableCell sx={{ py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>
                                  {b.trip?.title?.substring(0, 22)}{(b.trip?.title?.length || 0) > 22 ? '…' : ''}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 26, height: 26, bgcolor: COLORS.navy, fontSize: 10, color: COLORS.white }}>
                                    {b.user?.first_name?.[0]}{b.user?.last_name?.[0]}
                                  </Avatar>
                                  <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.7) }}>
                                    {b.user?.first_name} {b.user?.last_name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.teal }}>
                                  {b.total_price} {b.currency}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>
                                <Chip label={sc.label} size="small" sx={{
                                  bgcolor: sc.bg, color: sc.color, fontWeight: 700,
                                  fontSize: 11, height: 22, borderRadius: 6,
                                }} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </SCard>
          </Grid>

          {/* Recent reviews */}
          <Grid xs={12} lg={5}>
            <SCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: '20px 24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>Avis récents</Typography>
                  <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
                    onClick={() => navigate('/organizer/reviews')}
                    sx={{
                      fontSize: 12, textTransform: 'none', color: COLORS.teal, fontWeight: 600,
                      p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                    }}>
                    Gérer
                  </Button>
                </Box>

                {stats.pending_reviews > 0 && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, mb: 2,
                    p: '10px 12px', borderRadius: 8,
                    bgcolor: alpha(COLORS.amber, 0.08), border: `1px solid ${alpha(COLORS.amber, 0.2)}`
                  }}>
                    <HourglassEmpty sx={{ fontSize: 14, color: COLORS.amber }} />
                    <Typography sx={{ fontSize: 12, color: COLORS.amber, fontWeight: 600 }}>
                      {stats.pending_reviews} avis en attente de validation
                    </Typography>
                  </Box>
                )}

                {recentReviews.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Star sx={{ fontSize: 36, color: alpha(COLORS.teal, 0.3), mb: 1 }} />
                    <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6) }}>Aucun avis récent</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {recentReviews.map((r: any) => {
                      const rc = reviewStatus[r.status] || { label: r.status, color: COLORS.navy, bg: alpha(COLORS.navy, 0.08) };
                      return (
                        <Box key={r.id} sx={{
                          p: '12px 14px', borderRadius: 10,
                          border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
                          transition: 'border-color 0.15s',
                          '&:hover': { borderColor: alpha(COLORS.teal, 0.4) }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: COLORS.navy, fontSize: 10, color: COLORS.white }}>
                              {r.user?.first_name?.[0]}{r.user?.last_name?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 12, fontWeight: 600, color: COLORS.navy }}>
                                {r.user?.first_name} {r.user?.last_name}
                              </Typography>
                              <Typography sx={{
                                fontSize: 11, color: alpha(COLORS.navy, 0.6),
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                              }}>
                                {r.trip?.title}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
                              <Star sx={{ fontSize: 13, color: COLORS.amber }} />
                              <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS.navy }}>{r.rating}</Typography>
                            </Box>
                          </Box>
                          {r.comment && (
                            <Typography sx={{
                              fontSize: 12, color: alpha(COLORS.navy, 0.7), lineHeight: 1.5, mb: 1,
                              display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden'
                            }}>
                              {r.comment}
                            </Typography>
                          )}
                          <Chip label={rc.label} size="small" sx={{
                            bgcolor: rc.bg, color: rc.color, fontWeight: 700,
                            fontSize: 10, height: 20, borderRadius: 5,
                          }} />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

      </Box>
    </Page>
  );
};

export default OrganizerDashboard;