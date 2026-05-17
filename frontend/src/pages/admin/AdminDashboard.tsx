import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Card, CardContent, Paper, CircularProgress,
  Button, Chip, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  TextField, InputAdornment, Tab, Tabs, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Stack, LinearProgress,
  Divider, Select, MenuItem as MItem, FormControl,
  Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  People, FlightTakeoff, Business, AttachMoney,
  CheckCircle, Block, Refresh, Search, Category,
  Public, Shield, Add, Edit, Delete, CloudUpload,
  ArrowForward, TrendingUp, TrendingDown, HourglassEmpty,
  Warning, AccountBalance, Speed, Insights, ShowChart,
  EmojiEvents, Place, PendingActions,
  DesktopWindows, PhoneAndroid, TabletMac,
  Flag, StarBorder, MoreVert, ThumbDown,
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { RootState } from '../../store';
import { adminAPI } from '../../services/api';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

const Page = styled(Box)({
  minHeight: '100vh',
  backgroundColor: alpha(COLORS.navy, 0.02),
  padding: '28px 32px 64px',
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
    borderColor: alpha(COLORS.teal, 0.2),
  },
});

const GlowCard = styled(Card)(({ color }: { color: string }) => ({
  backgroundColor: color,
  borderRadius: 12,
  border: 'none',
  boxShadow: `0 8px 20px ${alpha(color, 0.3)}`,
  overflow: 'hidden',
  position: 'relative',
  transition: 'transform 0.2s ease',
  '&:hover': { transform: 'translateY(-2px)' },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    right: 20,
    width: 140,
    height: 140,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
}));

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 13,
  color: alpha(COLORS.navy, 0.6),
  minHeight: 44,
  '&.Mui-selected': {
    color: COLORS.teal,
    fontWeight: 700,
  },
});

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 10,
  padding: theme.spacing(0.8, 2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.8rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
}));

const CTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: COLORS.white, border: `1px solid ${alpha(COLORS.teal, 0.2)}`, borderRadius: 1.5, px: 1.5, py: 1, boxShadow: `0 4px 12px ${alpha(COLORS.navy, 0.1)}` }}>
      <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6), mb: 0.5, fontWeight: 600 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: COLORS.navy }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── Dropdown Menu Component ──────────────────────────────────────
