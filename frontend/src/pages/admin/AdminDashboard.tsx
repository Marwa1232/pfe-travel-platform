import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  Tooltip,
  Badge,
  Stack,
  Fade,
  Zoom,
  Menu,
  MenuItem,
  ListItemIcon,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  People,
  FlightTakeoff,
  Business,
  AttachMoney,
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Refresh,
  Category,
  Public,
  Security,
  Speed,
  Storage,
  MoreVert,
  Block,
  Cancel,
  AccountBalance,
  Receipt,
  Shield,
  PendingActions,
  Add,
  Edit,
  Delete,
  CloudUpload,
  Place,
  EmojiEvents,
  AutoAwesome,
  ShowChart,
  Insights,
  Timeline as TimelineIcon,
  Search,
  RemoveRedEye,
  Payment,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { adminAPI } from '../../services/api';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const shine = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

// Styled components modernes
const ModernCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 191, 165, 0.1)',
  borderRadius: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #00BFA5, #0D47A1, #00BFA5)',
    animation: `${shine} 3s infinite`,
    backgroundSize: '200% 100%',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 30px 60px rgba(0, 191, 165, 0.2), 0 15px 30px rgba(13, 71, 161, 0.15)',
  },
}));

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(3),
  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    animation: `${float} 6s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    animation: `${float} 8s ease-in-out infinite reverse`,
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 30px 60px rgba(102, 126, 234, 0.4)',
  },
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 191, 165, 0.1)',
  borderRadius: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 25px 50px rgba(0, 191, 165, 0.15)',
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'countUp 1s ease-out',
  '@keyframes countUp': {
    '0%': { opacity: 0, transform: 'translateY(20px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  '&.MuiTableCell-head': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    fontWeight: 700,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  fontWeight: 700,
  fontSize: '0.8rem',
  '&.approved': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  },
  '&.pending': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  },
  '&.rejected': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minHeight: 64,
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.05),
  },
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.02),
  },
}));

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,191,165,0.1) 0%, transparent 70%)',
    animation: `${float} 20s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(13,71,161,0.1) 0%, transparent 70%)',
    animation: `${float} 15s ease-in-out infinite reverse`,
  },
});

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  animation: `${pulse} 2s ease-in-out infinite`,
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in timeout={500}>
          <Box sx={{ pt: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

interface Stats {
  totalUsers: number;
  totalOrganizers: number;
  totalTrips: number;
  totalRevenue: number;
  pendingOrganizers: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  conversionRate: number;
}

interface DetailedStats {
  monthlyUsers: { month: string; count: number }[];
  monthlyBookings: { month: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  tripsByCategory: { category: string; count: number }[];
  topDestinations: { destination: string; country: string; tripCount: number }[];
  topOrganizers: { organizer: string; bookings: number; revenue: number }[];
}

interface FinancialData {
  totalRevenue: number;
  totalCommission: number;
  commissionRate: number;
  platformRevenue: number;
  organizerPayouts: number;
  pendingPayouts: number;
  completedPayouts: number;
  monthlyCommission?: { month: string; commission: number }[];
}

interface SystemHealth {
  database: string;
  status: string;
  counts: { users: number; trips: number; bookings: number; organizers: number };
  pending: { organizers: number; bookings: number };
  timestamp: string;
  services?: { name: string; status: 'operational' | 'degraded' | 'down'; latency: number }[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrganizers: 0,
    totalTrips: 0,
    totalRevenue: 0,
    pendingOrganizers: 0,
    completedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    conversionRate: 0,
  });
  
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newDestination, setNewDestination] = useState({ name: '', country: '', region: '', image: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'category' | 'destination'>('category');

  useEffect(() => {
    if (!token || !user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/dashboard');
      return;
    }
    loadAllData();
  }, [token, user, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadDetailedStats(),
        loadFinancialData(),
        loadSystemHealth(),
        loadOrganizers(),
        loadUsers(),
        loadCategories(),
        loadDestinations(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
    } finally {
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadDetailedStats = async () => {
    try {
      const response = await adminAPI.getDetailedStats();
      setDetailedStats(response.data);
    } catch (error) {
      console.error('Error loading detailed stats:', error);
    }
  };

  const loadFinancialData = async () => {
    try {
      const response = await adminAPI.getFinancialStats();
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await adminAPI.getSystemHealth();
      setSystemHealth(response.data);
    } catch (error) {
      console.error('Error loading system health:', error);
    }
  };

  const loadOrganizers = async () => {
    try {
      const response = await adminAPI.getOrganizers();
      setOrganizers(response.data);
    } catch (error) {
      console.error('Error loading organizers:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadDestinations = async () => {
    try {
      const response = await adminAPI.getDestinations();
      setDestinations(response.data);
    } catch (error) {
      console.error('Error loading destinations:', error);
    }
  };

  const handleApproveOrganizer = async (id: number) => {
    try {
      await adminAPI.approveOrganizer(id);
      loadOrganizers();
      loadStats();
    } catch (error) {
      console.error('Error approving organizer:', error);
    }
  };

  const handleRejectOrganizer = async (id: number) => {
    try {
      await adminAPI.blockOrganizer(id);
      loadOrganizers();
      loadStats();
    } catch (error) {
      console.error('Error rejecting organizer:', error);
    }
  };

  const handleToggleUserStatus = async (id: number, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(id, !isActive);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await adminAPI.createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      loadCategories();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCreateDestination = async () => {
    try {
      await adminAPI.createDestination(newDestination);
      setNewDestination({ name: '', country: '', region: '', image: '' });
      loadDestinations();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating destination:', error);
    }
  };

  const openDialog = (type: 'category' | 'destination') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, organizer: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrganizer(organizer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrganizer(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewDestination({ ...newDestination, image: imageUrl });
    }
  };

  const filteredOrganizers = organizers.filter(org => {
    return org.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           org.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = users.filter(u => {
    return u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <BackgroundBox>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <ModernCard sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#00BFA5', mb: 2 }} />
            <Typography variant="h5" fontWeight={600}>Chargement du tableau de bord...</Typography>
          </ModernCard>
        </Box>
      </BackgroundBox>
    );
  }

  const pendingOrganizers = organizers.filter(o => o.status === 'PENDING');
  const approvedOrganizers = organizers.filter(o => o.status === 'APPROVED');

  return (
    <BackgroundBox>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Header ultra moderne */}
        <GlassPaper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconWrapper>
                <Shield sx={{ fontSize: 30, color: '#00BFA5' }} />
              </IconWrapper>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="800" sx={{
                  background: 'linear-gradient(135deg, #00BFA5, #0D47A1, #667eea)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Control Tower
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                  Administration de la plateforme TripBooking
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
              onClick={refreshData}
              disabled={refreshing}
              sx={{
                background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 10px 20px rgba(0,191,165,0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 30px rgba(0,191,165,0.4)',
                },
              }}
            >
              Actualiser
            </Button>
          </Box>
        </GlassPaper>

        {/* KPIs Cards - Design ultra moderne avec dégradés */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={10} sm={6} md={3}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #FF6B6B, #FFA07A)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <People sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Badge badgeContent={stats.totalUsers} color="primary" max={9999} sx={{ '& .MuiBadge-badge': { fontSize: '1rem', height: 24, minWidth: 24 } }} />
                </Box>
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1, background: 'linear-gradient(135deg, #FF6B6B, #FFA07A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Utilisateurs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: '#4CAF50' }} />
                 
                </Box>
              </CardContent>
            </ModernCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Business sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Badge badgeContent={stats.pendingOrganizers} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '1rem', height: 24, minWidth: 24 } }} />
                </Box>
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1, background: 'linear-gradient(135deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {stats.totalOrganizers}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Organisateurs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <People sx={{ fontSize: 16, color: '#FFA500' }} />
                  <Typography variant="caption" fontWeight={600} color="warning.main">
                    {stats.pendingOrganizers} en attente
                  </Typography>
                </Box>
              </CardContent>
            </ModernCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FlightTakeoff sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1, background: 'linear-gradient(135deg, #00BFA5, #0D47A1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {stats.totalTrips}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Voyages
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: '#00BFA5' }} />
                  <Typography variant="caption" fontWeight={600} color="primary.main">
                    {stats.completedBookings} réservations
                  </Typography>
                </Box>
              </CardContent>
            </ModernCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <AttachMoney sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {(stats.totalRevenue || 0).toFixed(0)} TND
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Revenus Totaux
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: '#4CAF50' }} />
                  
                </Box>
              </CardContent>
            </ModernCard>
          </Grid>
        </Grid>

        {/* Deux gros boutons ultra modernes */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<People sx={{ fontSize: 28 }} />}
              onClick={() => navigate('/admin/users')}
              sx={{
                py: 3,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #00BFA5, #0D47A1, #667eea)',
                fontSize: '1.3rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 20px 40px rgba(0,191,165,0.3)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea, #0D47A1, #00BFA5)',
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 30px 60px rgba(0,191,165,0.4)',
                },
              }}
            >
              Gérer les utilisateurs
            </Button>
          </Grid>
          <Grid xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Business sx={{ fontSize: 28 }} />}
              onClick={() => navigate('/admin/organizers')}
              sx={{
                py: 3,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
                fontSize: '1.3rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 20px 40px rgba(255,165,0,0.3)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF6B6B, #FFA500, #FFD700)',
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 30px 60px rgba(255,165,0,0.4)',
                },
              }}
            >
              Gérer les organisateurs
            </Button>
          </Grid>
        </Grid>

        {/* Secondary KPIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={6} sm={3}>
            <GlassPaper sx={{ p: 3, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h4" fontWeight="800" sx={{ color: '#4CAF50' }}>{stats.completedBookings}</Typography>
              <Typography variant="body2" fontWeight={600} color="text.secondary">Réservations confirmées</Typography>
            </GlassPaper>
          </Grid>
          <Grid xs={6} sm={3}>
            <GlassPaper sx={{ p: 3, textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h4" fontWeight="800" sx={{ color: '#FF9800' }}>{stats.pendingBookings}</Typography>
              <Typography variant="body2" fontWeight={600} color="text.secondary">En attente</Typography>
            </GlassPaper>
          </Grid>
          <Grid xs={6} sm={3}>
            <GlassPaper sx={{ p: 3, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: '#00BFA5', mb: 1 }} />
              <Typography variant="h4" fontWeight="800" sx={{ color: '#00BFA5' }}>{stats.conversionRate}%</Typography>
              <Typography variant="body2" fontWeight={600} color="text.secondary">Taux de conversion</Typography>
            </GlassPaper>
          </Grid>
          <Grid xs={6} sm={3}>
            <GlassPaper sx={{ p: 3, textAlign: 'center' }}>
              <Badge badgeContent={stats.pendingOrganizers} color="error">
                <PendingActions sx={{ fontSize: 40, color: '#FF9800' }} />
              </Badge>
              <Typography variant="h4" fontWeight="800" sx={{ color: '#FF9800', mt: 1 }}>{stats.pendingOrganizers}</Typography>
              <Typography variant="body2" fontWeight={600} color="text.secondary">Organisateurs en attente</Typography>
            </GlassPaper>
          </Grid>
        </Grid>

        {/* Tabs */}
        <GlassPaper sx={{ mb: 3, p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                backgroundColor: '#00BFA5',
                borderRadius: '4px 4px 0 0',
              },
            }}
          >
            <StyledTab icon={<Shield />} label="Modération" />
            <StyledTab icon={<Insights />} label="Insights" />
            <StyledTab icon={<AccountBalance />} label="Financier" />
            <StyledTab icon={<Category />} label="Contenu" />
            <StyledTab icon={<Speed />} label="Système" />
          </Tabs>
        </GlassPaper>

        {/* Panel Modération */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Barre de recherche */}
            <Grid xs={12}>
              <GlassPaper sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Rechercher un organisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, fontSize: '1.1rem' }
                  }}
                  variant="outlined"
                />
              </GlassPaper>
            </Grid>

            {/* Pending Organizers - Agrandi et modernisé */}
            <Grid xs={12}>
              <ModernCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="800" sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      background: 'linear-gradient(135deg, #FF9800, #F44336)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      <Badge badgeContent={pendingOrganizers.length} color="error">
                        <Security sx={{ fontSize: 40 }} />
                      </Badge>
                      Demandes d'organisation
                    </Typography>
                    {pendingOrganizers.length > 0 && (
                      <Chip 
                        label={`${pendingOrganizers.length} en attente`}
                        color="warning"
                        size="medium"
                        sx={{ fontWeight: 700, fontSize: '1rem', px: 2 }}
                      />
                    )}
                  </Box>
                  
                  {pendingOrganizers.length === 0 ? (
                    <Alert 
                      severity="success" 
                      icon={<CheckCircle fontSize="large" />}
                      sx={{ 
                        borderRadius: 3, 
                        py: 3, 
                        fontSize: '1.2rem',
                        background: alpha('#4CAF50', 0.1),
                        border: `1px solid ${alpha('#4CAF50', 0.3)}`,
                      }}
                    >
                      Aucune demande en attente
                    </Alert>
                  ) : (
                    <List>
                      {filteredOrganizers.filter(o => o.status === 'PENDING').map((organizer, idx) => (
                        <Fade in timeout={500 + idx * 100} key={organizer.id}>
                          <Paper
                            elevation={0}
                            sx={{
                              mb: 2,
                              p: 3,
                              borderRadius: 3,
                              border: '1px solid',
                              borderColor: alpha('#FF9800', 0.3),
                              background: alpha('#FF9800', 0.02),
                              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              '&:hover': {
                                borderColor: '#FF9800',
                                boxShadow: '0 20px 40px rgba(255,152,0,0.2)',
                                transform: 'translateY(-4px)',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Avatar 
                                sx={{ 
                                  width: 80, 
                                  height: 80, 
                                  bgcolor: 'warning.main',
                                  fontSize: '2rem',
                                  boxShadow: '0 10px 20px rgba(255,152,0,0.3)',
                                }}
                              >
                                {organizer.agency_name?.[0] || 'O'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                  {organizer.agency_name}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" gutterBottom>
                                  {organizer.user?.first_name} {organizer.user?.last_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  📧 {organizer.user?.email} • 📍 {organizer.country} • 🏢 {organizer.registration_number}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Approuver">
                                  <IconButton
                                    color="success"
                                    size="large"
                                    onClick={() => handleApproveOrganizer(organizer.id)}
                                    sx={{ 
                                      bgcolor: alpha('#4CAF50', 0.1),
                                      '&:hover': { bgcolor: alpha('#4CAF50', 0.2), transform: 'scale(1.1)' },
                                      transition: 'all 0.3s ease',
                                    }}
                                  >
                                    <CheckCircle fontSize="large" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Rejeter">
                                  <IconButton
                                    color="error"
                                    size="large"
                                    onClick={() => handleRejectOrganizer(organizer.id)}
                                    sx={{ 
                                      bgcolor: alpha('#F44336', 0.1),
                                      '&:hover': { bgcolor: alpha('#F44336', 0.2), transform: 'scale(1.1)' },
                                      transition: 'all 0.3s ease',
                                    }}
                                  >
                                    <Block fontSize="large" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Paper>
                        </Fade>
                      ))}
                    </List>
                  )}
                </CardContent>
              </ModernCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panel Insights */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Destinations populaires */}
            <Grid xs={12} md={6}>
              <ModernCard>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" fontWeight="800" gutterBottom sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    <Public sx={{ fontSize: 40 }} />
                    Destinations populaires
                  </Typography>
                  
                  <List>
                    {detailedStats?.topDestinations.map((dest, idx) => (
                      <ListItem 
                        key={idx}
                        sx={{ 
                          mb: 2, 
                          borderRadius: 3,
                          bgcolor: idx === 0 ? alpha('#FFD700', 0.1) : 'transparent',
                          border: idx === 0 ? `1px solid ${alpha('#FFD700', 0.3)}` : 'none',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#00BFA5',
                              width: 48, height: 48,
                              fontWeight: 'bold',
                            }}
                          >
                            {idx + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="h6">{dest.destination}</Typography>}
                          secondary={`${dest.country} • ${dest.tripCount} voyages`}
                        />
                        <Chip
                          label={`${Math.round((dest.tripCount / stats.totalTrips) * 100)}%`}
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </ModernCard>
            </Grid>

            {/* Meilleurs organisateurs */}
            <Grid xs={12} md={6}>
              <ModernCard>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" fontWeight="800" gutterBottom sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    <EmojiEvents sx={{ fontSize: 40 }} />
                    Top Organisateurs
                  </Typography>
                  
                  <List>
                    {detailedStats?.topOrganizers.map((org, idx) => (
                      <ListItem 
                        key={idx}
                        sx={{ 
                          mb: 2, 
                          borderRadius: 3,
                          bgcolor: idx === 0 ? alpha('#FFD700', 0.1) : 'transparent',
                          border: idx === 0 ? `1px solid ${alpha('#FFD700', 0.3)}` : 'none',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32',
                              width: 48, height: 48,
                              fontWeight: 'bold',
                            }}
                          >
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="h6">{org.organizer}</Typography>}
                          secondary={`${org.bookings} réservations • ${org.revenue.toFixed(2)} TND`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </ModernCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panel Financier */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Cartes financières */}
            <Grid xs={12} md={3}>
              <ModernCard sx={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)' }}>
                <CardContent sx={{ p: 3, color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <AttachMoney sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Revenu Total</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="800">
                    {(financialData?.totalRevenue || 0).toFixed(2)} TND
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <TrendingUp sx={{ fontSize: 20 }} />
                    <Typography variant="body2">+15% ce mois</Typography>
                  </Box>
                </CardContent>
              </ModernCard>
            </Grid>

            <Grid xs={12} md={3}>
              <ModernCard sx={{ background: 'linear-gradient(135deg, #00BFA5, #0D47A1)' }}>
                <CardContent sx={{ p: 3, color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <AccountBalance sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Commission</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="800">
                    {(financialData?.totalCommission || 0).toFixed(2)} TND
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>Taux: {financialData?.commissionRate}%</Typography>
                </CardContent>
              </ModernCard>
            </Grid>

            <Grid xs={12} md={3}>
              <ModernCard sx={{ background: 'linear-gradient(135deg, #FF9800, #F57C00)' }}>
                <CardContent sx={{ p: 3, color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Business sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Paiements Org</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="800">
                    {(financialData?.organizerPayouts || 0).toFixed(2)} TND
                  </Typography>
                </CardContent>
              </ModernCard>
            </Grid>

            <Grid xs={12} md={3}>
              <ModernCard sx={{ background: 'linear-gradient(135deg, #F44336, #D32F2F)' }}>
                <CardContent sx={{ p: 3, color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PendingActions sx={{ fontSize: 40 }} />
                    <Typography variant="h6">En attente</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="800">
                    {financialData?.pendingPayouts || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>Paiements</Typography>
                </CardContent>
              </ModernCard>
            </Grid>

            
          </Grid>
        </TabPanel>

        {/* Panel Contenu */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Catégories */}
            <Grid xs={12} md={6}>
              <ModernCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="800" sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      <Category sx={{ fontSize: 40 }} />
                      Catégories ({categories.length})
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      onClick={() => openDialog('category')}
                      sx={{
                        background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {categories.map((cat, idx) => (
                      <Grid xs={12} key={cat.id}>
                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: alpha('#00BFA5', 0.2),
                            background: alpha('#00BFA5', 0.02),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#00BFA5',
                              boxShadow: '0 10px 30px rgba(0,191,165,0.1)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="h6" fontWeight={700}>{cat.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{cat.description}</Typography>
                            </Box>
                            <Box>
                              <IconButton size="large"><Edit fontSize="medium" /></IconButton>
                              <IconButton size="large" color="error"><Delete fontSize="medium" /></IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </ModernCard>
            </Grid>

            {/* Destinations */}
            <Grid xs={12} md={6}>
              <ModernCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="800" sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      background: 'linear-gradient(135deg, #FF6B6B, #FFA07A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      <Public sx={{ fontSize: 40 }} />
                      Destinations ({destinations.length})
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      onClick={() => openDialog('destination')}
                      sx={{
                        background: 'linear-gradient(90deg, #FF6B6B, #FFA07A)',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                  
                  <List>
                    {destinations.map((dest, idx) => (
                      <ListItem 
                        key={dest.id}
                        sx={{ 
                          mb: 2, 
                          borderRadius: 3,
                          bgcolor: alpha('#FF6B6B', 0.02),
                          border: '1px solid',
                          borderColor: alpha('#FF6B6B', 0.2),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#FF6B6B',
                            transform: 'translateX(8px)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={dest.image} 
                            sx={{ 
                              width: 60, 
                              height: 60,
                              border: '2px solid',
                              borderColor: '#FF6B6B',
                            }}
                          >
                            <Place />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="h6">{dest.name}</Typography>}
                          secondary={`${dest.country} ${dest.region ? `- ${dest.region}` : ''}`}
                        />
                        <Box>
                          <IconButton size="large"><Edit fontSize="medium" /></IconButton>
                          <IconButton size="large" color="error"><Delete fontSize="medium" /></IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </ModernCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panel Santé Système */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            {/* Health Status */}
            <Grid xs={12} md={4}>
              <ModernCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      mx: 'auto',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: systemHealth?.status === 'operational' 
                        ? 'linear-gradient(135deg, #4CAF50, #2E7D32)'
                        : 'linear-gradient(135deg, #F44336, #D32F2F)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      animation: `${pulse} 2s infinite`,
                    }}
                  >
                    {systemHealth?.status === 'operational' ? (
                      <CheckCircle sx={{ fontSize: 80, color: 'white' }} />
                    ) : (
                      <Warning sx={{ fontSize: 80, color: 'white' }} />
                    )}
                  </Box>
                  <Typography variant="h4" fontWeight="800" gutterBottom>
                    {systemHealth?.status === 'operational' ? 'Système Opérationnel' : 'Système Dégradé'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Dernière vérification: {new Date().toLocaleString()}
                  </Typography>
                </CardContent>
              </ModernCard>
            </Grid>

            {/* Services Status */}
            <Grid xs={12} md={8}>
              <ModernCard>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" fontWeight="800" gutterBottom sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    <Speed sx={{ fontSize: 40 }} />
                    Services
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {systemHealth?.services?.map((service, idx) => (
                      <Grid xs={12} sm={6} key={idx}>
                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: service.status === 'operational' ? alpha('#4CAF50', 0.3) : alpha('#F44336', 0.3),
                            bgcolor: service.status === 'operational' ? alpha('#4CAF50', 0.05) : alpha('#F44336', 0.05),
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight={600}>
                              {service.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={service.status}
                              color={service.status === 'operational' ? 'success' : 'error'}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Latence: {service.latency}ms
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </ModernCard>
            </Grid>

           

            {/* Analyse IA */}
            <Grid xs={12}>
              <ModernCard sx={{ background: 'linear-gradient(135deg, #00BFA5, #0D47A1, #667eea)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <AutoAwesome sx={{ fontSize: 60, color: 'white' }} />
                    <Box>
                      <Typography variant="h3" fontWeight="800" color="white">
                        Analyse IA
                      </Typography>
                    
                    </Box>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid xs={12} md={4}>
                      <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                        <Typography variant="h6" color="white" gutterBottom>Score de santé</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                          <Typography variant="h2" fontWeight="800" color="white">
                            {systemHealth?.status === 'operational' ? '95' : '70'}
                          </Typography>
                          <Typography variant="h5" color="rgba(255,255,255,0.6)">/100</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={systemHealth?.status === 'operational' ? 95 : 70}
                          sx={{ mt: 2, height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid xs={12} md={4}>
                      <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                        <Typography variant="h6" color="white" gutterBottom>Recommandation</Typography>
                        <Typography variant="h5" color="white" fontWeight="600">
                          {systemHealth?.pending.organizers && systemHealth.pending.organizers > 3
                            ? ' Traiter les demandes en attente'
                            : ' Plateforme stable'}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid xs={12} md={4}>
                      <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                        <Typography variant="h6" color="white" gutterBottom>Tendance</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TrendingUp sx={{ fontSize: 40, color: 'white' }} />
                          <Typography variant="h4" color="white" fontWeight="700">+12%</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </ModernCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Dialog pour ajouter catégorie/destination */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
            color: 'white',
            py: 3,
            fontSize: '1.5rem',
            fontWeight: 700,
          }}>
            {dialogType === 'category' ? 'Ajouter une catégorie' : 'Ajouter une destination'}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {dialogType === 'category' ? (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2, py: 1 } }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  multiline
                  rows={3}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Stack>
            ) : (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={newDestination.name}
                  onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Pays"
                  value={newDestination.country}
                  onChange={(e) => setNewDestination({ ...newDestination, country: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Région"
                  value={newDestination.region}
                  onChange={(e) => setNewDestination({ ...newDestination, region: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ 
                    borderRadius: 2, 
                    py: 2,
                    border: '2px dashed',
                    borderColor: '#00BFA5',
                    '&:hover': { borderColor: '#0D47A1' },
                  }}
                >
                  Télécharger une image
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
                
                {newDestination.image && (
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={newDestination.image}
                      alt="Aperçu"
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 12,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'white' },
                      }}
                      onClick={() => setNewDestination({ ...newDestination, image: '' })}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <Button 
              onClick={() => setDialogOpen(false)} 
              variant="outlined"
              size="large"
              sx={{ borderRadius: 2, px: 4 }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={dialogType === 'category' ? handleCreateCategory : handleCreateDestination}
              sx={{
                borderRadius: 2,
                px: 4,
                background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
              }}
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Organizer Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            },
          }}
        >
          <MenuItem onClick={() => { navigate(`/admin/organizers/${selectedOrganizer?.id}`); handleMenuClose(); }}>
            <ListItemIcon><RemoveRedEye fontSize="small" /></ListItemIcon>
            <ListItemText>Voir les détails</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon><Payment fontSize="small" /></ListItemIcon>
            <ListItemText>Voir les paiements</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleRejectOrganizer(selectedOrganizer?.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
            <ListItemIcon><Block fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Bloquer</ListItemText>
          </MenuItem>
        </Menu>
      </Container>
    </BackgroundBox>
  );
};

export default AdminDashboard;