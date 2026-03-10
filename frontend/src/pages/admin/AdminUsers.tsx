import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  CircularProgress,
  Switch,
  Button,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Fade,
  Zoom,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Refresh,
  Search,
  Person,
  Email,
  Public,
  AdminPanelSettings,
  Business,
  VerifiedUser,
  Block,
  CheckCircle,
  Warning,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

// Styled components (même thème)
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
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
  fontWeight: 600,
  fontSize: '0.8rem',
  '&.active': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  },
  '&.inactive': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  },
}));

const RoleChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 500,
  fontSize: '0.75rem',
  height: 24,
  '&.admin': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  },
  '&.organizer': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
  },
  '&.user': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0,191,165,0.15)',
  },
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.success.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.success.main, 0.1),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: theme.palette.success.main,
  },
}));

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getUsers();
      console.log('Users response:', response.data);
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error loading users:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur lors du chargement des utilisateurs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, !isActive);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleIcon = (roles: string[]) => {
    if (roles?.includes('ROLE_ADMIN')) return <AdminPanelSettings fontSize="small" />;
    if (roles?.includes('ROLE_ORGANIZER')) return <Business fontSize="small" />;
    return <Person fontSize="small" />;
  };

  const getRoleClass = (roles: string[]) => {
    if (roles?.includes('ROLE_ADMIN')) return 'admin';
    if (roles?.includes('ROLE_ORGANIZER')) return 'organizer';
    return 'user';
  };

  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.roles?.includes('ROLE_ADMIN')).length,
    organizers: users.filter(u => u.roles?.includes('ROLE_ORGANIZER')).length,
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      py: 4,
    }}>
      <Container maxWidth="xl">
        {/* Header avec bouton retour */}
        <Fade in timeout={500}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => navigate('/admin')}
                sx={{ 
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: 'white', transform: 'translateX(-2px)' },
                  transition: 'all 0.3s ease',
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight="700">Gestion des utilisateurs</Typography>
                <Typography variant="body2" color="text.secondary">
                  Gérez les comptes utilisateurs de la plateforme
                </Typography>
              </Box>
            </Box>
            <Button
              startIcon={<Refresh />}
              onClick={loadUsers}
              variant="contained"
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
              }}
            >
              Actualiser
            </Button>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Zoom in timeout={500}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#00BFA5', 0.1), color: '#00BFA5', width: 48, height: 48 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography variant="h5" fontWeight="700">{stats.total}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Zoom in timeout={600}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#4CAF50', 0.1), color: '#4CAF50', width: 48, height: 48 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Actifs</Typography>
                    <Typography variant="h5" fontWeight="700" color="success.main">{stats.active}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Zoom in timeout={700}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#F44336', 0.1), color: '#F44336', width: 48, height: 48 }}>
                    <Block />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Inactifs</Typography>
                    <Typography variant="h5" fontWeight="700" color="error.main">{stats.inactive}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Zoom in timeout={900}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#FF9800', 0.1), color: '#FF9800', width: 48, height: 48 }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Organisateurs</Typography>
                    <Typography variant="h5" fontWeight="700" color="warning.main">{stats.organizers}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
        </Grid>

        {/* Barre de recherche */}
        <GlassPaper sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: '#00BFA5' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
        </GlassPaper>

        {error && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={loadUsers}>
                  Réessayer
                </Button>
              }
            >
              {error}
            </Alert>
          </Fade>
        )}

        {loading ? (
          <Box textAlign="center" sx={{ py: 8 }}>
            <CircularProgress size={50} thickness={4} sx={{ color: '#00BFA5' }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Chargement des utilisateurs...
            </Typography>
          </Box>
        ) : filteredUsers.length === 0 ? (
          <GlassPaper sx={{ textAlign: 'center', py: 6 }}>
            <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery ? 'Essayez d\'autres termes de recherche' : 'Aucun utilisateur pour le moment'}
            </Typography>
            {searchQuery && (
              <Button variant="outlined" onClick={() => setSearchQuery('')}>
                Effacer la recherche
              </Button>
            )}
          </GlassPaper>
        ) : (
          <Fade in timeout={500}>
            <StyledTableContainer >
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Utilisateur</StyledTableCell>
                    <StyledTableCell>Email</StyledTableCell>
                    <StyledTableCell>Pays</StyledTableCell>
                    <StyledTableCell>Rôles</StyledTableCell>
                    <StyledTableCell>Statut</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: alpha('#00BFA5', 0.02) } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: user.roles?.includes('ROLE_ADMIN') 
                                ? 'error.main'
                                : user.roles?.includes('ROLE_ORGANIZER')
                                  ? 'warning.main'
                                  : 'primary.main'
                            }}
                          >
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {user.first_name} {user.last_name}
                            </Typography>
                            {user.phone && (
                              <Typography variant="caption" color="text.secondary">
                                {user.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{user.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Public sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{user.country || 'Non spécifié'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {user.roles?.map((role: string) => {
                            const roleName = role.replace('ROLE_', '');
                            return (
                              <RoleChip
                                key={role}
                                label={roleName}
                                className={getRoleClass([role])}
                                size="small"
                                icon={getRoleIcon([role])}
                              />
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={user.is_active ? 'Actif' : 'Inactif'}
                          className={user.is_active ? 'active' : 'inactive'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={user.is_active ? 'Désactiver' : 'Activer'}>
                          <StyledSwitch
                            checked={user.is_active}
                            onChange={() => handleToggleActive(user.id, user.is_active)}
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default AdminUsers;