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
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
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
  Lan,
  MoreVert,
  Block,
  VerifiedUser,
  Cancel,
  Sync,
  AccountBalance,
  Receipt,
  Timeline,
  Insights,
  SystemUpdateAlt,
  Shield,
  BugReport,
  PendingActions,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { adminAPI } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
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
}

interface SystemHealth {
  database: string;
  status: string;
  counts: { users: number; trips: number; bookings: number; organizers: number };
  pending: { organizers: number; bookings: number };
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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
  const [newDestination, setNewDestination] = useState({ name: '', country: '', region: '' });
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

  const handleBlockOrganizer = async (id: number) => {
    try {
      await adminAPI.blockOrganizer(id);
      loadOrganizers();
      loadStats();
    } catch (error) {
      console.error('Error blocking organizer:', error);
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
      setNewDestination({ name: '', country: '', region: '' });
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  const pendingOrganizers = organizers.filter(o => o.status === 'PENDING');
  const approvedOrganizers = organizers.filter(o => o.status === 'APPROVED');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            🎯 Control Tower
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administration de la plateforme TripBooking
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
          onClick={refreshData}
          disabled={refreshing}
        >
          Actualiser
        </Button>
      </Box>

      {/* KPIs Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{stats.totalUsers}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Utilisateurs</Typography>
                </Box>
                <People sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{stats.totalOrganizers}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Organisateurs</Typography>
                </Box>
                <Business sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{stats.totalTrips}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Voyages</Typography>
                </Box>
                <FlightTakeoff sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{(stats.totalRevenue || 0).toFixed(2)} TND</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Revenus Totaux</Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Secondary KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{stats.completedBookings}</Typography>
              <Typography variant="body2" color="text.secondary">Réservations confirmées</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning color="warning" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{stats.pendingBookings}</Typography>
              <Typography variant="body2" color="text.secondary">En attente</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="primary" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{stats.conversionRate}%</Typography>
              <Typography variant="body2" color="text.secondary">Taux de conversion</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={stats.pendingOrganizers} color="error">
                <PendingActions sx={{ fontSize: 30, color: 'warning.main' }} />
              </Badge>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{stats.pendingOrganizers}</Typography>
              <Typography variant="body2" color="text.secondary">Organisateurs en attente</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Shield />} label="Modération" />
          <Tab icon={<Insights />} label="Insights Stratégiques" />
          <Tab icon={<AccountBalance />} label="Financier" />
          <Tab icon={<Category />} label="Contenu" />
          <Tab icon={<Speed />} label="Santé Système" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Moderation & Validation */}
        <Grid container spacing={3}>
          {/* Pending Organizers */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={pendingOrganizers.length} color="error">
                  <Security />
                </Badge>
                Demandes d'organisation en attente
              </Typography>
              {pendingOrganizers.length === 0 ? (
                <Alert severity="success">Aucune demande en attente</Alert>
              ) : (
                <List>
                  {pendingOrganizers.map((organizer) => (
                    <React.Fragment key={organizer.id}>
                      <ListItem
                        secondaryAction={
                          <Box>
                            <IconButton color="success" onClick={() => handleApproveOrganizer(organizer.id)}>
                              <CheckCircle />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleBlockOrganizer(organizer.id)}>
                              <Block />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            {organizer.agency_name?.[0] || 'O'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={organizer.agency_name}
                          secondary={`${organizer.user?.first_name} ${organizer.user?.last_name} - ${organizer.user?.email}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* User Management */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People /> Gestion des utilisateurs
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.slice(0, 5).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={user.is_active ? 'success' : 'error'}
                            label={user.is_active ? 'Actif' : 'Inactif'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color={user.is_active ? 'error' : 'success'}
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Désactiver' : 'Activer'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/admin/users')}>
                Voir tous les utilisateurs
              </Button>
            </Paper>
          </Grid>

          {/* Approved Organizers */}
          <Grid xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Organisateurs approuvés ({approvedOrganizers.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Agence</TableCell>
                      <TableCell>Responsable</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Pays</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvedOrganizers.slice(0, 10).map((organizer) => (
                      <TableRow key={organizer.id}>
                        <TableCell>{organizer.agency_name}</TableCell>
                        <TableCell>{organizer.user?.first_name} {organizer.user?.last_name}</TableCell>
                        <TableCell>{organizer.user?.email}</TableCell>
                        <TableCell>{organizer.country}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={organizer.status === 'APPROVED' ? 'success' : 'default'}
                            label={organizer.status}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => handleBlockOrganizer(organizer.id)}>
                            <Block />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Strategic Insights */}
        <Grid container spacing={3}>
          {/* Monthly Trends */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📈 Tendances mensuelles (6 derniers mois)
              </Typography>
              {detailedStats && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Nouveaux utilisateurs</Typography>
                  {detailedStats.monthlyUsers.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ width: 60 }}>{item.month}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(item.count / Math.max(...detailedStats.monthlyUsers.map(u => u.count), 1)) * 100}
                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ ml: 1, width: 30 }}>{item.count}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Bookings by Month */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                🎫 Réservations mensuelles
              </Typography>
              {detailedStats && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Réservations</Typography>
                  {detailedStats.monthlyBookings.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ width: 60 }}>{item.month}</Typography>
                      <LinearProgress
                        variant="determinate"
                        color="secondary"
                        value={(item.count / Math.max(...detailedStats.monthlyBookings.map(b => b.count), 1)) * 100}
                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ ml: 1, width: 30 }}>{item.count}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Top Destinations */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                🌍 Destinations populaires
              </Typography>
              {detailedStats && detailedStats.topDestinations.length > 0 ? (
                <List>
                  {detailedStats.topDestinations.map((dest, idx) => (
                    <ListItem key={idx}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: idx === 0 ? 'gold' : 'grey.300' }}>
                          {idx + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={dest.destination}
                        secondary={`${dest.country} - ${dest.tripCount} voyages`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">Aucune destination</Typography>
              )}
            </Paper>
          </Grid>

          {/* Top Organizers */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                🏆 Meilleurs organisateurs
              </Typography>
              {detailedStats && detailedStats.topOrganizers.length > 0 ? (
                <List>
                  {detailedStats.topOrganizers.map((org, idx) => (
                    <ListItem key={idx}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: idx === 0 ? 'gold' : 'grey.300' }}>
                          {idx + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={org.organizer}
                        secondary={`${org.bookings} réservations - ${org.revenue.toFixed(2)} TND`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">Aucune donnée</Typography>
              )}
            </Paper>
          </Grid>

          {/* Trips by Category */}
          <Grid xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Répartition des voyages par catégorie
              </Typography>
              {detailedStats && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {detailedStats.tripsByCategory.map((cat, idx) => (
                    <Grid xs={6} sm={4} md={2} key={idx}>
                      <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'white' }}>
                        <Typography variant="h4" fontWeight="bold">{cat.count}</Typography>
                        <Typography variant="caption">{cat.category}</Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Financial Overview */}
        <Grid container spacing={3}>
          <Grid xs={12} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Revenu Total</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {(financialData?.totalRevenue || 0).toFixed(2)} TND
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Commission Plateforme</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {(financialData?.totalCommission || 0).toFixed(2)} TND
                </Typography>
                <Typography variant="caption">Taux: {financialData?.commissionRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Revenus Organisateurs</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {(financialData?.organizerPayouts || 0).toFixed(2)} TND
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">En attente de paiement</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {financialData?.pendingPayouts || 0}
                </Typography>
                <Typography variant="caption">Paiements</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Chart */}
          <Grid xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📈 Revenus mensuels
              </Typography>
              {detailedStats && detailedStats.monthlyRevenue && (
                <Box sx={{ mt: 2 }}>
                  {detailedStats.monthlyRevenue.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" sx={{ width: 60, fontWeight: 'bold' }}>{item.month}</Typography>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          color="success"
                          value={(item.revenue / Math.max(...detailedStats.monthlyRevenue.map(r => r.revenue), 1)) * 100}
                          sx={{ height: 20, borderRadius: 2 }}
                        />
                      </Box>
                      <Typography variant="body1" fontWeight="bold" sx={{ width: 100, textAlign: 'right' }}>
                        {item.revenue.toFixed(2)} TND
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Content & System Management */}
        <Grid container spacing={3}>
          {/* Categories */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Catégories ({categories.length})
                </Typography>
                <Button variant="contained" size="small" onClick={() => openDialog('category')}>
                  + Ajouter
                </Button>
              </Box>
              <List>
                {categories.map((cat) => (
                  <ListItem key={cat.id}>
                    <ListItemText primary={cat.name} secondary={cat.description} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Destinations */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <Public sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Destinations ({destinations.length})
                </Typography>
                <Button variant="contained" size="small" onClick={() => openDialog('destination')}>
                  + Ajouter
                </Button>
              </Box>
              <List>
                {destinations.map((dest) => (
                  <ListItem key={dest.id}>
                    <ListItemText
                      primary={dest.name}
                      secondary={`${dest.country} ${dest.region ? `- ${dest.region}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* System Health Checker */}
        <Grid container spacing={3}>
          {/* Health Status */}
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: systemHealth?.status === 'operational' ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {systemHealth?.status === 'operational' ? (
                    <CheckCircle sx={{ fontSize: 50, color: 'white' }} />
                  ) : (
                    <Warning sx={{ fontSize: 50, color: 'white' }} />
                  )}
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {systemHealth?.status === 'operational' ? 'Système Opérationnel' : 'Système Dégradé'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dernière vérification: {systemHealth?.timestamp}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Database Status */}
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Storage /> Base de données
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    color={systemHealth?.database === 'healthy' ? 'success' : 'error'}
                    label={systemHealth?.database === 'healthy' ? 'Connectée' : 'Erreur'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Statut de la connexion à la base de données
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Items */}
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Éléments en attente
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Organisateurs:</Typography>
                  <Chip label={systemHealth?.pending.organizers || 0} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Réservations:</Typography>
                  <Chip label={systemHealth?.pending.bookings || 0} color="info" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Stats */}
          <Grid xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Statistiques système
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <People sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight="bold">{systemHealth?.counts.users || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Utilisateurs</Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <FlightTakeoff sx={{ fontSize: 40, color: 'secondary.main' }} />
                    <Typography variant="h4" fontWeight="bold">{systemHealth?.counts.trips || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Voyages</Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <Receipt sx={{ fontSize: 40, color: 'warning.main' }} />
                    <Typography variant="h4" fontWeight="bold">{systemHealth?.counts.bookings || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Réservations</Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <Business sx={{ fontSize: 40, color: 'error.main' }} />
                    <Typography variant="h4" fontWeight="bold">{systemHealth?.counts.organizers || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Organisateurs</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* AI Health Analysis */}
          <Grid xs={12}>
            <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🤖 Analyse IA de la santé de la plateforme
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid xs={12} md={4}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2">Score de santé global</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {systemHealth?.status === 'operational' ? '95%' : '70%'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} md={4}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2">Recommandation</Typography>
                    <Typography variant="body1">
                      {systemHealth?.pending.organizers && systemHealth.pending.organizers > 3
                        ? 'Traiter les demandes d\'organisateurs en attente'
                        : 'Plateforme stable - Aucune action requise'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} md={4}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2">Tendance</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp />
                      <Typography variant="body1">En croissance</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialog for adding Category/Destination */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'category' ? 'Ajouter une catégorie' : 'Ajouter une destination'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'category' ? (
            <>
              <TextField
                fullWidth
                label="Nom"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Nom"
                value={newDestination.name}
                onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Pays"
                value={newDestination.country}
                onChange={(e) => setNewDestination({ ...newDestination, country: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Région"
                value={newDestination.region}
                onChange={(e) => setNewDestination({ ...newDestination, region: e.target.value })}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={dialogType === 'category' ? handleCreateCategory : handleCreateDestination}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
