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
  Menu,
  MenuItem,
  ListItemIcon,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha } from '@mui/material/styles';
import {
  People,
  FlightTakeoff,
  Business,
  AttachMoney,
  Warning,
  CheckCircle,
  TrendingUp,
  Refresh,
  Category,
  Public,
  Security,
  Speed,
  MoreVert,
  Block,
  AccountBalance,
  Shield,
  PendingActions,
  Add,
  Edit,
  Delete,
  CloudUpload,
  Place,
  EmojiEvents,
  Insights,
  Search,
  RemoveRedEye,
  Payment,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { adminAPI } from '../../services/api';

// Style professionnel mais avec le thème existant
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid #eef2f6',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    borderColor: '#00BFA5',
  },
}));

// ModernCard pour le panel Contenu (design original)
const ModernCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(0, 191, 165, 0.08)',
  borderRadius: theme.spacing(2.5),
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #00BFA5, #0D47A1, #00BFA5)',
    backgroundSize: '200% 100%',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.01)',
    boxShadow: '0 20px 40px rgba(0, 191, 165, 0.15), 0 10px 20px rgba(13, 71, 161, 0.1)',
  },
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#ffffff',
  border: '1px solid #eef2f6',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  borderRadius: theme.spacing(2),
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  color: theme.palette.primary.main,
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  '&.approved': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
  },
  '&.pending': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
  },
  '&.rejected': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minHeight: 48,
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
}));

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
});

