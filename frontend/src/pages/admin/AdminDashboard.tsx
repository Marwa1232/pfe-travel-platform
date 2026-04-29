// ═══════════════════════════════════════════════════════════════
//  src/pages/admin/AdminDashboard.tsx  — Version Pro
//  Changements:
//    ✅ Supprimé: Statut des réservations (donut)
//    ✅ Supprimé: Système OK card + Stats secondaires bar
//    ✅ Ajouté:   Visitors Analytics (donut Desktop/Tablet/Mobile)
// ═══════════════════════════════════════════════════════════════
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

// ─── Design tokens ────────────────────────────────────────────
const T = {
  teal:   '#0EA5A0',
  navy:   '#0F2D5C',
  slate:  '#64748B',
  ink:    '#0F172A',
  paper:  '#F1F5F9',
  white:  '#FFFFFF',
  border: '#E2E8F0',
  green:  '#16A34A',
  amber:  '#D97706',
  red:    '#DC2626',
  purple: '#7C3AED',
  blue:   '#2563EB',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

const Page    = styled(Box)({ minHeight: '100vh', backgroundColor: T.paper, padding: '28px 32px 64px' });
const SCard   = styled(Card)({ backgroundColor: T.white, borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: 'none', overflow: 'visible', transition: 'box-shadow 0.2s ease', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' } });
const GlowCard = styled(Card)(({ color }: { color: string }) => ({
  backgroundColor: color, borderRadius: 14, border: 'none',
  boxShadow: `0 8px 24px ${alpha(color, 0.35)}`, overflow: 'hidden', position: 'relative',
  '&::before': { content: '""', position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' },
  '&::after':  { content: '""', position: 'absolute', bottom: -30, right: 20, width: 140, height: 140, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' },
}));
const StyledTab = styled(Tab)({ textTransform: 'none', fontWeight: 500, fontSize: 13, color: T.slate, minHeight: 44, '&.Mui-selected': { color: T.teal, fontWeight: 700 } });

// ─── Custom Tooltip ───────────────────────────────────────────
const CTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: T.white, border: `1px solid ${T.border}`, borderRadius: 2, px: 1.5, py: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <Typography sx={{ fontSize: 11, color: T.slate, mb: 0.5, fontWeight: 600 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: T.ink }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── Mock data ────────────────────────────────────────────────
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

// ─── Visitors Analytics data ──────────────────────────────────
const visitorsData = {
  Monthly: {
    total: 2548,
    items: [
      { name: 'Desktop', value: 65, color: T.blue },
      { name: 'Tablet',  value: 34, color: T.teal },
      { name: 'Mobile',  value: 45, color: T.purple },
      { name: 'Unknown', value: 12, color: '#94A3B8' },
    ],
  },
  Weekly: {
    total: 641,
    items: [
      { name: 'Desktop', value: 58, color: T.blue },
      { name: 'Tablet',  value: 28, color: T.teal },
      { name: 'Mobile',  value: 52, color: T.purple },
      { name: 'Unknown', value: 8,  color: '#94A3B8' },
    ],
  },
  Daily: {
    total: 93,
    items: [
      { name: 'Desktop', value: 62, color: T.blue },
      { name: 'Tablet',  value: 31, color: T.teal },
      { name: 'Mobile',  value: 48, color: T.purple },
      { name: 'Unknown', value: 11, color: '#94A3B8' },
    ],
  },
};

// ─── Custom Donut Label ───────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue]     = useState(0);
  const [loading, setLoading]       = useState(true);
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
  const [systemHealth, setSystemHealth]   = useState<any>(null);
  const [organizers, setOrganizers]       = useState<any[]>([]);
  const [categories, setCategories]       = useState<any[]>([]);
  const [destinations, setDestinations]   = useState<any[]>([]);

  // Dialogs
  const [createDialog, setCreateDialog] = useState(false);
  const [createType, setCreateType]     = useState<'category'|'destination'>('category');
  const [editDialog, setEditDialog]     = useState(false);
  const [editType, setEditType]         = useState<'category'|'destination'>('category');
  const [newCat, setNewCat]             = useState({ name: '', description: '' });
  const [newDest, setNewDest]           = useState({ name: '', country: '', region: '' });
  const [newDestFile, setNewDestFile]   = useState<File|null>(null);
  const [editCat, setEditCat]           = useState<any>(null);
  const [editDest, setEditDest]         = useState<any>(null);
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
  const handleCreateCat = async () => {
    if (!newCat.name) return;
    await adminAPI.createCategory(newCat).catch(() => {});
    setNewCat({ name: '', description: '' }); setCreateDialog(false);
    adminAPI.getCategories().then(r => setCategories(r.data));
  };
  const handleCreateDest = async () => {
    if (!newDest.name) return;
    const payload = newDestFile
      ? (() => { const f = new FormData(); Object.entries(newDest).forEach(([k,v]) => f.append(k,v)); f.append('image', newDestFile); return f; })()
      : newDest;
    await adminAPI.createDestination(payload).catch(() => {});
    setNewDest({ name: '', country: '', region: '' }); setNewDestFile(null); setCreateDialog(false);
    adminAPI.getDestinations().then(r => setDestinations(r.data));
  };
  const handleUpdateCat = async () => {
    if (!editCat) return;
    await adminAPI.updateCategory(editCat.id, editCat).catch(() => {});
    setEditDialog(false); setEditCat(null);
    adminAPI.getCategories().then(r => setCategories(r.data));
  };
  const handleUpdateDest = async () => {
    if (!editDest) return;
    const payload = editDestFile
      ? (() => { const f = new FormData(); Object.entries(editDest).forEach(([k,v]) => f.append(k, String(v))); f.append('image', editDestFile); return f; })()
      : editDest;
    await adminAPI.updateDestination(editDest.id, payload).catch(() => {});
    setEditDialog(false); setEditDest(null); setEditDestFile(null);
    adminAPI.getDestinations().then(r => setDestinations(r.data));
  };
  const handleDeleteCat  = async (id: number) => { if (!window.confirm('Supprimer?')) return; await adminAPI.deleteCategory(id); adminAPI.getCategories().then(r => setCategories(r.data)); };
  const handleDeleteDest = async (id: number) => { if (!window.confirm('Supprimer?')) return; await adminAPI.deleteDestination(id); adminAPI.getDestinations().then(r => setDestinations(r.data)); };

  const pendingOrgs  = organizers.filter(o => o.status === 'PENDING');
  const filteredOrgs = organizers.filter(o =>
    o.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const orgStatusData = [
    { name: 'Approuvés',  value: organizers.filter(o => o.status === 'APPROVED').length, color: T.green },
    { name: 'En attente', value: organizers.filter(o => o.status === 'PENDING').length,  color: T.amber },
    { name: 'Bloqués',    value: organizers.filter(o => o.status === 'BLOCKED').length,  color: T.red },
  ];

  const vd = visitorsData[visitPeriod];

  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={40} thickness={3} sx={{ color: T.teal, mb: 2 }} />
        <Typography sx={{ fontSize: 14, color: T.slate }}>Chargement du panel admin…</Typography>
      </Box>
    </Box>
  );

  return (
    <Page>
      <Box maxWidth={1440} mx="auto">

        {/* ══ TOP BAR ═══════════════════════════════════════ */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, animation: `${fadeUp} 0.4s ease` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: `linear-gradient(135deg, ${T.teal}, ${T.navy})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(T.teal, 0.4)}` }}>
              <Shield sx={{ fontSize: 22, color: T.white }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: '-0.3px' }}>Administration</Typography>
              <Typography sx={{ fontSize: 12, color: T.slate }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {pendingOrgs.length > 0 && (
              <Button onClick={() => setTabValue(0)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: 12, bgcolor: alpha(T.amber, 0.1), color: T.amber, border: `1px solid ${alpha(T.amber, 0.3)}`, animation: `${pulse} 2s ease-in-out infinite`, '&:hover': { bgcolor: alpha(T.amber, 0.18) } }}>
                <HourglassEmpty sx={{ fontSize: 14, mr: 0.6 }} />
                {pendingOrgs.length} demande{pendingOrgs.length > 1 ? 's' : ''} en attente
              </Button>
            )}
            <Tooltip title="Actualiser">
              <IconButton onClick={refresh} disabled={refreshing} sx={{ bgcolor: T.white, border: `1px solid ${T.border}`, width: 38, height: 38 }}>
                {refreshing ? <CircularProgress size={16} sx={{ color: T.teal }} /> : <Refresh sx={{ fontSize: 18, color: T.slate }} />}
              </IconButton>
            </Tooltip>
            <Button onClick={() => navigate('/admin/users')} sx={{ borderRadius: 2, textTransform: 'none', bgcolor: T.navy, color: T.white, fontWeight: 600, fontSize: 13, px: 2, '&:hover': { bgcolor: '#0D2550' } }}>
              <People sx={{ fontSize: 16, mr: 0.8 }} />Utilisateurs
            </Button>
            <Button onClick={() => navigate('/admin/organizers')} sx={{ borderRadius: 2, textTransform: 'none', bgcolor: T.amber, color: T.white, fontWeight: 600, fontSize: 13, px: 2, '&:hover': { bgcolor: '#B45309' } }}>
              <Business sx={{ fontSize: 16, mr: 0.8 }} />Organisateurs
            </Button>
          </Box>
        </Box>

        {/* ══ KPI GLOWING CARDS ═════════════════════════════ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Utilisateurs',   value: stats.totalUsers,      sub: 'Comptes inscrits',           color: T.purple, icon: <People />,       trend: 8 },
            { label: 'Organisateurs',  value: stats.totalOrganizers, sub: `${stats.pendingOrganizers} en attente`, color: T.amber, icon: <Business />,    trend: 5 },
            { label: 'Voyages actifs', value: stats.totalTrips,      sub: 'Sur la plateforme',          color: T.teal,   icon: <FlightTakeoff />, trend: 12 },
            { label: 'Revenus',        value: `${(stats.totalRevenue || 0).toLocaleString('fr-TN')} TND`, sub: 'Total cumulé', color: T.green, icon: <AttachMoney />, trend: -2 },
          ].map((item, i) => (
            <Grid xs={12} sm={6} lg={3} key={i}>
              <GlowCard color={item.color} sx={{ animation: `${fadeUp} 0.4s ease ${i * 0.08}s both` }}>
                <CardContent sx={{ p: '20px 22px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white, '& svg': { fontSize: 22 } }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, bgcolor: 'rgba(255,255,255,0.15)', px: 1, py: 0.4, borderRadius: 10 }}>
                      {item.trend >= 0 ? <TrendingUp sx={{ fontSize: 13, color: T.white }} /> : <TrendingDown sx={{ fontSize: 13, color: T.white }} />}
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.white }}>{item.trend >= 0 ? '+' : ''}{item.trend}%</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, color: T.white, lineHeight: 1, mb: 0.5 }}>{item.value}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{item.sub}</Typography>
                </CardContent>
              </GlowCard>
            </Grid>
          ))}
        </Grid>

        {/* ══ CHARTS ROW 1: Area + Visitors Analytics ═══════ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>

          {/* Area chart — Revenue + Bookings */}
          <Grid xs={12} lg={8}>
            <SCard sx={{ animation: `${fadeUp} 0.4s ease 0.2s both` }}>
              <CardContent sx={{ p: '22px 24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Revenus & Réservations</Typography>
                    <Typography sx={{ fontSize: 12, color: T.slate }}>Évolution sur 6 mois</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[{ label: 'Revenus', color: T.teal }, { label: 'Réservations', color: T.navy, dash: true }].map(l => (
                      <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ width: 16, height: 2.5, bgcolor: (l as any).dash ? 'transparent' : l.color, borderRadius: 2, border: (l as any).dash ? `1.5px dashed ${l.color}` : 'none' }} />
                        <Typography sx={{ fontSize: 11, color: T.slate }}>{l.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={monthlyMock} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.teal} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={T.teal} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.navy} stopOpacity={0.1} />
                        <stop offset="100%" stopColor={T.navy} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} tickFormatter={v => `${v/1000}k`} />
                    <RTooltip content={<CTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenus (TND)" stroke={T.teal} strokeWidth={2.5} fill="url(#gT)" dot={{ fill: T.teal, r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5.5, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="bookings" name="Réservations" stroke={T.navy} strokeWidth={1.8} strokeDasharray="4 4" fill="url(#gN)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </SCard>
          </Grid>

          {/* ── Visitors Analytics ── */}
          <Grid xs={12} lg={4}>
            <SCard sx={{ height: '100%', animation: `${fadeUp} 0.4s ease 0.25s both` }}>
              <CardContent sx={{ p: '22px 24px !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Visitors Analytics</Typography>
                  <FormControl size="small">
                    <Select
                      value={visitPeriod}
                      onChange={e => setVisitPeriod(e.target.value as any)}
                      sx={{ fontSize: 12, height: 28, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border } }}
                    >
                      <MItem value="Monthly" sx={{ fontSize: 12 }}>Monthly</MItem>
                      <MItem value="Weekly"  sx={{ fontSize: 12 }}>Weekly</MItem>
                      <MItem value="Daily"   sx={{ fontSize: 12 }}>Daily</MItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Donut */}
                <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', my: 1 }}>
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={vd.items}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {vd.items.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Centre */}
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, color: T.ink, lineHeight: 1 }}>
                      {vd.total.toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: T.slate }}>Visitors</Typography>
                  </Box>
                </Box>

                {/* Legend items */}
                <Box sx={{ mt: 'auto' }}>
                  <Grid container spacing={1}>
                    {vd.items.map(item => (
                      <Grid xs={6} key={item.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 12, color: T.slate }}>{item.name}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.ink, ml: 'auto' }}>{item.value}%</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* ══ CHARTS ROW 2: Bar + Org donut + Users line ════ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} md={4}>
            <SCard sx={{ animation: `${fadeUp} 0.4s ease 0.3s both` }}>
              <CardContent sx={{ p: '22px 24px !important' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink, mb: 0.3 }}>Réservations / semaine</Typography>
                <Typography sx={{ fontSize: 12, color: T.slate, mb: 2 }}>7 derniers jours</Typography>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={weeklyMock} barSize={22} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                    <RTooltip content={<CTooltip />} cursor={{ fill: alpha(T.teal, 0.05) }} />
                    <Bar dataKey="bookings" name="Réservations" radius={[4, 4, 0, 0]}>
                      {weeklyMock.map((_, i) => <Cell key={i} fill={i === 5 ? T.teal : alpha(T.teal, 0.25)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </SCard>
          </Grid>

          <Grid xs={12} md={4}>
            <SCard sx={{ animation: `${fadeUp} 0.4s ease 0.35s both` }}>
              <CardContent sx={{ p: '22px 24px !important' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink, mb: 0.3 }}>Organisateurs</Typography>
                <Typography sx={{ fontSize: 12, color: T.slate, mb: 2 }}>Par statut</Typography>
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
                          <Typography sx={{ fontSize: 12, color: T.slate }}>{item.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{item.value}</Typography>
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
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink, mb: 0.3 }}>Nouveaux utilisateurs</Typography>
                <Typography sx={{ fontSize: 12, color: T.slate, mb: 2 }}>6 derniers mois</Typography>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={monthlyMock} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                    <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: T.slate }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: T.slate }} />
                    <RTooltip content={<CTooltip />} />
                    <Line type="monotone" dataKey="users" name="Users" stroke={T.purple} strokeWidth={2.5} dot={{ fill: T.purple, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* ══ TABS ══════════════════════════════════════════ */}
        <SCard sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: `1px solid ${T.border}`, '& .MuiTabs-indicator': { bgcolor: T.teal, height: 3, borderRadius: '3px 3px 0 0' } }}>
            <StyledTab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield sx={{ fontSize: 15 }} />
                Modération
                {pendingOrgs.length > 0 && (
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: T.amber, color: T.white, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* ══ TAB 0 — MODÉRATION ════════════════════════════ */}
        {tabValue === 0 && (
          <Grid container spacing={2}>
            {pendingOrgs.length > 0 && (
              <Grid xs={12}>
                <SCard sx={{ border: `1px solid ${alpha(T.amber, 0.3)}` }}>
                  <CardContent sx={{ p: '20px 24px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: T.amber, animation: `${pulse} 1.5s ease-in-out infinite` }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
                        {pendingOrgs.length} demande{pendingOrgs.length > 1 ? 's' : ''} en attente
                      </Typography>
                    </Box>
                    <Grid container spacing={1.5}>
                      {pendingOrgs.map(org => (
                        <Grid xs={12} sm={6} md={4} key={org.id}>
                          <Box sx={{ p: '12px 14px', borderRadius: 2, border: `1px solid ${alpha(T.amber, 0.25)}`, bgcolor: alpha(T.amber, 0.03), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 38, height: 38, bgcolor: T.navy, fontSize: 14, fontWeight: 700 }}>{org.agency_name?.[0]}</Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.agency_name}</Typography>
                              <Typography sx={{ fontSize: 11, color: T.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.user?.email}</Typography>
                            </Box>
                            <Tooltip title="Détails"><IconButton size="small" onClick={() => navigate(`/admin/organizers/${org.id}`)} sx={{ color: T.slate }}><ArrowForward sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                            <Tooltip title="Approuver"><IconButton size="small" onClick={() => handleApprove(org.id)} sx={{ color: T.green, bgcolor: alpha(T.green, 0.08) }}><CheckCircle sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                            <Tooltip title="Rejeter"><IconButton size="small" onClick={() => handleBlock(org.id)} sx={{ color: T.red, bgcolor: alpha(T.red, 0.08) }}><Block sx={{ fontSize: 16 }} /></IconButton></Tooltip>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Tous les organisateurs</Typography>
                    <TextField placeholder="Rechercher..." size="small" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: T.slate }} /></InputAdornment> }} />
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Agence', 'Contact', 'Email', 'Pays', 'Statut', 'Actions'].map(h => (
                            <TableCell key={h} sx={{ fontSize: 11, fontWeight: 700, color: T.slate, textTransform: 'uppercase', letterSpacing: '0.06em', py: 1, borderBottom: `2px solid ${T.border}` }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrgs.map(org => {
                          const sc = org.status === 'APPROVED' ? { label: 'Approuvé', color: T.green, bg: alpha(T.green, 0.08) }
                            : org.status === 'PENDING' ? { label: 'En attente', color: T.amber, bg: alpha(T.amber, 0.08) }
                            : { label: 'Bloqué', color: T.red, bg: alpha(T.red, 0.08) };
                          return (
                            <TableRow key={org.id} sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover td': { bgcolor: alpha(T.teal, 0.015) } }}>
                              <TableCell sx={{ py: 1.2, borderColor: T.border }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 30, height: 30, bgcolor: T.navy, fontSize: 12, fontWeight: 700 }}>{org.agency_name?.[0]}</Avatar>
                                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{org.agency_name}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: 12, color: T.slate, py: 1.2, borderColor: T.border }}>{org.user?.first_name} {org.user?.last_name}</TableCell>
                              <TableCell sx={{ fontSize: 12, color: T.slate, py: 1.2, borderColor: T.border }}>{org.user?.email}</TableCell>
                              <TableCell sx={{ fontSize: 12, color: T.slate, py: 1.2, borderColor: T.border }}>{org.country || '—'}</TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: T.border }}>
                                <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: 11, height: 22, borderRadius: '6px' }} />
                              </TableCell>
                              <TableCell sx={{ py: 1.2, borderColor: T.border }}>
                                <Box sx={{ display: 'flex', gap: 0.3 }}>
                                  <Tooltip title="Détails"><IconButton size="small" onClick={() => navigate(`/admin/organizers/${org.id}`)} sx={{ color: T.teal }}><ArrowForward sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                                  {org.status !== 'APPROVED' && <Tooltip title="Approuver"><IconButton size="small" onClick={() => handleApprove(org.id)} sx={{ color: T.green }}><CheckCircle sx={{ fontSize: 15 }} /></IconButton></Tooltip>}
                                  {org.status !== 'BLOCKED' && <Tooltip title="Bloquer"><IconButton size="small" onClick={() => handleBlock(org.id)} sx={{ color: T.red }}><Block sx={{ fontSize: 15 }} /></IconButton></Tooltip>}
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

        {/* ══ TAB 1 — INSIGHTS ══════════════════════════════ */}
        {tabValue === 1 && (
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}><Public sx={{ fontSize: 18, color: T.teal }} /><Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Destinations populaires</Typography></Box>
                  {detailedStats?.topDestinations?.length > 0 ? detailedStats.topDestinations.map((d: any, i: number) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2, borderBottom: `1px solid ${T.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: alpha(T.teal, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.teal }}>{i + 1}</Typography>
                        </Box>
                        <Box><Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{d.destination}</Typography><Typography sx={{ fontSize: 11, color: T.slate }}>{d.country}</Typography></Box>
                      </Box>
                      <Chip label={`${d.tripCount} voyages`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(T.teal, 0.1), color: T.teal }} />
                    </Box>
                  )) : <Typography sx={{ fontSize: 13, color: T.slate, textAlign: 'center', py: 3 }}>Aucune donnée</Typography>}
                </CardContent>
              </SCard>
            </Grid>
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}><EmojiEvents sx={{ fontSize: 18, color: T.amber }} /><Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Top organisateurs</Typography></Box>
                  {detailedStats?.topOrganizers?.length > 0 ? detailedStats.topOrganizers.map((o: any, i: number) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2, borderBottom: `1px solid ${T.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: [T.amber, T.slate, T.purple][i] || T.navy, fontSize: 12 }}>{o.organizer?.[0]}</Avatar>
                        <Box><Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{o.organizer}</Typography><Typography sx={{ fontSize: 11, color: T.slate }}>{o.bookings} réservations</Typography></Box>
                      </Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, color: T.teal }}>{o.revenue.toFixed(0)} TND</Typography>
                    </Box>
                  )) : <Typography sx={{ fontSize: 13, color: T.slate, textAlign: 'center', py: 3 }}>Aucune donnée</Typography>}
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

        {/* ══ TAB 2 — FINANCIER ═════════════════════════════ */}
        {tabValue === 2 && (
          <Grid container spacing={2}>
            {[
              { label: 'Revenu total',          value: `${(financialData?.totalRevenue || 0).toFixed(0)} TND`,     color: T.green,  icon: <AttachMoney /> },
              { label: 'Commission plateforme', value: `${(financialData?.totalCommission || 0).toFixed(0)} TND`,  color: T.teal,   icon: <AccountBalance /> },
              { label: 'Payouts organisateurs', value: `${(financialData?.organizerPayouts || 0).toFixed(0)} TND`, color: T.navy,   icon: <Business /> },
              { label: 'Payouts en attente',    value: financialData?.pendingPayouts || 0,                          color: T.amber,  icon: <HourglassEmpty /> },
            ].map((item, i) => (
              <Grid xs={12} sm={6} md={3} key={i}>
                <SCard>
                  <CardContent sx={{ p: '22px 24px !important' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(item.color, 0.1), color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, '& svg': { fontSize: 20 } }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, color: item.color, lineHeight: 1, mb: 0.5 }}>{item.value}</Typography>
                    <Typography sx={{ fontSize: 13, color: T.slate }}>{item.label}</Typography>
                  </CardContent>
                </SCard>
              </Grid>
            ))}
            <Grid xs={12}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink, mb: 2 }}>Évolution mensuelle des revenus</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyMock} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} tickFormatter={v => `${v/1000}k`} />
                      <RTooltip content={<CTooltip />} cursor={{ fill: alpha(T.teal, 0.05) }} />
                      <Bar dataKey="revenue" name="Revenus (TND)" fill={T.teal} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

        {/* ══ TAB 3 — CONTENU ═══════════════════════════════ */}
        {tabValue === 3 && (
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Category sx={{ fontSize: 18, color: T.teal }} /><Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Catégories <Typography component="span" sx={{ fontSize: 12, color: T.slate }}>({categories.length})</Typography></Typography></Box>
                    <Button size="small" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={() => { setCreateType('category'); setCreateDialog(true); }} sx={{ bgcolor: T.teal, color: T.white, borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 600, py: 0.6, '&:hover': { bgcolor: '#0c9490' } }}>Ajouter</Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 400, overflowY: 'auto' }}>
                    {categories.map(cat => (
                      <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '10px 14px', borderRadius: 2, border: `1px solid ${T.border}`, '&:hover': { borderColor: alpha(T.teal, 0.4) } }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(T.teal, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Category sx={{ fontSize: 15, color: T.teal }} /></Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{cat.name}</Typography>
                          {cat.description && <Typography sx={{ fontSize: 11, color: T.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</Typography>}
                        </Box>
                        <IconButton size="small" onClick={() => { setEditCat({ ...cat }); setEditType('category'); setEditDialog(true); }} sx={{ color: T.teal }}><Edit sx={{ fontSize: 15 }} /></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteCat(cat.id)} sx={{ color: T.red }}><Delete sx={{ fontSize: 15 }} /></IconButton>
                      </Box>
                    ))}
                    {!categories.length && <Typography sx={{ fontSize: 13, color: T.slate, textAlign: 'center', py: 3 }}>Aucune catégorie</Typography>}
                  </Box>
                </CardContent>
              </SCard>
            </Grid>
            <Grid xs={12} md={6}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Public sx={{ fontSize: 18, color: T.navy }} /><Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Destinations <Typography component="span" sx={{ fontSize: 12, color: T.slate }}>({destinations.length})</Typography></Typography></Box>
                    <Button size="small" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={() => { setCreateType('destination'); setCreateDialog(true); }} sx={{ bgcolor: T.navy, color: T.white, borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 600, py: 0.6, '&:hover': { bgcolor: '#0D2550' } }}>Ajouter</Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 400, overflowY: 'auto' }}>
                    {destinations.map(dest => (
                      <Box key={dest.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '10px 14px', borderRadius: 2, border: `1px solid ${T.border}`, '&:hover': { borderColor: alpha(T.navy, 0.3) } }}>
                        <Avatar src={dest.image} sx={{ width: 36, height: 36, bgcolor: T.navy, fontSize: 13 }}><Place sx={{ fontSize: 16 }} /></Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{dest.name}</Typography>
                          <Typography sx={{ fontSize: 11, color: T.slate }}>{dest.country}{dest.region ? ` — ${dest.region}` : ''}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => { setEditDest({ ...dest }); setEditDestFile(null); setEditType('destination'); setEditDialog(true); }} sx={{ color: T.teal }}><Edit sx={{ fontSize: 15 }} /></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteDest(dest.id)} sx={{ color: T.red }}><Delete sx={{ fontSize: 15 }} /></IconButton>
                      </Box>
                    ))}
                    {!destinations.length && <Typography sx={{ fontSize: 13, color: T.slate, textAlign: 'center', py: 3 }}>Aucune destination</Typography>}
                  </Box>
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}

        {/* ══ TAB 4 — SYSTÈME ═══════════════════════════════ */}
        {tabValue === 4 && (
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important', textAlign: 'center' }}>
                  <Box sx={{ width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 2, bgcolor: systemHealth?.status === 'operational' ? alpha(T.green, 0.1) : alpha(T.red, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {systemHealth?.status === 'operational' ? <CheckCircle sx={{ fontSize: 36, color: T.green }} /> : <Warning sx={{ fontSize: 36, color: T.red }} />}
                  </Box>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: T.ink, mb: 0.5 }}>
                    {systemHealth?.status === 'operational' ? '✅ Système OK' : '⚠️ Dégradé'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={1}>
                    <Grid xs={6}>
                      <Typography sx={{ fontSize: 20, fontWeight: 800, color: T.amber }}>{systemHealth?.pending?.organizers || 0}</Typography>
                      <Typography sx={{ fontSize: 11, color: T.slate }}>Orgs en attente</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography sx={{ fontSize: 20, fontWeight: 800, color: T.teal }}>{systemHealth?.pending?.bookings || 0}</Typography>
                      <Typography sx={{ fontSize: 11, color: T.slate }}>Réservations</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </SCard>
            </Grid>
            <Grid xs={12} md={8}>
              <SCard>
                <CardContent sx={{ p: '22px 24px !important' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink, mb: 2 }}>État des services</Typography>
                  {systemHealth?.services?.length > 0 ? (
                    <Grid container spacing={1.5}>
                      {systemHealth.services.map((s: any, i: number) => (
                        <Grid xs={12} sm={6} key={i}>
                          <Box sx={{ p: '12px 14px', borderRadius: 2, border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box><Typography sx={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{s.name}</Typography><Typography sx={{ fontSize: 11, color: T.slate }}>{s.latency}ms</Typography></Box>
                            <Chip label={s.status} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: s.status === 'operational' ? alpha(T.green, 0.1) : alpha(T.red, 0.1), color: s.status === 'operational' ? T.green : T.red }} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>Aucun service à surveiller configuré</Alert>
                  )}
                </CardContent>
              </SCard>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* ══ DIALOG CRÉER ══════════════════════════════════ */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${T.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: T.ink, pb: 1 }}>{createType === 'category' ? 'Nouvelle catégorie' : 'Nouvelle destination'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createType === 'category' ? (
              <>
                <TextField size="small" label="Nom *" fullWidth value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField size="small" label="Description" fullWidth multiline rows={2} value={newCat.description} onChange={e => setNewCat({ ...newCat, description: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </>
            ) : (
              <>
                <TextField size="small" label="Nom *" fullWidth value={newDest.name} onChange={e => setNewDest({ ...newDest, name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField size="small" label="Pays *" fullWidth value={newDest.country} onChange={e => setNewDest({ ...newDest, country: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField size="small" label="Région" fullWidth value={newDest.region} onChange={e => setNewDest({ ...newDest, region: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Button component="label" variant="outlined" startIcon={<CloudUpload sx={{ fontSize: 16 }} />} size="small" sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(T.teal, 0.4), color: T.teal, fontSize: 12 }}>
                  {newDestFile ? `✓ ${newDestFile.name}` : 'Télécharger une image'}
                  <input type="file" hidden accept="image/*" onChange={e => { if (e.target.files?.[0]) setNewDestFile(e.target.files[0]); }} />
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setCreateDialog(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(T.slate, 0.3), color: T.slate }}>Annuler</Button>
          <Button onClick={createType === 'category' ? handleCreateCat : handleCreateDest} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: T.teal, fontWeight: 600, '&:hover': { bgcolor: '#0c9490' } }}>Créer</Button>
        </DialogActions>
      </Dialog>

      {/* ══ DIALOG MODIFIER ═══════════════════════════════ */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${T.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: T.ink, pb: 1 }}>{editType === 'category' ? 'Modifier catégorie' : 'Modifier destination'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editType === 'category' ? (
              <>
                <TextField size="small" label="Nom" fullWidth value={editCat?.name || ''} onChange={e => setEditCat({ ...editCat, name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField size="small" label="Description" fullWidth multiline rows={2} value={editCat?.description || ''} onChange={e => setEditCat({ ...editCat, description: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </>
            ) : (
              <>
                <TextField size="small" label="Nom" fullWidth value={editDest?.name || ''} onChange={e => setEditDest({ ...editDest, name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField size="small" label="Pays" fullWidth value={editDest?.country || ''} onChange={e => setEditDest({ ...editDest, country: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField size="small" label="Région" fullWidth value={editDest?.region || ''} onChange={e => setEditDest({ ...editDest, region: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Button component="label" variant="outlined" startIcon={<CloudUpload sx={{ fontSize: 16 }} />} size="small" sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(T.teal, 0.4), color: T.teal, fontSize: 12 }}>
                  {editDestFile ? `✓ ${editDestFile.name}` : 'Changer l\'image'}
                  <input type="file" hidden accept="image/*" onChange={e => { if (e.target.files?.[0]) setEditDestFile(e.target.files[0]); }} />
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(T.slate, 0.3), color: T.slate }}>Annuler</Button>
          <Button onClick={editType === 'category' ? handleUpdateCat : handleUpdateDest} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: T.teal, fontWeight: 600, '&:hover': { bgcolor: '#0c9490' } }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default AdminDashboard;