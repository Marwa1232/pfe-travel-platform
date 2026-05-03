import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  TextField, CircularProgress, Switch, Button, Alert,
  Avatar, IconButton, Tooltip, InputAdornment, Card,
  CardContent, Grid, Fade, Zoom, Stack
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Refresh, Search, Person, Email, Public,
  AdminPanelSettings, Business, Block,
  CheckCircle, ArrowBack, People
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

// ─── STYLED COMPONENTS ──────────────────────────────────────────
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: COLORS.white,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(COLORS.teal, 0.15)}`,
  boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.06)}`,
  borderRadius: 12,
  padding: theme.spacing(2),
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  background: COLORS.white,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(COLORS.navy, 0.1)}`,
    borderColor: alpha(COLORS.teal, 0.3),
  },
}));

const TableWrapper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 4px 16px ${alpha(COLORS.navy, 0.05)}`,
}));

const HeaderCell = styled(TableCell)({
  backgroundColor: alpha(COLORS.navy, 0.03),
  color: COLORS.navy,
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  borderBottom: `2px solid ${alpha(COLORS.teal, 0.2)}`,
});

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: COLORS.teal,
    '&:hover': { backgroundColor: alpha(COLORS.teal, 0.1) },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: COLORS.teal,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 12,
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '&:hover fieldset': {
      borderColor: COLORS.teal,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.teal,
    },
  },
}));

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des données.');
    } finally { setLoading(false); }
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, !isActive);
      loadUsers();
    } catch (error) { console.error(error); }
  };

  const filteredUsers = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.roles?.includes('ROLE_ADMIN')).length,
    organizers: users.filter(u => u.roles?.includes('ROLE_ORGANIZER')).length,
  };

  const getRoleColor = (role: string) => {
    if (role === 'ROLE_ADMIN') return COLORS.amber;
    if (role === 'ROLE_ORGANIZER') return COLORS.teal;
    return COLORS.navy;
  };

  const getRoleLabel = (role: string) => {
    return role.replace('ROLE_', '');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 4 }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Fade in>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton 
                onClick={() => navigate('/admin')}
                sx={{ 
                  bgcolor: COLORS.white, 
                  color: COLORS.navy, 
                  borderRadius: 12,
                  border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                  '&:hover': { bgcolor: alpha(COLORS.teal, 0.05), borderColor: COLORS.teal }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
                  Utilisateurs
                </Typography>
                <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                  Gestion de la base de données plateforme
                </Typography>
              </Box>
            </Stack>
            <GradientButton startIcon={<Refresh />} onClick={loadUsers}>
              Actualiser
            </GradientButton>
          </Box>
        </Fade>

        {/* STATS CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Membres', val: stats.total, icon: <People />, color: COLORS.navy },
            { label: 'Comptes Actifs', val: stats.active, icon: <CheckCircle />, color: COLORS.amber },
            { label: 'Organisateurs', val: stats.organizers, icon: <Business />, color: COLORS.teal },
          ].map((s, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Zoom in timeout={300 + i * 100}>
                <StatsCard>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                    <Avatar sx={{ bgcolor: alpha(s.color, 0.1), color: s.color, width: 48, height: 48, borderRadius: 12 }}>
                      {s.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: alpha(COLORS.navy, 0.6) }}>
                        {s.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={800} sx={{ color: s.color, lineHeight: 1.2 }}>
                        {s.val}
                      </Typography>
                    </Box>
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* RECHERCHE */}
        <GlassPaper sx={{ mb: 4 }}>
          <SearchField
            fullWidth
            placeholder="Rechercher un utilisateur par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: COLORS.teal, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </GlassPaper>

        {/* TABLEAU */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: COLORS.teal }} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ borderRadius: 12, bgcolor: alpha(COLORS.amber, 0.05), color: COLORS.amber }}
          >
            {error}
          </Alert>
        ) : (
          <TableWrapper elevation={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <HeaderCell>Profil</HeaderCell>
                    <HeaderCell>Contact</HeaderCell>
                    <HeaderCell>Rôles</HeaderCell>
                    <HeaderCell>Statut</HeaderCell>
                    <HeaderCell align="center">Action</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user, idx) => (
                    <TableRow 
                      key={user.id} 
                      sx={{ 
                        '&:hover': { bgcolor: alpha(COLORS.teal, 0.02) },
                        animation: `fadeIn 0.3s ease ${idx * 0.03}s both`,
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ 
                            background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
                            fontWeight: 'bold',
                            width: 40,
                            height: 40,
                            fontSize: '0.9rem'
                          }}>
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </Avatar>
                          <Typography fontWeight={700} sx={{ color: COLORS.navy }}>
                            {user.first_name} {user.last_name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.navy }}>
                          {user.email}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                          {user.country || 'International'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.roles?.map((role: string) => (
                          <Chip 
                            key={role} 
                            label={getRoleLabel(role)} 
                            size="small" 
                            sx={{ 
                              mr: 0.5, 
                              mb: 0.5,
                              bgcolor: alpha(getRoleColor(role), 0.1), 
                              color: getRoleColor(role), 
                              fontWeight: 600, 
                              borderRadius: 8,
                              fontSize: '0.7rem',
                              height: 24,
                            }} 
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_active ? 'Actif' : 'Inactif'} 
                          size="small"
                          sx={{ 
                            bgcolor: user.is_active ? alpha(COLORS.teal, 0.1) : alpha(COLORS.amber, 0.1),
                            color: user.is_active ? COLORS.teal : COLORS.amber,
                            fontWeight: 600,
                            borderRadius: 8,
                            fontSize: '0.7rem',
                            height: 24,
                          }}
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
            </TableContainer>
          </TableWrapper>
        )}

        {/* Empty state */}
        {!loading && filteredUsers.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              bgcolor: alpha(COLORS.teal, 0.1),
              color: COLORS.teal
            }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={600} sx={{ color: COLORS.navy, mb: 1 }}>
              Aucun utilisateur trouvé
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
              Essayez de modifier votre recherche
            </Typography>
          </Box>
        )}
      </Container>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default AdminUsers;