interface ActionMenuProps {
  actions: { label: string; icon: React.ReactNode; color?: string; onClick: () => void }[];
}
const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: alpha(COLORS.navy, 0.5) }}>
        <MoreVert sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.15)}`, boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.12)}`, minWidth: 160 } }}
      >
        {actions.map((action, i) => (
          <MenuItem
            key={i}
            onClick={() => { action.onClick(); setAnchorEl(null); }}
            sx={{ fontSize: 13, py: 1, color: action.color || COLORS.navy, '&:hover': { bgcolor: alpha(action.color || COLORS.teal, 0.07) } }}
          >
            <ListItemIcon sx={{ minWidth: 30, color: action.color || COLORS.teal }}>
              {action.icon}
            </ListItemIcon>
            <ListItemText primary={action.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState<any>({
    totalUsers: 0, totalOrganizers: 0, totalTrips: 0, totalRevenue: 0,
    pendingOrganizers: 0, completedBookings: 0, pendingBookings: 0,
    cancelledBookings: 0, conversionRate: 0,
  });
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [flaggedReviews, setFlaggedReviews] = useState<any[]>([]);

  // ─── Real chart data from API ─────────────────────────────────
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);

  const [createDialog, setCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<'category'|'destination'>('category');
  const [editDialog, setEditDialog] = useState(false);
  const [editType, setEditType] = useState<'category'|'destination'>('category');
  const [newCat, setNewCat] = useState({ name: '' });
  const [newDest, setNewDest] = useState({ name: '', country: '', region: '' });
  const [newDestFile, setNewDestFile] = useState<File|null>(null);
  const [editCat, setEditCat] = useState<any>(null);
  const [editDest, setEditDest] = useState<any>(null);
  const [editDestFile, setEditDestFile] = useState<File|null>(null);

  // ─── Visitors Analytics from real data ───────────────────────
  // On utilise les nouveaux users + bookings par période depuis detailedStats
  const buildVisitorsData = (ds: any) => {
    if (!ds) return { total: 0, items: [] };
    // Aggregate monthly users = proxy pour "activité"
    const monthly = ds.monthlyUsers || [];
    const total = monthly.reduce((s: number, m: any) => s + (m.count || 0), 0);
    // On répartit par source fictive normalisée (pas de Google Analytics en local)
    return {
      total,
      items: [
        { name: 'Nouveaux users', value: total, color: COLORS.teal },
      ],
    };
  };

  useEffect(() => {
    if (!token || !user?.roles?.includes('ROLE_ADMIN')) { navigate('/dashboard'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.allSettled([
      adminAPI.getStats().then(r => setStats(r.data)).catch(() => {}),
      adminAPI.getDetailedStats().then(r => {
        setDetailedStats(r.data);
        // Build real monthly chart data from API
        if (r.data?.monthlyRevenue && r.data?.monthlyBookings && r.data?.monthlyUsers) {
          const months = r.data.monthlyRevenue.map((item: any, i: number) => {
            const monthLabel = item.month ? item.month.slice(5) : `M${i+1}`; // "2025-01" → "01"
            // Convert "2025-01" to short french label
            const [year, mon] = (item.month || '').split('-');
            const monthNames = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
            const label = mon ? monthNames[parseInt(mon) - 1] : monthLabel;
            return {
              month: label,
              revenue: item.revenue || 0,
              bookings: r.data.monthlyBookings[i]?.count || 0,
              users: r.data.monthlyUsers[i]?.count || 0,
            };
          });
          setMonthlyChartData(months);
        }
      }).catch(() => {}),
      adminAPI.getFinancialStats().then(r => setFinancialData(r.data)).catch(() => {}),
      adminAPI.getOrganizers().then(r => setOrganizers(r.data)).catch(() => {}),
      adminAPI.getCategories().then(r => setCategories(r.data)).catch(() => {}),
      adminAPI.getDestinations().then(r => setDestinations(r.data)).catch(() => {}),
      adminAPI.getReviews({ flagged: '1' }).then(r => setFlaggedReviews(r.data.reviews || [])).catch(() => {}),
    ]);
    setLoading(false);
  };

  // Build weekly data from real bookings (last 7 days using monthlyBookings as fallback)
  const buildWeeklyData = () => {
    const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    // Since we don't have daily breakdown in the API, we distribute the last month's bookings
    const lastMonthBookings = detailedStats?.monthlyBookings?.[detailedStats.monthlyBookings.length - 1]?.count || 0;
    return days.map((d, i) => ({
      d,
      bookings: Math.round(lastMonthBookings / 7 * (0.7 + Math.random() * 0.6)),
    }));
  };

  const refresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); };

  const handleApprove = async (id: number) => {
    await adminAPI.approveOrganizer(id).catch(() => {});
    adminAPI.getOrganizers().then(r => setOrganizers(r.data));
    adminAPI.getStats().then(r => setStats(r.data));
  };
  const handleReject = async (id: number) => {
    await adminAPI.blockOrganizer(id).catch(() => {});
    adminAPI.getOrganizers().then(r => setOrganizers(r.data));
    adminAPI.getStats().then(r => setStats(r.data));
  };
  const handleBlock = async (id: number) => {
    await adminAPI.blockOrganizer(id).catch(() => {});
    adminAPI.getOrganizers().then(r => setOrganizers(r.data));
  };

  // CRUD fonctions
  const handleDeleteCat = async (id: number) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    await adminAPI.deleteCategory(id);
    adminAPI.getCategories().then(r => setCategories(r.data));
  };
  const handleDeleteDest = async (id: number) => {
    if (!window.confirm('Supprimer cette destination ?')) return;
    await adminAPI.deleteDestination(id);
    adminAPI.getDestinations().then(r => setDestinations(r.data));
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm('Supprimer définitivement cet avis ?')) return;
    await adminAPI.deleteReview(id).catch(() => {});
    adminAPI.getReviews({ flagged: '1' }).then(r => setFlaggedReviews(r.data.reviews || []));
  };

  const handleUnflagReview = async (id: number) => {
    await adminAPI.unflagReview(id).catch(() => {});
    adminAPI.getReviews({ flagged: '1' }).then(r => setFlaggedReviews(r.data.reviews || []));
  };

  const handleCreateCat = async () => {
    if (!newCat.name) return;
    await adminAPI.createCategory({ name: newCat.name });
    setNewCat({ name: '' });
    setCreateDialog(false);
    adminAPI.getCategories().then(r => setCategories(r.data));
  };
  const handleCreateDest = async () => {
    if (!newDest.name) return;
    const payload = newDestFile
      ? (() => { const f = new FormData(); Object.entries(newDest).forEach(([k,v]) => f.append(k, v)); f.append('image', newDestFile); return f; })()
      : newDest;
    await adminAPI.createDestination(payload);
    setNewDest({ name: '', country: '', region: '' });
    setNewDestFile(null);
    setCreateDialog(false);
    adminAPI.getDestinations().then(r => setDestinations(r.data));
  };
  const handleUpdateCat = async () => {
    if (!editCat) return;
    await adminAPI.updateCategory(editCat.id, { name: editCat.name });
    setEditDialog(false);
    setEditCat(null);
    adminAPI.getCategories().then(r => setCategories(r.data));
  };
  const handleUpdateDest = async () => {
    if (!editDest) return;
    const payload = editDestFile
      ? (() => { const f = new FormData(); Object.entries(editDest).forEach(([k,v]) => f.append(k, String(v))); f.append('image', editDestFile); return f; })()
      : editDest;
    await adminAPI.updateDestination(editDest.id, payload);
    setEditDialog(false);
    setEditDest(null);
    setEditDestFile(null);
    adminAPI.getDestinations().then(r => setDestinations(r.data));
  };

  const pendingOrgs = organizers.filter(o => o.status === 'PENDING');
  const filteredOrgs = organizers.filter(o =>
    o.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const orgStatusData = [
    { name: 'Approuvés',  value: organizers.filter(o => o.status === 'APPROVED').length, color: COLORS.teal },
    { name: 'En attente', value: pendingOrgs.length,  color: COLORS.amber },
    { name: 'Bloqués',    value: organizers.filter(o => o.status === 'BLOCKED').length,  color: COLORS.navy },
  ];

  // ─── Real Visitors Analytics ──────────────────────────────────
  const totalNewUsers = detailedStats?.monthlyUsers?.reduce((s: number, m: any) => s + (m.count || 0), 0) || 0;
  const totalBookingsAll = detailedStats?.monthlyBookings?.reduce((s: number, m: any) => s + (m.count || 0), 0) || 0;
  const visitorsAnalyticsData = [
    { name: 'Nouveaux users', value: totalNewUsers || 1, color: COLORS.navy },
    { name: 'Réservations', value: totalBookingsAll || 1, color: COLORS.teal },
    { name: 'Voyages', value: stats.totalTrips || 1, color: COLORS.amber },
  ];
  const visitorsTotal = totalNewUsers + totalBookingsAll + stats.totalTrips;

  // ─── Commission par organisateur (depuis financialData) ───────
  // Calcul commission réelle depuis payments.platform_fee via détailed stats + organizer data
  const commissionByOrganizer = React.useMemo(() => {
    if (!financialData || !organizers.length) return [];
    // On va utiliser les top organizers de detailedStats avec platform_fee
    const topOrgs = detailedStats?.topOrganizers || [];
    return topOrgs.map((o: any) => ({
      name: o.organizer,
      commission: o.platformFee ?? Math.round(o.revenue * 0.10),
      revenue: o.revenue,
      bookings: o.bookings,
    })).sort((a: any, b: any) => b.commission - a.commission);
  }, [financialData, detailedStats, organizers]);

  // Voyage qui a le plus rapporté à la plateforme
  const bestTrip = React.useMemo(() => {
    const trips = detailedStats?.topTrips || [];
    return trips.length > 0 ? trips[0] : null;
  }, [detailedStats]);

  const weeklyData = buildWeeklyData();

  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={40} thickness={3} sx={{ color: COLORS.teal, mb: 2 }} />
        <Typography sx={{ fontSize: 14, color: alpha(COLORS.navy, 0.6) }}>Chargement du panel admin…</Typography>
      </Box>
    </Box>
  );

  return (
    <Page>
      <Box maxWidth={1440} mx="auto">

        {/* TOP BAR */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2, animation: `${fadeUp} 0.4s ease` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(COLORS.teal, 0.4)}` }}>
              <Shield sx={{ fontSize: 22, color: COLORS.white }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, letterSpacing: '-0.3px' }}>Administration</Typography>
              <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5) }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {pendingOrgs.length > 0 && (
              <Button onClick={() => setTabValue(0)} sx={{ borderRadius: 10, textTransform: 'none', fontWeight: 600, fontSize: 12, bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber, border: `1px solid ${alpha(COLORS.amber, 0.3)}`, animation: `${pulse} 2s ease-in-out infinite` }}>
                <HourglassEmpty sx={{ fontSize: 14, mr: 0.6 }} />
                {pendingOrgs.length} demande{pendingOrgs.length > 1 ? 's' : ''} en attente
              </Button>
            )}
            <Tooltip title="Actualiser">
              <IconButton onClick={refresh} disabled={refreshing} sx={{ bgcolor: COLORS.white, border: `1px solid ${alpha(COLORS.teal, 0.2)}`, borderRadius: 10, width: 38, height: 38 }}>
                {refreshing ? <CircularProgress size={16} sx={{ color: COLORS.teal }} /> : <Refresh sx={{ fontSize: 18, color: alpha(COLORS.navy, 0.6) }} />}
              </IconButton>
            </Tooltip>
            <GradientButton startIcon={<People />} onClick={() => navigate('/admin/users')}>
              Utilisateurs
            </GradientButton>
            <Button onClick={() => navigate('/admin/organizers')} sx={{ borderRadius: 10, textTransform: 'none', bgcolor: COLORS.amber, color: COLORS.white, fontWeight: 600, fontSize: 13, px: 2, py: 0.8, '&:hover': { bgcolor: alpha(COLORS.amber, 0.85) } }}>
              <Business sx={{ fontSize: 16, mr: 0.8 }} />Organisateurs
            </Button>
          </Box>
        </Box>

        {/* ─── KPI CARDS — Données réelles ─────────────────────── */}
        <Grid container spacing={4} sx={{ mb: 3 }}>
          {[
            { label: 'Utilisateurs',   value: stats.totalUsers,      sub: 'Comptes inscrits',           color: COLORS.navy, icon: <People />,       trend: null },
            { label: 'Organisateurs',  value: stats.totalOrganizers, sub: `${stats.pendingOrganizers} en attente`, color: COLORS.amber, icon: <Business />,    trend: null },
            { label: 'Voyages actifs', value: stats.totalTrips,      sub: 'Sur la plateforme',          color: COLORS.teal, icon: <FlightTakeoff />, trend: null },
          ].map((item, i) => (
            <Grid xs={12} sm={6} lg={4} key={i}>
              <GlowCard color={item.color} sx={{ animation: `${fadeUp} 0.4s ease ${i * 0.08}s both` }}>
                <CardContent sx={{ p: '20px 22px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 10, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.white }}>
                      {item.icon}
                    </Box>
                    
                  </Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, color: COLORS.white, lineHeight: 1, mb: 0.5 }}>{item.value}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{item.sub}</Typography>
                </CardContent>
              </GlowCard>
            </Grid>
          ))}
        </Grid>

        {/* ─── CHARTS ROW 1 — Données réelles ──────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} lg={8}>
            <SCard sx={{ animation: `${fadeUp} 0.4s ease 0.2s both` }}>
              <CardContent sx={{ p: '22px 24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Revenus & Réservations</Typography>
                    <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5) }}>
                      {monthlyChartData.length > 0 ? 'Données réelles — 6 derniers mois' : 'Chargement des données réelles…'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[
                      { label: 'Revenus', color: COLORS.teal },
                      { label: 'Réservations', color: COLORS.navy, dash: true }
                    ].map(l => (
                      <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ width: 16, height: 2.5, bgcolor: (l as any).dash ? 'transparent' : l.color, borderRadius: 2, border: (l as any).dash ? `1.5px dashed ${l.color}` : 'none' }} />
                        <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>{l.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={monthlyChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.navy} stopOpacity={0.1} />
                        <stop offset="100%" stopColor={COLORS.navy} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={alpha(COLORS.navy, 0.08)} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} tickFormatter={v => v >= 1000 ? `${v/1000}k` : v} />
                    <RTooltip content={<CTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenus (EUR)" stroke={COLORS.teal} strokeWidth={2.5} fill="url(#gT)" dot={{ fill: COLORS.teal, r: 3.5 }} activeDot={{ r: 5.5 }} />
                    <Area type="monotone" dataKey="bookings" name="Réservations" stroke={COLORS.navy} strokeWidth={1.8} strokeDasharray="4 4" fill="url(#gN)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </SCard>
          </Grid>

          {/* ─── Visitors Analytics — Données réelles ─────────── */}
          <Grid xs={12} lg={4}>
            <SCard sx={{ height: '100%', animation: `${fadeUp} 0.4s ease 0.25s both` }}>
              <CardContent sx={{ p: '22px 24px !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Activité plateforme</Typography>
                    <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5) }}>Données réelles — 6 mois</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', my: 1 }}>
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={visitorsAnalyticsData} cx="50%" cy="50%" innerRadius={56} outerRadius={90} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                        {visitorsAnalyticsData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, lineHeight: 1 }}>{visitorsTotal.toLocaleString()}</Typography>
                    <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5) }}>Total activité</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 'auto' }}>
                  <Grid container spacing={1}>
                    {visitorsAnalyticsData.map(item => (
                      <Grid xs={12} key={item.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.7) }}>{item.name}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS.navy, ml: 'auto' }}>{item.value.toLocaleString()}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  
                </Box>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* CHARTS ROW 2 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} md={4}>
            <SCard sx={{ animation: `${fadeUp} 0.4s ease 0.3s both` }}>
              <CardContent sx={{ p: '22px 24px !important' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, mb: 0.3 }}>Réservations / semaine</Typography>
                <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5), mb: 2 }}>Estimation sur 7 jours (dernier mois)</Typography>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={weeklyData} barSize={22} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <CartesianGrid stroke={alpha(COLORS.navy, 0.08)} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                    <RTooltip content={<CTooltip />} cursor={{ fill: alpha(COLORS.teal, 0.05) }} />
                    <Bar dataKey="bookings" name="Réservations" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((_, i) => <Cell key={i} fill={i === 5 ? COLORS.teal : alpha(COLORS.teal, 0.25)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </SCard>
          </Grid>

          <Grid xs={12} md={4}>
            <SCard sx={{ animation: `${fadeUp} 0.4s ease 0.35s both` }}>
              <CardContent sx={{ p: '22px 24px !important' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, mb: 0.3 }}>Organisateurs</Typography>
                <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5), mb: 2 }}>Par statut</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ResponsiveContainer width={110} height={110}>
                    <PieChart>
                      <Pie data={orgStatusData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {orgStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ flex: 1 }}>
                    {orgStatusData.map(item => (
                      <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.7) }}>{item.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </SCard>
          </Grid>

          <Grid xs={12} md={4}>
            <SCard sx={{ animation: `${fadeUp} 0.4s ease 0.4s both` }}>
              <CardContent sx={{ p: '22px 24px !important' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, mb: 0.3 }}>Nouveaux utilisateurs</Typography>
                <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5), mb: 2 }}>6 derniers mois — données réelles</Typography>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={monthlyChartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                    <CartesianGrid stroke={alpha(COLORS.navy, 0.08)} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: alpha(COLORS.navy, 0.6) }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: alpha(COLORS.navy, 0.6) }} />
                    <RTooltip content={<CTooltip />} />
                    <Line type="monotone" dataKey="users" name="Utilisateurs" stroke={COLORS.amber} strokeWidth={2.5} dot={{ fill: COLORS.amber, r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* TABS */}
        <SCard sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: `1px solid ${alpha(COLORS.teal, 0.15)}`, '& .MuiTabs-indicator': { bgcolor: COLORS.teal, height: 3, borderRadius: '3px 3px 0 0' } }}>
            <StyledTab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield sx={{ fontSize: 15 }} />
                Modération
                {pendingOrgs.length > 0 && (
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: COLORS.amber, color: COLORS.white, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pendingOrgs.length}
                  </Box>
                )}
              </Box>
            } />
            <StyledTab icon={<Insights sx={{ fontSize: 15 }} />} iconPosition="start" label="Insights" />
            <StyledTab icon={<AccountBalance sx={{ fontSize: 15 }} />} iconPosition="start" label="Financier" />
            <StyledTab icon={<Category sx={{ fontSize: 15 }} />} iconPosition="start" label="Contenu" />
            <StyledTab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flag sx={{ fontSize: 15 }} />
                Avis signalés
                {flaggedReviews.length > 0 && (
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#DC2626', color: COLORS.white, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {flaggedReviews.length}
                  </Box>
                )}
              </Box>
            } />
          </Tabs>
        </SCard>

        {/* ─── TAB 0 — MODÉRATION ────────────────────────────────── */}
        {tabValue === 0 && (
          <Grid container spacing={2}>
            {/* Liste d'attente avec Dropdown Menu */}
            {pendingOrgs.length > 0 && (
              <Grid xs={12}>
                <SCard sx={{ border: `1px solid ${alpha(COLORS.amber, 0.3)}` }}>
                  <CardContent sx={{ p: '20px 24px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.amber, animation: `${pulse} 1.5s ease-in-out infinite` }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>
                        {pendingOrgs.length} demande{pendingOrgs.length > 1 ? 's' : ''} en attente
                      </Typography>
                    </Box>
                    <Grid container spacing={1.5}>
                      {pendingOrgs.map(org => (
                        <Grid xs={12} sm={6} md={4} key={org.id}>
                          <Box sx={{ p: '12px 14px', borderRadius: 2, border: `1px solid ${alpha(COLORS.amber, 0.25)}`, bgcolor: alpha(COLORS.amber, 0.03), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 38, height: 38, bgcolor: COLORS.navy, fontSize: 14, fontWeight: 700, color: COLORS.white }}>{org.agency_name?.[0]}</Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.agency_name}</Typography>
                              <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.user?.email}</Typography>
                            </Box>
                            {/* ─── Dropdown Menu pour organisateur en attente ─── */}
                            <ActionMenu actions={[
                              {
                                label: 'Voir détails',
                                icon: <ArrowForward sx={{ fontSize: 15 }} />,
                                onClick: () => navigate(`/admin/organizers/${org.id}`),
                              },
                              {
                                label: 'Approuver',
                                icon: <CheckCircle sx={{ fontSize: 15 }} />,
                                color: COLORS.teal,
                                onClick: () => handleApprove(org.id),
                              },
                              {
                                label: 'Rejeter',
                                icon: <ThumbDown sx={{ fontSize: 15 }} />,
                                color: COLORS.amber,
                                onClick: () => handleReject(org.id),
                              },
                            ]} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </SCard>
              </Grid>
            )}

            {/* Tableau tous les organisateurs avec Dropdown */}
            <Grid xs={12}>
              <SCard>
                <CardContent sx={{ p: '20px 24px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Tous les organisateurs</Typography>
                    <TextField 
                      placeholder="Rechercher..." 
                      size="small" 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)}
                      sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: alpha(COLORS.navy, 0.5) }} /></InputAdornment>,
                        sx: { '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } }
                      }} 
                    />
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Agence', 'Contact', 'Email', 'Pays', 'Statut', 'Actions'].map(h => (
                            <TableCell key={h} sx={{ fontSize: 11, fontWeight: 700, color: alpha(COLORS.navy, 0.6), textTransform: 'uppercase', letterSpacing: '0.06em', py: 1, borderBottom: `2px solid ${alpha(COLORS.teal, 0.2)}` }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrgs.map(org => {
                          const sc = org.status === 'APPROVED' 
                            ? { label: 'Approuvé', color: COLORS.teal, bg: alpha(COLORS.teal, 0.08) }
                            : org.status === 'PENDING' 
                              ? { label: 'En attente', color: COLORS.amber, bg: alpha(COLORS.amber, 0.08) }
                              : { label: 'Bloqué', color: COLORS.navy, bg: alpha(COLORS.navy, 0.08) };
                          return (
                            <TableRow key={org.id} sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover td': { bgcolor: alpha(COLORS.teal, 0.015) } }}>
                              <TableCell sx={{ py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 30, height: 30, bgcolor: COLORS.navy, fontSize: 12, fontWeight: 700, color: COLORS.white }}>{org.agency_name?.[0]}</Avatar>
                                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{org.agency_name}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.7), py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>{org.user?.first_name} {org.user?.last_name}</TableCell>
                              <TableCell sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.7), py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>{org.user?.email}</TableCell>
                              <TableCell sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.7), py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>{org.country || '—'}</TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>
                                <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: 11, height: 22, borderRadius: 6 }} />
                              </TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: alpha(COLORS.teal, 0.1) }}>
                                {/* ─── Dropdown Menu ─── */}
                                <ActionMenu actions={[
                                  {
                                    label: 'Voir détails',
                                    icon: <ArrowForward sx={{ fontSize: 15 }} />,
                                    onClick: () => navigate(`/admin/organizers/${org.id}`),
                                  },
                                  ...(org.status !== 'APPROVED' ? [{
                                    label: 'Approuver',
                                    icon: <CheckCircle sx={{ fontSize: 15 }} />,
                                    color: COLORS.teal,
                                    onClick: () => handleApprove(org.id),
                                  }] : []),
                                  ...(org.status === 'PENDING' ? [{
                                    label: 'Rejeter',
                                    icon: <ThumbDown sx={{ fontSize: 15 }} />,
                                    color: COLORS.amber,
                                    onClick: () => handleReject(org.id),
                                  }] : []),
                                  ...(org.status !== 'BLOCKED' ? [{
                                    label: 'Bloquer',
                                    icon: <Block sx={{ fontSize: 15 }} />,
                                    color: '#DC2626',
                                    onClick: () => handleBlock(org.id),
                                  }] : []),
                                ]} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

        {/* ─── TAB 1 — INSIGHTS ────────────────────────────────── */}
        {tabValue === 1 && (
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Public sx={{ fontSize: 18, color: COLORS.teal }} />
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Destinations populaires</Typography>
                  </Box>
                  {detailedStats?.topDestinations?.length > 0 ? (
                    detailedStats.topDestinations.map((d: any, i: number) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2, borderBottom: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 24, height: 24, borderRadius: 6, bgcolor: alpha(COLORS.teal, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.teal }}>{i + 1}</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{d.destination}</Typography>
                            <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>{d.country}</Typography>
                          </Box>
                        </Box>
                        <Chip label={`${d.tripCount} voyages`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, borderRadius: 6 }} />
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6), textAlign: 'center', py: 3 }}>Aucune donnée</Typography>
                  )}
                </CardContent>
              </SCard>
            </Grid>
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <EmojiEvents sx={{ fontSize: 18, color: COLORS.amber }} />
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Top organisateurs</Typography>
                  </Box>
                  {detailedStats?.topOrganizers?.length > 0 ? (
                    detailedStats.topOrganizers.map((o: any, i: number) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2, borderBottom: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: i === 0 ? COLORS.amber : i === 1 ? alpha(COLORS.navy, 0.7) : COLORS.teal, fontSize: 12, color: COLORS.white }}>
                            {o.organizer?.[0]}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{o.organizer}</Typography>
                            <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>{o.bookings} réservations</Typography>
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: COLORS.teal }}>{o.revenue.toFixed(0)} EUR</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6), textAlign: 'center', py: 3 }}>Aucune donnée</Typography>
                  )}
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

        {/* ─── TAB 2 — FINANCIER (données réelles) ──────────────── */}
        {tabValue === 2 && (
          <Grid container spacing={2}>
            {[
              { label: 'Revenu total (payments)', value: `${(financialData?.totalRevenue || 0).toFixed(0)} EUR`, color: COLORS.teal, icon: <AttachMoney />, sub: 'Somme des payments SUCCEEDED' },
              { label: 'Commission plateforme', value: `${(financialData?.totalCommission || 0).toFixed(0)} EUR`, color: COLORS.navy, icon: <AccountBalance />, sub: 'Depuis payments.platform_fee' },
              { label: 'Payouts organisateurs', value: `${(financialData?.organizerPayouts || 0).toFixed(0)} EUR`, color: COLORS.amber, icon: <Business />, sub: 'Total — Commission' },
              { label: 'Taux commission', value: `${financialData?.commissionRate || 10}%`, color: COLORS.teal, icon: <ShowChart />, sub: 'Taux appliqué' },
            ].map((item, i) => (
              <Grid xs={12} sm={6} md={3} key={i}>
                <SCard>
                  <CardContent sx={{ p: '22px 24px !important' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 10, bgcolor: alpha(item.color, 0.1), color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, color: item.color, lineHeight: 1, mb: 0.5 }}>{item.value}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: alpha(COLORS.navy, 0.8) }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5) }}>{item.sub}</Typography>
                  </CardContent>
                </SCard>
              </Grid>
            ))}

            {/* ─── Commission par organisateur — données réelles ─── */}
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <AccountBalance sx={{ fontSize: 18, color: COLORS.teal }} />
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Commission par organisateur</Typography>
                      <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5) }}>Depuis payments.platform_fee (réel)</Typography>
                    </Box>
                  </Box>
                  {commissionByOrganizer.length > 0 ? (
                    commissionByOrganizer.slice(0, 6).map((org: any, i: number) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2, borderBottom: `1px solid ${alpha(COLORS.teal, 0.08)}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 26, height: 26, bgcolor: alpha(COLORS.teal, 0.15), fontSize: 11, color: COLORS.teal, fontWeight: 700 }}>{org.name?.[0]}</Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{org.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5) }}>{org.bookings} réservations — {org.revenue?.toFixed(0)} EUR total</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 800, color: COLORS.teal }}>{org.commission?.toFixed(0)} EUR</Typography>
                          <Typography sx={{ fontSize: 10, color: alpha(COLORS.navy, 0.5) }}>commission</Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.5), textAlign: 'center', py: 4 }}>
                      Aucune commission enregistrée (payments SUCCEEDED vides)
                    </Typography>
                  )}
                </CardContent>
              </SCard>
            </Grid>

            {/* ─── Évolution revenus réels ─── */}
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, mb: 0.5 }}>Évolution mensuelle des revenus</Typography>
                  <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5), mb: 2 }}>Données réelles — bookings CONFIRMED/COMPLETED</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={alpha(COLORS.navy, 0.08)} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} tickFormatter={v => v >= 1000 ? `${v/1000}k` : v} />
                      <RTooltip content={<CTooltip />} cursor={{ fill: alpha(COLORS.teal, 0.05) }} />
                      <Bar dataKey="revenue" name="Revenus (EUR)" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

        {/* ─── TAB 3 — CONTENU (sans Description) ─────────────── */}
        {tabValue === 3 && (
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category sx={{ fontSize: 18, color: COLORS.teal }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>
                        Catégories <Typography component="span" sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6) }}>({categories.length})</Typography>
                      </Typography>
                    </Box>
                    <Button size="small" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={() => { setCreateType('category'); setCreateDialog(true); }} sx={{ bgcolor: COLORS.teal, color: COLORS.white, borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 600, py: 0.6, '&:hover': { bgcolor: alpha(COLORS.teal, 0.85) } }}>
                      Ajouter
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 400, overflowY: 'auto' }}>
                    {categories.map(cat => (
                      <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '10px 14px', borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.1)}`, '&:hover': { borderColor: alpha(COLORS.teal, 0.4) } }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 8, bgcolor: alpha(COLORS.teal, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Category sx={{ fontSize: 15, color: COLORS.teal }} />
                        </Box>
                        {/* ─── Nom seulement, pas de description ─── */}
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, flex: 1 }}>{cat.name}</Typography>
                        <IconButton size="small" onClick={() => { setEditCat({ ...cat }); setEditType('category'); setEditDialog(true); }} sx={{ color: COLORS.teal }}>
                          <Edit sx={{ fontSize: 15 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteCat(cat.id)} sx={{ color: COLORS.amber }}>
                          <Delete sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Box>
                    ))}
                    {!categories.length && <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6), textAlign: 'center', py: 3 }}>Aucune catégorie</Typography>}
                  </Box>
                </CardContent>
              </SCard>
            </Grid>
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Public sx={{ fontSize: 18, color: COLORS.navy }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>
                        Destinations <Typography component="span" sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.6) }}>({destinations.length})</Typography>
                      </Typography>
                    </Box>
                    <Button size="small" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={() => { setCreateType('destination'); setCreateDialog(true); }} sx={{ bgcolor: COLORS.navy, color: COLORS.white, borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 600, py: 0.6, '&:hover': { bgcolor: alpha(COLORS.navy, 0.85) } }}>
                      Ajouter
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 400, overflowY: 'auto' }}>
                    {destinations.map(dest => (
                      <Box key={dest.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '10px 14px', borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.1)}`, '&:hover': { borderColor: alpha(COLORS.navy, 0.3) } }}>
                        <Avatar src={dest.image} sx={{ width: 36, height: 36, bgcolor: COLORS.navy, fontSize: 13, color: COLORS.white }}>
                          <Place sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{dest.name}</Typography>
                          <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>{dest.country}{dest.region ? ` — ${dest.region}` : ''}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => { setEditDest({ ...dest }); setEditDestFile(null); setEditType('destination'); setEditDialog(true); }} sx={{ color: COLORS.teal }}>
                          <Edit sx={{ fontSize: 15 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteDest(dest.id)} sx={{ color: COLORS.amber }}>
                          <Delete sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Box>
                    ))}
                    {!destinations.length && <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6), textAlign: 'center', py: 3 }}>Aucune destination</Typography>}
                  </Box>
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

        {/* ─── TAB 4 — AVIS SIGNALÉS avec Dropdown ─────────────── */}
        {tabValue === 4 && (
          <Grid container spacing={2}>
            <Grid xs={12}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 9, bgcolor: alpha('#DC2626', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Flag sx={{ fontSize: 18, color: '#DC2626' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Avis signalés par les organisateurs</Typography>
                      <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5) }}>
                        {flaggedReviews.length} avis en attente de traitement
                      </Typography>
                    </Box>
                  </Box>

                  {flaggedReviews.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <StarBorder sx={{ fontSize: 48, color: alpha(COLORS.teal, 0.3), mb: 1 }} />
                      <Typography sx={{ fontSize: 14, color: alpha(COLORS.navy, 0.5) }}>
                        Aucun avis signalé — tout est en ordre !
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['Auteur', 'Voyage', 'Note', 'Commentaire', 'Raison du signalement', 'Date', 'Actions'].map(h => (
                              <TableCell key={h} sx={{ fontSize: 11, fontWeight: 700, color: alpha(COLORS.navy, 0.6), textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.2, borderBottom: `2px solid ${alpha('#DC2626', 0.15)}` }}>
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {flaggedReviews.map((r: any) => (
                            <TableRow key={r.id} sx={{ bgcolor: alpha('#DC2626', 0.015), '&:last-child td': { borderBottom: 0 }, '&:hover td': { bgcolor: alpha('#DC2626', 0.03) } }}>
                              <TableCell sx={{ py: 1.5, borderColor: alpha(COLORS.teal, 0.08) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 28, height: 28, bgcolor: COLORS.navy, fontSize: 11, color: COLORS.white }}>
                                    {r.user?.first_name?.[0]}{r.user?.last_name?.[0]}
                                  </Avatar>
                                  <Box>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: COLORS.navy }}>
                                      {r.user?.first_name} {r.user?.last_name}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5) }}>{r.user?.email}</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: 12, color: COLORS.teal, fontWeight: 600, py: 1.5, borderColor: alpha(COLORS.teal, 0.08), maxWidth: 160 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: COLORS.teal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {r.trip?.title || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, borderColor: alpha(COLORS.teal, 0.08) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                  <EmojiEvents sx={{ fontSize: 13, color: COLORS.amber }} />
                                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.amber }}>{r.rating}/5</Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, borderColor: alpha(COLORS.teal, 0.08), maxWidth: 220 }}>
                                <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.7), overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                  {r.comment || <em style={{ color: alpha(COLORS.navy as string, 0.4) }}>Aucun commentaire</em>}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, borderColor: alpha(COLORS.teal, 0.08), maxWidth: 200 }}>
                                <Box sx={{ p: '6px 10px', borderRadius: 6, bgcolor: alpha('#DC2626', 0.08), border: `1px solid ${alpha('#DC2626', 0.2)}` }}>
                                  <Typography sx={{ fontSize: 11, color: '#DC2626', fontStyle: 'italic' }}>
                                    {r.flag_reason || 'Contenu inapproprié'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5), py: 1.5, borderColor: alpha(COLORS.teal, 0.08), whiteSpace: 'nowrap' }}>
                                {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </TableCell>
                              <TableCell sx={{ py: 1.5, borderColor: alpha(COLORS.teal, 0.08) }}>
                                {/* ─── Dropdown Menu pour avis signalé ─── */}
                                <ActionMenu actions={[
                                  {
                                    label: 'Supprimer l\'avis',
                                    icon: <Delete sx={{ fontSize: 15 }} />,
                                    color: '#DC2626',
                                    onClick: () => handleDeleteReview(r.id),
                                  },
                                  {
                                    label: 'Ignorer le signalement',
                                    icon: <CheckCircle sx={{ fontSize: 15 }} />,
                                    color: COLORS.teal,
                                    onClick: () => handleUnflagReview(r.id),
                                  },
                                ]} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

      </Box>

      {/* ─── DIALOG CRÉER ─── */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.2)}`, boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.15)}` } }}>
        <DialogTitle sx={{ fontWeight: 700, color: COLORS.navy, pb: 1, fontSize: '1.2rem' }}>
          {createType === 'category' ? 'Nouvelle catégorie' : 'Nouvelle destination'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createType === 'category' ? (
              // ─── Catégorie : Nom seulement (pas de description) ───
              <TextField 
                size="small" 
                label="Nom *" 
                fullWidth 
                value={newCat.name} 
                onChange={e => setNewCat({ name: e.target.value })} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
              />
            ) : (
              <>
                <TextField 
                  size="small" 
                  label="Nom *" 
                  fullWidth 
                  value={newDest.name} 
                  onChange={e => setNewDest({ ...newDest, name: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
                <TextField 
                  size="small" 
                  label="Pays *" 
                  fullWidth 
                  value={newDest.country} 
                  onChange={e => setNewDest({ ...newDest, country: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
                <TextField 
                  size="small" 
                  label="Région" 
                  fullWidth 
                  value={newDest.region} 
                  onChange={e => setNewDest({ ...newDest, region: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
                <Button 
                  component="label" 
                  variant="outlined" 
                  startIcon={<CloudUpload sx={{ fontSize: 16 }} />} 
                  size="small" 
                  sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(COLORS.teal, 0.4), color: COLORS.teal, fontSize: 12, '&:hover': { borderColor: COLORS.teal, bgcolor: alpha(COLORS.teal, 0.05) } }}
                >
                  {newDestFile ? `✓ ${newDestFile.name}` : 'Télécharger une image'}
                  <input type="file" hidden accept="image/*" onChange={e => { if (e.target.files?.[0]) setNewDestFile(e.target.files[0]); }} />
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setCreateDialog(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(COLORS.navy, 0.3), color: alpha(COLORS.navy, 0.7) }}>
            Annuler
          </Button>
          <Button onClick={createType === 'category' ? handleCreateCat : handleCreateDest} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: COLORS.teal, fontWeight: 600, '&:hover': { bgcolor: alpha(COLORS.teal, 0.85) } }}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── DIALOG MODIFIER ─── */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.2)}`, boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.15)}` } }}>
        <DialogTitle sx={{ fontWeight: 700, color: COLORS.navy, pb: 1, fontSize: '1.2rem' }}>
          {editType === 'category' ? 'Modifier catégorie' : 'Modifier destination'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editType === 'category' ? (
              <TextField 
                size="small" 
                label="Nom" 
                fullWidth 
                value={editCat?.name || ''} 
                onChange={e => setEditCat({ ...editCat, name: e.target.value })} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
              />
            ) : (
              <>
                <TextField 
                  size="small" 
                  label="Nom" 
                  fullWidth 
                  value={editDest?.name || ''} 
                  onChange={e => setEditDest({ ...editDest, name: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
                <TextField 
                  size="small" 
                  label="Pays" 
                  fullWidth 
                  value={editDest?.country || ''} 
                  onChange={e => setEditDest({ ...editDest, country: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
                <TextField 
                  size="small" 
                  label="Région" 
                  fullWidth 
                  value={editDest?.region || ''} 
                  onChange={e => setEditDest({ ...editDest, region: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
                <Button 
                  component="label" 
                  variant="outlined" 
                  startIcon={<CloudUpload sx={{ fontSize: 16 }} />} 
                  size="small" 
                  sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(COLORS.teal, 0.4), color: COLORS.teal, fontSize: 12, '&:hover': { borderColor: COLORS.teal, bgcolor: alpha(COLORS.teal, 0.05) } }}
                >
                  {editDestFile ? `✓ ${editDestFile.name}` : 'Changer l\'image'}
                  <input type="file" hidden accept="image/*" onChange={e => { if (e.target.files?.[0]) setEditDestFile(e.target.files[0]); }} />
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(COLORS.navy, 0.3), color: alpha(COLORS.navy, 0.7) }}>
            Annuler
          </Button>
          <Button onClick={editType === 'category' ? handleUpdateCat : handleUpdateDest} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: COLORS.teal, fontWeight: 600, '&:hover': { bgcolor: alpha(COLORS.teal, 0.85) } }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default AdminDashboard;