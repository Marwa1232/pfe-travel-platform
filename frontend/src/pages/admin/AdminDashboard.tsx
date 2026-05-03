import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Card, CardContent, Paper, CircularProgress,
  Button, Chip, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  TextField, InputAdornment, Tab, Tabs, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Stack, LinearProgress,
  Divider, Select, MenuItem as MItem, FormControl,
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

// Mock data
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui'];
const monthlyMock = MONTHS.map((m, i) => ({
  month: m,
  revenue:  [8400, 12000, 9600, 18000, 15600, 21000][i],
  bookings: [12, 18, 14, 27, 23, 31][i],
  users:    [8, 15, 10, 22, 18, 26][i],
}));
const weeklyMock = ['L','M','M','J','V','S','D'].map((d, i) => ({
  d, bookings: [4, 7, 3, 9, 6, 11, 5][i],
}));

// Visitors data
const visitorsData = {
  Monthly: { total: 2548, items: [
    { name: 'Desktop', value: 65, color: COLORS.navy },
    { name: 'Tablet',  value: 34, color: COLORS.teal },
    { name: 'Mobile',  value: 45, color: COLORS.amber },
    { name: 'Unknown', value: 12, color: alpha(COLORS.navy, 0.3) },
  ]},
  Weekly: { total: 641, items: [
    { name: 'Desktop', value: 58, color: COLORS.navy },
    { name: 'Tablet',  value: 28, color: COLORS.teal },
    { name: 'Mobile',  value: 52, color: COLORS.amber },
    { name: 'Unknown', value: 8,  color: alpha(COLORS.navy, 0.3) },
  ]},
  Daily: { total: 93, items: [
    { name: 'Desktop', value: 62, color: COLORS.navy },
    { name: 'Tablet',  value: 31, color: COLORS.teal },
    { name: 'Mobile',  value: 48, color: COLORS.amber },
    { name: 'Unknown', value: 11, color: alpha(COLORS.navy, 0.3) },
  ]},
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visitPeriod, setVisitPeriod] = useState<'Monthly'|'Weekly'|'Daily'>('Monthly');

  const [stats, setStats] = useState<any>({
    totalUsers: 0, totalOrganizers: 0, totalTrips: 0, totalRevenue: 0,
    pendingOrganizers: 0, completedBookings: 0, pendingBookings: 0,
    cancelledBookings: 0, conversionRate: 0,
  });
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);

  const [createDialog, setCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<'category'|'destination'>('category');
  const [editDialog, setEditDialog] = useState(false);
  const [editType, setEditType] = useState<'category'|'destination'>('category');
  const [newCat, setNewCat] = useState({ name: '', description: '' });
  const [newDest, setNewDest] = useState({ name: '', country: '', region: '' });
  const [newDestFile, setNewDestFile] = useState<File|null>(null);
  const [editCat, setEditCat] = useState<any>(null);
  const [editDest, setEditDest] = useState<any>(null);
  const [editDestFile, setEditDestFile] = useState<File|null>(null);

  useEffect(() => {
    if (!token || !user?.roles?.includes('ROLE_ADMIN')) { navigate('/dashboard'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.allSettled([
      adminAPI.getStats().then(r => setStats(r.data)).catch(() => {}),
      adminAPI.getDetailedStats().then(r => setDetailedStats(r.data)).catch(() => {}),
      adminAPI.getFinancialStats().then(r => setFinancialData(r.data)).catch(() => {}),
      adminAPI.getSystemHealth().then(r => setSystemHealth(r.data)).catch(() => {}),
      adminAPI.getOrganizers().then(r => setOrganizers(r.data)).catch(() => {}),
      adminAPI.getCategories().then(r => setCategories(r.data)).catch(() => {}),
      adminAPI.getDestinations().then(r => setDestinations(r.data)).catch(() => {}),
    ]);
    setLoading(false);
  };

  const refresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); };

  const handleApprove = async (id: number) => {
    await adminAPI.approveOrganizer(id).catch(() => {});
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
  const handleCreateCat = async () => {
    if (!newCat.name) return;
    await adminAPI.createCategory(newCat);
    setNewCat({ name: '', description: '' });
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
    await adminAPI.updateCategory(editCat.id, editCat);
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

  const vd = visitorsData[visitPeriod];

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

        {/* KPI CARDS */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Utilisateurs',   value: stats.totalUsers,      sub: 'Comptes inscrits',           color: COLORS.navy, icon: <People />,       trend: 8 },
            { label: 'Organisateurs',  value: stats.totalOrganizers, sub: `${stats.pendingOrganizers} en attente`, color: COLORS.amber, icon: <Business />,    trend: 5 },
            { label: 'Voyages actifs', value: stats.totalTrips,      sub: 'Sur la plateforme',          color: COLORS.teal, icon: <FlightTakeoff />, trend: 12 },
            { label: 'Revenus',        value: `${(stats.totalRevenue || 0).toLocaleString('fr-TN')} TND`, sub: 'Total cumulé', color: COLORS.teal, icon: <AttachMoney />, trend: -2 },
          ].map((item, i) => (
            <Grid xs={12} sm={6} lg={3} key={i}>
              <GlowCard color={item.color} sx={{ animation: `${fadeUp} 0.4s ease ${i * 0.08}s both` }}>
                <CardContent sx={{ p: '20px 22px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 10, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.white }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, bgcolor: 'rgba(255,255,255,0.15)', px: 1, py: 0.4, borderRadius: 8 }}>
                      {item.trend >= 0 ? <TrendingUp sx={{ fontSize: 12, color: COLORS.white }} /> : <TrendingDown sx={{ fontSize: 12, color: COLORS.white }} />}
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.white }}>{item.trend >= 0 ? '+' : ''}{item.trend}%</Typography>
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

        {/* CHARTS ROW 1 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} lg={8}>
            <SCard sx={{ animation: `${fadeUp} 0.4s ease 0.2s both` }}>
              <CardContent sx={{ p: '22px 24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Revenus & Réservations</Typography>
                    <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5) }}>Évolution sur 6 mois</Typography>
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
                  <AreaChart data={monthlyMock} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} tickFormatter={v => `${v/1000}k`} />
                    <RTooltip content={<CTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenus (TND)" stroke={COLORS.teal} strokeWidth={2.5} fill="url(#gT)" dot={{ fill: COLORS.teal, r: 3.5 }} activeDot={{ r: 5.5 }} />
                    <Area type="monotone" dataKey="bookings" name="Réservations" stroke={COLORS.navy} strokeWidth={1.8} strokeDasharray="4 4" fill="url(#gN)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </SCard>
          </Grid>

          <Grid xs={12} lg={4}>
            <SCard sx={{ height: '100%', animation: `${fadeUp} 0.4s ease 0.25s both` }}>
              <CardContent sx={{ p: '22px 24px !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Visitors Analytics</Typography>
                  <FormControl size="small">
                    <Select
                      value={visitPeriod}
                      onChange={e => setVisitPeriod(e.target.value as any)}
                      sx={{ fontSize: 12, height: 30, borderRadius: 1.5, '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(COLORS.teal, 0.3) } }}
                    >
                      <MItem value="Monthly" sx={{ fontSize: 12 }}>Mensuel</MItem>
                      <MItem value="Weekly" sx={{ fontSize: 12 }}>Hebdo</MItem>
                      <MItem value="Daily" sx={{ fontSize: 12 }}>Journalier</MItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', my: 1 }}>
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={vd.items} cx="50%" cy="50%" innerRadius={56} outerRadius={90} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                        {vd.items.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, color: COLORS.navy, lineHeight: 1 }}>{vd.total.toLocaleString()}</Typography>
                    <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5) }}>Visiteurs</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 'auto' }}>
                  <Grid container spacing={1}>
                    {vd.items.map(item => (
                      <Grid xs={6} key={item.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.7) }}>{item.name}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS.navy, ml: 'auto' }}>{item.value}%</Typography>
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
                <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5), mb: 2 }}>7 derniers jours</Typography>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={weeklyMock} barSize={22} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <CartesianGrid stroke={alpha(COLORS.navy, 0.08)} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                    <RTooltip content={<CTooltip />} cursor={{ fill: alpha(COLORS.teal, 0.05) }} />
                    <Bar dataKey="bookings" name="Réservations" radius={[4, 4, 0, 0]}>
                      {weeklyMock.map((_, i) => <Cell key={i} fill={i === 5 ? COLORS.teal : alpha(COLORS.teal, 0.25)} />)}
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
                <Typography sx={{ fontSize: 12, color: alpha(COLORS.navy, 0.5), mb: 2 }}>6 derniers mois</Typography>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={monthlyMock} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
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
            <StyledTab icon={<Speed sx={{ fontSize: 15 }} />} iconPosition="start" label="Système" />
          </Tabs>
        </SCard>

        {/* TAB 0 — MODÉRATION */}
        {tabValue === 0 && (
          <Grid container spacing={2}>
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
                            <Tooltip title="Détails">
                              <IconButton size="small" onClick={() => navigate(`/admin/organizers/${org.id}`)} sx={{ color: COLORS.teal }}>
                                <ArrowForward sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Approuver">
                              <IconButton size="small" onClick={() => handleApprove(org.id)} sx={{ color: COLORS.teal, bgcolor: alpha(COLORS.teal, 0.08) }}>
                                <CheckCircle sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Rejeter">
                              <IconButton size="small" onClick={() => handleBlock(org.id)} sx={{ color: COLORS.amber, bgcolor: alpha(COLORS.amber, 0.08) }}>
                                <Block sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </SCard>
              </Grid>
            )}
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
                                <Box sx={{ display: 'flex', gap: 0.3 }}>
                                  <Tooltip title="Détails">
                                    <IconButton size="small" onClick={() => navigate(`/admin/organizers/${org.id}`)} sx={{ color: COLORS.teal }}>
                                      <ArrowForward sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                  {org.status !== 'APPROVED' && (
                                    <Tooltip title="Approuver">
                                      <IconButton size="small" onClick={() => handleApprove(org.id)} sx={{ color: COLORS.teal }}>
                                        <CheckCircle sx={{ fontSize: 15 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {org.status !== 'BLOCKED' && (
                                    <Tooltip title="Bloquer">
                                      <IconButton size="small" onClick={() => handleBlock(org.id)} sx={{ color: COLORS.amber }}>
                                        <Block sx={{ fontSize: 15 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
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

        {/* TAB 1 — INSIGHTS */}
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
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: COLORS.teal }}>{o.revenue.toFixed(0)} TND</Typography>
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

        {/* TAB 2 — FINANCIER */}
        {tabValue === 2 && (
          <Grid container spacing={2}>
            {[
              { label: 'Revenu total', value: `${(financialData?.totalRevenue || 0).toFixed(0)} TND`, color: COLORS.teal, icon: <AttachMoney /> },
              { label: 'Commission plateforme', value: `${(financialData?.totalCommission || 0).toFixed(0)} TND`, color: COLORS.navy, icon: <AccountBalance /> },
              { label: 'Payouts organisateurs', value: `${(financialData?.organizerPayouts || 0).toFixed(0)} TND`, color: COLORS.amber, icon: <Business /> },
              { label: 'Payouts en attente', value: financialData?.pendingPayouts || 0, color: COLORS.amber, icon: <HourglassEmpty /> },
            ].map((item, i) => (
              <Grid xs={12} sm={6} md={3} key={i}>
                <SCard>
                  <CardContent sx={{ p: '22px 24px !important' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 10, bgcolor: alpha(item.color, 0.1), color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, color: item.color, lineHeight: 1, mb: 0.5 }}>{item.value}</Typography>
                    <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6) }}>{item.label}</Typography>
                  </CardContent>
                </SCard>
              </Grid>
            ))}
            <Grid xs={12}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, mb: 2 }}>Évolution mensuelle des revenus</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyMock} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={alpha(COLORS.navy, 0.08)} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: alpha(COLORS.navy, 0.6) }} tickFormatter={v => `${v/1000}k`} />
                      <RTooltip content={<CTooltip />} cursor={{ fill: alpha(COLORS.teal, 0.05) }} />
                      <Bar dataKey="revenue" name="Revenus (TND)" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

        {/* TAB 3 — CONTENU */}
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
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{cat.name}</Typography>
                          {cat.description && <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</Typography>}
                        </Box>
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

        {/* TAB 4 — SYSTÈME */}
        {tabValue === 4 && (
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important', textAlign: 'center' }}>
                  <Box sx={{ width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 2, bgcolor: systemHealth?.status === 'operational' ? alpha(COLORS.teal, 0.1) : alpha(COLORS.amber, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {systemHealth?.status === 'operational' 
                      ? <CheckCircle sx={{ fontSize: 36, color: COLORS.teal }} /> 
                      : <Warning sx={{ fontSize: 36, color: COLORS.amber }} />
                    }
                  </Box>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: COLORS.navy, mb: 0.5 }}>
                    {systemHealth?.status === 'operational' ? '✅ Système OK' : '⚠️ Service dégradé'}
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: alpha(COLORS.teal, 0.15) }} />
                  <Grid container spacing={1}>
                    <Grid xs={6}>
                      <Typography sx={{ fontSize: 20, fontWeight: 800, color: COLORS.amber }}>{systemHealth?.pending?.organizers || 0}</Typography>
                      <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>Orgs en attente</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography sx={{ fontSize: 20, fontWeight: 800, color: COLORS.teal }}>{systemHealth?.pending?.bookings || 0}</Typography>
                      <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>Réservations</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </SCard>
            </Grid>
            <Grid xs={12} md={8}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, mb: 2 }}>État des services</Typography>
                  {systemHealth?.services?.length > 0 ? (
                    <Grid container spacing={1.5}>
                      {systemHealth.services.map((s: any, i: number) => (
                        <Grid xs={12} sm={6} key={i}>
                          <Box sx={{ p: '12px 14px', borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{s.name}</Typography>
                              <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5) }}>{s.latency}ms</Typography>
                            </Box>
                            <Chip 
                              label={s.status === 'operational' ? 'Opérationnel' : 'Problème'} 
                              size="small" 
                              sx={{ 
                                height: 22, 
                                fontSize: 11, 
                                fontWeight: 700, 
                                bgcolor: s.status === 'operational' ? alpha(COLORS.teal, 0.1) : alpha(COLORS.amber, 0.1), 
                                color: s.status === 'operational' ? COLORS.teal : COLORS.amber,
                                borderRadius: 6,
                              }} 
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2, bgcolor: alpha(COLORS.teal, 0.05), color: COLORS.navy }}>
                      Aucun service à surveiller configuré
                    </Alert>
                  )}
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* DIALOG CRÉER */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 16, border: `1px solid ${alpha(COLORS.teal, 0.2)}`, boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.15)}` } }}>
        <DialogTitle sx={{ fontWeight: 700, color: COLORS.navy, pb: 1, fontSize: '1.2rem' }}>
          {createType === 'category' ? 'Nouvelle catégorie' : 'Nouvelle destination'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createType === 'category' ? (
              <>
                <TextField 
                  size="small" 
                  label="Nom *" 
                  fullWidth 
                  value={newCat.name} 
                  onChange={e => setNewCat({ ...newCat, name: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
                <TextField 
                  size="small" 
                  label="Description" 
                  fullWidth 
                  multiline 
                  rows={2} 
                  value={newCat.description} 
                  onChange={e => setNewCat({ ...newCat, description: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
              </>
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

      {/* DIALOG MODIFIER */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 16, border: `1px solid ${alpha(COLORS.teal, 0.2)}`, boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.15)}` } }}>
        <DialogTitle sx={{ fontWeight: 700, color: COLORS.navy, pb: 1, fontSize: '1.2rem' }}>
          {editType === 'category' ? 'Modifier catégorie' : 'Modifier destination'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editType === 'category' ? (
              <>
                <TextField 
                  size="small" 
                  label="Nom" 
                  fullWidth 
                  value={editCat?.name || ''} 
                  onChange={e => setEditCat({ ...editCat, name: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
                <TextField 
                  size="small" 
                  label="Description" 
                  fullWidth 
                  multiline 
                  rows={2} 
                  value={editCat?.description || ''} 
                  onChange={e => setEditCat({ ...editCat, description: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: COLORS.teal }, '&.Mui-focused fieldset': { borderColor: COLORS.teal } } }} 
                />
              </>
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