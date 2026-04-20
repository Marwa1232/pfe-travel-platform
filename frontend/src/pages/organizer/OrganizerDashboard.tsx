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

// ─── Design tokens ──────────────────────────────────────
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

// ─── Styled ─────────────────────────────────────────────
const Page = styled(Box)({
  minHeight: '100vh',
  backgroundColor: T.paper,
  padding: '28px 32px',
});

const SCard = styled(Card)({
  backgroundColor: T.white,
  borderRadius: 12,
  border: `1px solid ${T.border}`,
  boxShadow: 'none',
  overflow: 'visible',
});

// ─── Mock chart data ─────────────────────────────────────
const revenueData = [
  { month: 'Jan', rev: 1200, prev: 900 },
  { month: 'Fév', rev: 1900, prev: 1400 },
  { month: 'Mar', rev: 1500, prev: 1600 },
  { month: 'Avr', rev: 2800, prev: 2000 },
  { month: 'Mai', rev: 2200, prev: 1800 },
  { month: 'Jui', rev: 3100, prev: 2400 },
];

const weeklyData = [
  { d: 'L', v: 4 }, { d: 'M', v: 7 }, { d: 'M', v: 3 },
  { d: 'J', v: 9 }, { d: 'V', v: 6 }, { d: 'S', v: 11 }, { d: 'D', v: 5 },
];

const statusData = [
  { name: 'Confirmées', value: 52, color: T.teal },
  { name: 'En attente', value: 30, color: T.amber },
  { name: 'Annulées',   value: 18, color: T.border },
];

// ─── Status maps ─────────────────────────────────────────
const bookingStatus: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: 'Confirmée', color: T.green, bg: alpha(T.green, 0.08) },
  PENDING:   { label: 'En attente', color: T.amber, bg: alpha(T.amber, 0.08) },
  CANCELLED: { label: 'Annulée',   color: T.red,   bg: alpha(T.red, 0.08) },
};

const reviewStatus: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'En attente', color: T.amber, bg: alpha(T.amber, 0.08) },
  approved: { label: 'Approuvé',   color: T.green, bg: alpha(T.green, 0.08) },
  rejected: { label: 'Rejeté',     color: T.red,   bg: alpha(T.red, 0.08) },
};

// ─── Custom tooltip ──────────────────────────────────────
const CTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: T.white, border: `1px solid ${T.border}`, borderRadius: 2,
      px: 1.5, py: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }}>
      <Typography sx={{ fontSize: 11, color: T.slate, mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Typography key={i} sx={{ fontSize: 12, fontWeight: 600, color: p.color || T.ink }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </Typography>
      ))}
    </Box>
  );
};

// ─── KPI card ────────────────────────────────────────────
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
          width: 40, height: 40, borderRadius: '10px',
          bgcolor: alpha(accent, 0.1), color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& svg': { fontSize: 20 },
        }}>
          {icon}
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            {trend >= 0
              ? <TrendingUp sx={{ fontSize: 13, color: T.green }} />
              : <TrendingDown sx={{ fontSize: 13, color: T.red }} />}
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: trend >= 0 ? T.green : T.red }}>
              {trend >= 0 ? '+' : ''}{trend}%
            </Typography>
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize: 26, fontWeight: 700, color: T.ink, lineHeight: 1, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink, mb: 0.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, color: T.slate }}>{sub}</Typography>
    </CardContent>
  </SCard>
);