const IconBox = styled(Box)(({ theme, color }: { theme?: any; color: string }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(color, 0.1),
  color: color,
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
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
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
  topDestinations: { destination: string; country: string; tripCount: number }[];
  topOrganizers: { organizer: string; bookings: number; revenue: number }[];
}

interface FinancialData {
  totalRevenue: number;
  totalCommission: number;
  commissionRate: number;
  organizerPayouts: number;
  pendingPayouts: number;
}

interface SystemHealth {
  status: string;
  pending: { organizers: number; bookings: number };
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

  if (loading) {
    return (
      <BackgroundBox>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <CircularProgress size={48} thickness={4} sx={{ color: '#00BFA5' }} />
        </Box>
      </BackgroundBox>
    );
  }

  const pendingOrganizers = organizers.filter(o => o.status === 'PENDING');

  return (
    <BackgroundBox>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 2,
              bgcolor: alpha('#00BFA5', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield sx={{ fontSize: 28, color: '#00BFA5' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" sx={{ color: '#0D47A1' }}>
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez votre plateforme TripBooking
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="medium"
            startIcon={refreshing ? <CircularProgress size={18} /> : <Refresh />}
            onClick={refreshData}
            disabled={refreshing}
            sx={{ 
              borderRadius: 2,
              borderColor: '#00BFA5',
              color: '#00BFA5',
              '&:hover': {
                borderColor: '#0D47A1',
                backgroundColor: alpha('#00BFA5', 0.04),
              },
            }}
          >
            Actualiser
          </Button>
        </Box>

        {/* KPIs Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconBox color="#FF6B6B">
                    <People sx={{ fontSize: 24 }} />
                  </IconBox>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#FF6B6B' }}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Utilisateurs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconBox color="#FFA500">
                    <Business sx={{ fontSize: 24 }} />
                  </IconBox>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#FFA500' }}>
                      {stats.totalOrganizers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Organisateurs
                    </Typography>
                  </Box>
                </Box>
                {stats.pendingOrganizers > 0 && (
                  <Chip
                    size="small"
                    label={`${stats.pendingOrganizers} en attente`}
                    sx={{ 
                      mt: 1,
                      backgroundColor: alpha('#FFA500', 0.1),
                      color: '#FFA500',
                      fontWeight: 600,
                      borderRadius: 1.5,
                    }}
                  />
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconBox color="#00BFA5">
                    <FlightTakeoff sx={{ fontSize: 24 }} />
                  </IconBox>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#00BFA5' }}>
                      {stats.totalTrips}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Voyages
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconBox color="#4CAF50">
                    <AttachMoney sx={{ fontSize: 24 }} />
                  </IconBox>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#4CAF50' }}>
                      {(stats.totalRevenue || 0).toFixed(0)} TND
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Revenus
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Boutons d'action - Design original */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<People />}
              onClick={() => navigate('/admin/users')}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #00BFA5, #0D47A1, #667eea)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,191,165,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea, #0D47A1, #00BFA5)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,191,165,0.3)',
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
              startIcon={<Business />}
              onClick={() => navigate('/admin/organizers')}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(255,165,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF6B6B, #FFA500, #FFD700)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(255,165,0,0.3)',
                },
              }}
            >
              Gérer les organisateurs
            </Button>
          </Grid>
        </Grid>

        {/* Stats secondaires */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid #eef2f6' }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#4CAF50' }}>
                {stats.completedBookings}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Confirmées
              </Typography>
            </Paper>
          </Grid>
          <Grid xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid #eef2f6' }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#FFA500' }}>
                {stats.pendingBookings}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                En attente
              </Typography>
            </Paper>
          </Grid>
          <Grid xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid #eef2f6' }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#00BFA5' }}>
                {stats.conversionRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Conversion
              </Typography>
            </Paper>
          </Grid>
          <Grid xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid #eef2f6' }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#FFA500' }}>
                {stats.pendingOrganizers}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                En attente
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2, borderRadius: 2, border: '1px solid #eef2f6' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTabs-indicator': {
                height: 3,
                backgroundColor: '#00BFA5',
              },
            }}
          >
            <StyledTab icon={<Shield sx={{ fontSize: 18 }} />} iconPosition="start" label="Modération" />
            <StyledTab icon={<Insights sx={{ fontSize: 18 }} />} iconPosition="start" label="Insights" />
            <StyledTab icon={<AccountBalance sx={{ fontSize: 18 }} />} iconPosition="start" label="Financier" />
            <StyledTab icon={<Category sx={{ fontSize: 18 }} />} iconPosition="start" label="Contenu" />
            <StyledTab icon={<Speed sx={{ fontSize: 18 }} />} iconPosition="start" label="Système" />
          </Tabs>
        </Paper>

        {/* Panel Modération */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher un organisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" sx={{ color: '#00BFA5' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>

            <Grid xs={12}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0D47A1' }}>
                      Demandes d'organisation
                      {pendingOrganizers.length > 0 && (
                        <Chip
                          size="small"
                          label={pendingOrganizers.length}
                          sx={{ 
                            ml: 1, 
                            backgroundColor: alpha('#FFA500', 0.1),
                            color: '#FFA500',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Typography>
                  </Box>

                  {pendingOrganizers.length === 0 ? (
                    <Alert 
                      severity="success" 
                      sx={{ borderRadius: 2 }}
                      icon={<CheckCircle sx={{ color: '#4CAF50' }} />}
                    >
                      Aucune demande en attente
                    </Alert>
                  ) : (
                    <List disablePadding>
                      {filteredOrganizers.filter(o => o.status === 'PENDING').map((organizer) => (
                        <Paper
                          key={organizer.id}
                          variant="outlined"
                          sx={{ 
                            mb: 1, 
                            p: 2, 
                            borderRadius: 2,
                            borderColor: alpha('#FFA500', 0.3),
                            '&:hover': {
                              borderColor: '#FFA500',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: alpha('#FFA500', 0.1),
                              color: '#FFA500',
                              fontWeight: 600,
                            }}>
                              {organizer.agency_name?.[0] || 'O'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight="600">
                                {organizer.agency_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {organizer.user?.email}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Approuver">
                                <IconButton 
                                  size="small" 
                                  sx={{ color: '#4CAF50' }}
                                  onClick={() => handleApproveOrganizer(organizer.id)}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Rejeter">
                                <IconButton 
                                  size="small" 
                                  sx={{ color: '#F44336' }}
                                  onClick={() => handleRejectOrganizer(organizer.id)}
                                >
                                  <Block fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, organizer)}>
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panel Insights */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0D47A1' }}>
                    <Public fontSize="small" sx={{ color: '#00BFA5' }} />
                    Destinations populaires
                  </Typography>
                  <List disablePadding>
                    {detailedStats?.topDestinations.map((dest, idx) => (
                      <ListItem key={idx} disablePadding sx={{ py: 1 }}>
                        <ListItemText
                          primary={dest.destination}
                          secondary={dest.country}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        />
                        <Chip 
                          size="small" 
                          label={`${dest.tripCount} voyages`}
                          sx={{ 
                            backgroundColor: alpha('#00BFA5', 0.1),
                            color: '#00BFA5',
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0D47A1' }}>
                    <EmojiEvents fontSize="small" sx={{ color: '#FFA500' }} />
                    Top Organisateurs
                  </Typography>
                  <List disablePadding>
                    {detailedStats?.topOrganizers.map((org, idx) => (
                      <ListItem key={idx} disablePadding sx={{ py: 1 }}>
                        <ListItemText
                          primary={org.organizer}
                          secondary={`${org.bookings} réservations`}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        />
                        <Typography variant="body2" fontWeight="700" sx={{ color: '#00BFA5' }}>
                          {org.revenue.toFixed(0)} TND
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panel Financier */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid xs={12} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={500}>
                    Revenu Total
                  </Typography>
                  <Typography variant="h6" fontWeight="700" sx={{ color: '#4CAF50' }}>
                    {(financialData?.totalRevenue || 0).toFixed(0)} TND
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid xs={12} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={500}>
                    Commission
                  </Typography>
                  <Typography variant="h6" fontWeight="700" sx={{ color: '#00BFA5' }}>
                    {(financialData?.totalCommission || 0).toFixed(0)} TND
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Taux: {financialData?.commissionRate}%
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid xs={12} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={500}>
                    Paiements Organisateurs
                  </Typography>
                  <Typography variant="h6" fontWeight="700" sx={{ color: '#FFA500' }}>
                    {(financialData?.organizerPayouts || 0).toFixed(0)} TND
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid xs={12} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={500}>
                    En attente
                  </Typography>
                  <Typography variant="h6" fontWeight="700" sx={{ color: '#F44336' }}>
                    {financialData?.pendingPayouts || 0}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panel Contenu - Design original */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={2.5}>
            {/* Catégories */}
            <Grid xs={12} md={6}>
              <ModernCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Typography variant="h5" fontWeight="800" sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      <Category sx={{ fontSize: 32 }} />
                      Catégories ({categories.length})
                    </Typography>
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<Add />}
                      onClick={() => openDialog('category')}
                      sx={{
                        background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                        borderRadius: 2.5,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(0,191,165,0.3)',
                        },
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                  
                  <Grid container spacing={1.5}>
                    {categories.map((cat) => (
                      <Grid xs={12} key={cat.id}>
                        <Paper
                          sx={{
                            p: 2.5,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: alpha('#00BFA5', 0.2),
                            background: alpha('#00BFA5', 0.02),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#00BFA5',
                              boxShadow: '0 8px 20px rgba(0,191,165,0.1)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0D47A1' }}>
                                {cat.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {cat.description}
                              </Typography>
                            </Box>
                            <Box>
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: '#00BFA5',
                                  '&:hover': { backgroundColor: alpha('#00BFA5', 0.1) }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: '#F44336',
                                  '&:hover': { backgroundColor: alpha('#F44336', 0.1) }
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
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
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Typography variant="h5" fontWeight="800" sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      background: 'linear-gradient(135deg, #FF6B6B, #FFA07A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      <Public sx={{ fontSize: 32 }} />
                      Destinations ({destinations.length})
                    </Typography>
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<Add />}
                      onClick={() => openDialog('destination')}
                      sx={{
                        background: 'linear-gradient(90deg, #FF6B6B, #FFA07A)',
                        borderRadius: 2.5,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(90deg, #FFA07A, #FF6B6B)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(255,107,107,0.3)',
                        },
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                  
                  <List>
                    {destinations.map((dest) => (
                      <ListItem 
                        key={dest.id}
                        sx={{ 
                          mb: 1.5, 
                          borderRadius: 2.5,
                          bgcolor: alpha('#FF6B6B', 0.02),
                          border: '1px solid',
                          borderColor: alpha('#FF6B6B', 0.2),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#FF6B6B',
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(255,107,107,0.1)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={dest.image} 
                            sx={{ 
                              width: 50, 
                              height: 50,
                              border: '2px solid',
                              borderColor: '#FF6B6B',
                            }}
                          >
                            <Place fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#FF6B6B' }}>
                              {dest.name}
                            </Typography>
                          }
                          secondary={`${dest.country} ${dest.region ? `- ${dest.region}` : ''}`}
                        />
                        <Box>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: '#00BFA5',
                              '&:hover': { backgroundColor: alpha('#00BFA5', 0.1) }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: '#F44336',
                              '&:hover': { backgroundColor: alpha('#F44336', 0.1) }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </ModernCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panel Système */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      mx: 'auto',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: systemHealth?.status === 'operational' ? alpha('#4CAF50', 0.1) : alpha('#F44336', 0.1),
                    }}
                  >
                    {systemHealth?.status === 'operational' ? (
                      <CheckCircle sx={{ fontSize: 40, color: '#4CAF50' }} />
                    ) : (
                      <Warning sx={{ fontSize: 40, color: '#F44336' }} />
                    )}
                  </Box>
                  <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0D47A1' }}>
                    {systemHealth?.status === 'operational' ? 'Système OK' : 'Système dégradé'}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid xs={12} md={8}>
              <StyledCard>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ color: '#0D47A1' }}>
                    Services
                  </Typography>
                  <Grid container spacing={1}>
                    {systemHealth?.services?.map((service, idx) => (
                      <Grid xs={12} sm={6} key={idx}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight={600}>
                              {service.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={service.status}
                              color={service.status === 'operational' ? 'success' : 'error'}
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {service.latency}ms
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ 
            pb: 1, 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: '#0D47A1',
          }}>
            {dialogType === 'category' ? 'Nouvelle catégorie' : 'Nouvelle destination'}
          </DialogTitle>
          <DialogContent>
            {dialogType === 'category' ? (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nom"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  multiline
                  rows={2}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Stack>
            ) : (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nom"
                  value={newDestination.name}
                  onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Pays"
                  value={newDestination.country}
                  onChange={(e) => setNewDestination({ ...newDestination, country: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Région"
                  value={newDestination.region}
                  onChange={(e) => setNewDestination({ ...newDestination, region: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    borderColor: '#00BFA5',
                    color: '#00BFA5',
                    '&:hover': {
                      borderColor: '#0D47A1',
                    },
                  }}
                >
                  Image
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button size="small" onClick={() => setDialogOpen(false)} sx={{ color: '#666' }}>
              Annuler
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={dialogType === 'category' ? handleCreateCategory : handleCreateDestination}
              sx={{
                backgroundColor: '#00BFA5',
                '&:hover': { backgroundColor: '#0D47A1' },
                borderRadius: 2,
              }}
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { minWidth: 160, borderRadius: 2 } }}
        >
          <MenuItem onClick={handleMenuClose} dense>
            <ListItemIcon><RemoveRedEye fontSize="small" sx={{ color: '#00BFA5' }} /></ListItemIcon>
            <ListItemText>Voir détails</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose} dense>
            <ListItemIcon><Block fontSize="small" sx={{ color: '#F44336' }} /></ListItemIcon>
            <ListItemText sx={{ color: '#F44336' }}>Bloquer</ListItemText>
          </MenuItem>
        </Menu>
      </Container>
    </BackgroundBox>
  );
};

export default AdminDashboard;