// ─── Main ────────────────────────────────────────────────
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
  
  // Chart data from API
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

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
        console.log('STATS API Response:', data);
        setStats(p => ({ ...p, ...data }));
        // Set chart data from API
        setRevenueData(data.monthly_revenue || []);
        setMonthlyData(data.monthly_bookings || []);
        setStatusData(data.status_breakdown || []);
        setWeeklyData(data.weekly_data || []);
      }
      if (bR.status === 'fulfilled') setRecentBookings(bR.value.data?.slice(0, 5) || []);
      if (rR.status === 'fulfilled') {
        const d = rR.value.data;
        setRecentReviews(d?.reviews?.slice(0, 3) || []);
        setStats(p => ({ ...p, pending_reviews: d?.pending_count || 0 }));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Page sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} thickness={3} sx={{ color: T.teal }} />
      </Page>
    );
  }

  return (
    <Page>
      <Box maxWidth={1400} mx="auto">

        {/* ── KPIs ─────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} sm={6} lg={3}>
            <KPI label="Voyages actifs" value={stats.total_trips}
              sub="Total catalogue" icon={<FlightTakeoff />} accent={T.teal} trend={8} />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <KPI label="Réservations" value={stats.total_bookings}
              sub="30 derniers jours" icon={<People />} accent={T.purple} trend={12} />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <KPI label="Revenus" value={`${(stats.total_revenue || 0).toLocaleString('fr-TN')} TND`}
              sub="Ce mois-ci" icon={<AttachMoney />} accent={T.green} trend={-3} />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <KPI label="En attente" value={stats.pending_bookings}
              sub="À traiter" icon={<HourglassEmpty />} accent={T.amber} trend={5} />
          </Grid>
        </Grid>

        {/* ── Charts row ───────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>

          {/* Area – Revenue */}
          <Grid xs={12} lg={8}>
            <SCard>
              <CardContent sx={{ p: '20px 24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 600, color: T.ink }}>
                      Évolution des revenus
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: T.slate }}>
                      6 derniers mois — comparaison N-1
                    </Typography>
                  </Box>
                  <Chip label="+14% vs N-1" size="small"
                    sx={{ bgcolor: alpha(T.green, 0.1), color: T.green, fontWeight: 700, fontSize: 11, height: 22 }}
                  />
                </Box>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.teal} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={T.teal} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gSlate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.slate} stopOpacity={0.08} />
                        <stop offset="100%" stopColor={T.slate} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: T.slate }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: T.slate }}
                      tickFormatter={v => `${v / 1000}k`} />
                    <Tooltip content={<CTooltip />} />
                    <Area type="monotone" dataKey="prev" name="N-1"
                      stroke={T.slate} strokeWidth={1.5} strokeDasharray="4 4"
                      fill="url(#gSlate)" dot={false} />
                    <Area type="monotone" dataKey="rev" name="Revenus"
                      stroke={T.teal} strokeWidth={2.5} fill="url(#gTeal)"
                      dot={{ fill: T.teal, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
                <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
                  {[
                    { label: 'Cette année', color: T.teal,  dash: false },
                    { label: 'Année N-1',   color: T.slate, dash: true },
                  ].map(l => (
                    <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{
                        width: 18, height: 2.5, borderRadius: 2,
                        bgcolor: l.dash ? 'transparent' : l.color,
                        border: l.dash ? `1.5px dashed ${l.color}` : 'none',
                      }} />
                      <Typography sx={{ fontSize: 11, color: T.slate }}>{l.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </SCard>
          </Grid>

          {/* Donut – status */}
          <Grid xs={12} lg={4}>
            <SCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: '20px 24px !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: T.ink, mb: 0.3 }}>
                  Statut des réservations
                </Typography>
                <Typography sx={{ fontSize: 12, color: T.slate, mb: 2 }}>Distribution globale</Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', flex: 1 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%"
                        innerRadius={52} outerRadius={78}
                        paddingAngle={3} dataKey="value"
                        startAngle={90} endAngle={-270} strokeWidth={0}
                      >
                        {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, color: T.ink, lineHeight: 1 }}>
                      {statusData[0].value}%
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: T.slate }}>confirmées</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  {statusData.map(item => (
                    <Box key={item.name} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography sx={{ fontSize: 12, color: T.slate }}>{item.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{item.value}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={item.value}
                        sx={{
                          height: 3, borderRadius: 2,
                          bgcolor: alpha(item.color, 0.12),
                          '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 2 },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* ── Mid row ──────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>

          {/* Bar – weekly */}
          <Grid xs={12} md={5}>
            <SCard>
              <CardContent sx={{ p: '20px 24px !important' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: T.ink, mb: 0.3 }}>
                  Réservations / semaine
                </Typography>
                <Typography sx={{ fontSize: 12, color: T.slate, mb: 2 }}>7 derniers jours</Typography>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={weeklyData} barSize={20} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                    <Tooltip content={<CTooltip />} cursor={{ fill: alpha(T.teal, 0.05) }} />
                    <Bar dataKey="v" name="Réservations" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((_, i) => (
                        <Cell key={i} fill={i === 3 ? T.teal : alpha(T.teal, 0.22)} />
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
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: T.ink, mb: 2 }}>
                  Navigation rapide
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Mes voyages',  sub: `${stats.total_trips} actifs`,   icon: <FlightTakeoff />, accent: T.teal,   path: '/organizer/trips' },
                    { label: 'Réservations', sub: `${stats.pending_bookings} en attente`, icon: <Receipt />, accent: T.purple, path: '/organizer/bookings' },
                    { label: 'Calendrier',   sub: 'Planning sessions',             icon: <CalendarMonth />, accent: T.amber,  path: '/organizer/calendar' },
                    {
                      label: 'Avis clients',
                      sub: stats.pending_reviews > 0 ? `${stats.pending_reviews} à traiter` : 'À jour',
                      icon: <Star />, accent: '#E11D48', path: '/organizer/reviews',
                    },
                  ].map(item => (
                    <Grid xs={6} key={item.label}>
                      <Box
                        onClick={() => navigate(item.path)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          p: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                          border: `1px solid ${T.border}`, transition: 'all 0.15s',
                          '&:hover': {
                            borderColor: item.accent,
                            bgcolor: alpha(item.accent, 0.04),
                            '& .arr': { opacity: 1, transform: 'translateX(0)' },
                          },
                        }}
                      >
                        <Box sx={{
                          width: 36, height: 36, borderRadius: '9px',
                          bgcolor: alpha(item.accent, 0.1), color: item.accent,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, '& svg': { fontSize: 18 },
                        }}>
                          {item.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: T.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.sub}
                          </Typography>
                        </Box>
                        <ArrowForward className="arr" sx={{
                          fontSize: 14, color: item.accent,
                          opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.15s',
                        }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* ── Bottom row ───────────────────────────────── */}
        <Grid container spacing={2}>

          {/* Recent bookings table */}
          <Grid xs={12} lg={7}>
            <SCard>
              <CardContent sx={{ p: '20px 24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: T.ink }}>
                    Réservations récentes
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
                    onClick={() => navigate('/organizer/bookings')}
                    sx={{
                      fontSize: 12, textTransform: 'none', color: T.teal, fontWeight: 600,
                      p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    Voir tout
                  </Button>
                </Box>

                {recentBookings.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Receipt sx={{ fontSize: 36, color: T.border, mb: 1 }} />
                    <Typography sx={{ fontSize: 13, color: T.slate }}>Aucune réservation récente</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Voyage', 'Client', 'Prix', 'Statut'].map(h => (
                            <TableCell key={h} sx={{
                              fontSize: 11, fontWeight: 700, color: T.slate,
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                              py: 1, borderBottom: `1px solid ${T.border}`,
                            }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentBookings.map((b: any) => {
                          const sc = bookingStatus[b.status] || { label: b.status, color: T.slate, bg: T.border };
                          return (
                            <TableRow key={b.id} sx={{
                              '&:last-child td': { borderBottom: 0 },
                              '&:hover td': { bgcolor: alpha(T.teal, 0.02) },
                            }}>
                              <TableCell sx={{ py: 1.2, borderColor: T.border }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                                  {b.trip?.title?.substring(0, 22)}{(b.trip?.title?.length || 0) > 22 ? '…' : ''}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: T.border }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 26, height: 26, bgcolor: T.navy, fontSize: 10 }}>
                                    {b.user?.first_name?.[0]}{b.user?.last_name?.[0]}
                                  </Avatar>
                                  <Typography sx={{ fontSize: 12, color: T.slate }}>
                                    {b.user?.first_name} {b.user?.last_name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: T.border }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.teal }}>
                                  {b.total_price} {b.currency}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: T.border }}>
                                <Chip label={sc.label} size="small" sx={{
                                  bgcolor: sc.bg, color: sc.color, fontWeight: 700,
                                  fontSize: 11, height: 22, borderRadius: '6px',
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
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: T.ink }}>Avis récents</Typography>
                  <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
                    onClick={() => navigate('/organizer/reviews')}
                    sx={{
                      fontSize: 12, textTransform: 'none', color: T.teal, fontWeight: 600,
                      p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    Gérer
                  </Button>
                </Box>

                {stats.pending_reviews > 0 && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, mb: 2,
                    p: '10px 12px', borderRadius: '8px',
                    bgcolor: alpha(T.amber, 0.08),
                    border: `1px solid ${alpha(T.amber, 0.2)}`,
                  }}>
                    <HourglassEmpty sx={{ fontSize: 14, color: T.amber }} />
                    <Typography sx={{ fontSize: 12, color: T.amber, fontWeight: 600 }}>
                      {stats.pending_reviews} avis en attente de validation
                    </Typography>
                  </Box>
                )}

                {recentReviews.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Star sx={{ fontSize: 36, color: T.border, mb: 1 }} />
                    <Typography sx={{ fontSize: 13, color: T.slate }}>Aucun avis récent</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {recentReviews.map((r: any) => {
                      const rc = reviewStatus[r.status] || { label: r.status, color: T.slate, bg: T.border };
                      return (
                        <Box key={r.id} sx={{
                          p: '12px 14px', borderRadius: '10px',
                          border: `1px solid ${T.border}`, transition: 'border-color 0.15s',
                          '&:hover': { borderColor: alpha(T.teal, 0.4) },
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: T.navy, fontSize: 10 }}>
                              {r.user?.first_name?.[0]}{r.user?.last_name?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 12, fontWeight: 600, color: T.ink }}>
                                {r.user?.first_name} {r.user?.last_name}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: T.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.trip?.title}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
                              <Star sx={{ fontSize: 13, color: '#F59E0B' }} />
                              <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{r.rating}</Typography>
                            </Box>
                          </Box>
                          {r.comment && (
                            <Typography sx={{
                              fontSize: 12, color: T.slate, lineHeight: 1.5, mb: 1,
                              display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {r.comment}
                            </Typography>
                          )}
                          <Chip label={rc.label} size="small" sx={{
                            bgcolor: rc.bg, color: rc.color, fontWeight: 700,
                            fontSize: 10, height: 20, borderRadius: '5px',
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