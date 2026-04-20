import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Fade,
  TextField,
  InputAdornment,
  Grid,
  Paper,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LogoutIcon from '@mui/icons-material/Logout';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { logout } from '../store/authSlice';
import { RootState } from '../store';
import { fixImageUrl } from '../services/api';

interface Destination {
  id: number;
  name: string;
  country: string;
  region?: string;
}

interface Category {
  id: number;
  name: string;
  typeId?: string;
}

const CATEGORY_TO_TYPE: Record<string, string> = {
  // French categories (exact or variations)
  'Adventure': 'aventure',
  'Aventure & Randonnée': 'aventure',
  'Randonnée': 'aventure',
  'Culturel': 'culturel',
  'Culturel & Historique': 'culturel',
  'Historique': 'culturel',
  'Plage': 'plage',
  'Plage & Relaxation': 'plage',
  'Relaxation': 'plage',
  'Désert': 'desert',
  'Désert & Safari': 'desert',
  'Safari': 'desert',
  'Gastronomie': 'gastro',
  'Wellness': 'wellness',
  'Wellness & Spa': 'wellness',
  'Spa': 'wellness',
  'Détente': 'wellness',
  'Bien-être': 'wellness',
};

// ─── Styled components (identiques) ─────────────────────────────────────────

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'scrolled' && prop !== 'isTransparent',
})<{ scrolled: boolean; isTransparent: boolean }>(({ theme, scrolled, isTransparent }) => ({
  backgroundColor: scrolled
    ? alpha(theme.palette.background.paper, 0.85)
    : isTransparent
      ? 'transparent'
      : alpha(theme.palette.background.paper, 0.95),
  backdropFilter: scrolled ? 'blur(20px)' : 'none',
  boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
  borderBottom: scrolled ? `1px solid ${alpha(theme.palette.primary.main, 0.1)}` : 'none',
  transition: 'all 0.3s ease',
}));

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'transparent',
})<{ active?: boolean; transparent?: boolean }>(({ theme, active, transparent }) => ({
  color: transparent && !active
    ? theme.palette.common.white
    : active
      ? theme.palette.primary.main
      : theme.palette.text.primary,
  fontWeight: active ? 600 : 500,
  fontSize: '0.9rem',
  textTransform: 'none',
  padding: '6px 12px',
  minWidth: 'auto',
  position: 'relative',
  '&:hover': {
    backgroundColor: transparent
      ? alpha(theme.palette.common.white, 0.1)
      : alpha(theme.palette.primary.main, 0.08),
    color: transparent ? theme.palette.common.white : theme.palette.primary.main,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 2),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(5px)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Arizonia", cursive',
  fontWeight: 400,
  fontSize: '2.55rem',
  background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': { transform: 'scale(1.02)' },
  [theme.breakpoints.down('sm')]: { fontSize: '2rem' },
}));

const UserAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'hasCustomImage',
})<{ hasCustomImage?: boolean }>(({ theme, hasCustomImage }) => ({
  width: 55,
  height: 55,
  background: hasCustomImage ? 'transparent' : 'linear-gradient(135deg, #00BFA5, #0D47A1)',
  cursor: 'pointer',
  transition: 'all 0.6s ease',
  border: '2px solid transparent',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: theme.palette.primary.main,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 30,
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    backdropFilter: 'blur(10px)',
    height: 40,
    fontSize: '0.85rem',
    '& fieldset': { borderColor: alpha(theme.palette.primary.main, 0.3) },
    '&:hover fieldset': { borderColor: theme.palette.primary.main },
    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
  },
  '& input': { padding: '8px 0 8px 12px' },
}));

// ─── Dropdown paper — fond blanc, large ──────────────────────────────────────
const DropdownPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
  border: '1px solid #f0f0f0',
  overflow: 'visible',
  padding: theme.spacing(3, 4),
  marginTop: theme.spacing(1),
}));

// Lien destination (city) — style TourRadar : texte simple, hover teal
const DestLink = styled(Box)(({ theme }) => ({
  fontSize: '0.88rem',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  padding: '3px 0',
  transition: 'color 0.15s ease',
  '&:hover': { color: '#00BFA5' },
}));

// En-tête colonne pays
const CountryHeader = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: '0.95rem',
  color: '#1a1a2e',
  marginBottom: 8,
  letterSpacing: '-0.01em',
}));

// Style de voyage item — icône + label (réutilisé pour les catégories)
const StyleItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 1.5),
  borderRadius: 10,
  cursor: 'pointer',
  transition: 'all 0.18s ease',
  '& .style-icon': {
    color: '#777',
    fontSize: '1.3rem',
    transition: 'color 0.18s',
  },
  '& .style-label': {
    fontSize: '0.9rem',
    color: '#2d2d2d',
    fontWeight: 450,
  },
  '&:hover': {
    backgroundColor: alpha('#00BFA5', 0.07),
    '& .style-icon': { color: '#00BFA5' },
    '& .style-label': { color: '#00BFA5' },
  },
}));

// ─── Component ────────────────────────────────────────────────────────────────

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useSelector((state: RootState) => state.auth);

  const userAny = user as any;
  const profilePhotoUrl = userAny?.profile_photo_url ? fixImageUrl(userAny.profile_photo_url) : null;
  const hasCustomPhoto = Boolean(profilePhotoUrl);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor]                 = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen]                   = useState(false);
  const [scrolled, setScrolled]                       = useState(false);
  const [destinationsAnchor, setDestinationsAnchor]   = useState<null | HTMLElement>(null);
  const [stylesAnchor, setStylesAnchor]               = useState<null | HTMLElement>(null);
  const [destinations, setDestinations]               = useState<Destination[]>([]);
  const [categories, setCategories]                   = useState<Category[]>([]);
  const [searchQuery, setSearchQuery]                 = useState('');
  const [notifications, setNotifications]             = useState<any[]>([]);
  const [unreadCount, setUnreadCount]                 = useState(0);

  const isTransparent  = location.pathname === '/' && !scrolled;
  const showSearchBar  = location.pathname !== '/' || scrolled;

  // Grouper destinations par pays (sans doublon)
  const groupedDestinations = React.useMemo(() => {
    const groups: { [country: string]: string[] } = {};
    destinations.forEach((dest) => {
      if (!dest.country) return;
      if (!groups[dest.country]) groups[dest.country] = [];
      if (!groups[dest.country].includes(dest.name)) groups[dest.country].push(dest.name);
    });
    return Object.keys(groups).sort().map((country) => ({
      country,
      cities: groups[country].sort(),
    }));
  }, [destinations]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [destRes, catRes] = await Promise.all([
          fetch('http://localhost:8000/api/destinations').then((r) => r.json()),
          fetch('http://localhost:8000/api/categories').then((r) => r.json()),
        ]);
        setDestinations(destRes['hydra:member'] || destRes);
        setCategories(catRes['hydra:member'] || catRes);
      } catch (error) {
        console.error('Erreur chargement données:', error);
        // Données de secours
        setDestinations([
          { id: 1, name: 'Tunis',      country: 'Tunisie' },
          { id: 2, name: 'Sousse',     country: 'Tunisie' },
          { id: 3, name: 'Djerba',     country: 'Tunisie' },
        ]);
        setCategories([
          { id: 1, name: 'Aventure & Randonnée' },
          { id: 2, name: 'Culturel & Historique' },
          { id: 3, name: 'Plage & Relaxation' },
          { id: 4, name: 'Désert & Safari' },
          { id: 5, name: 'Gastronomie' },
          { id: 6, name: 'Wellness & Spa' },
        ]);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        console.error('Notifications API error:', res.status);
        return;
      }
      const data = await res.json();
      const notifs = Array.isArray(data) ? data : data['hydra:member'] || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMenuOpen  = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout    = () => { dispatch(logout()); navigate('/'); handleMenuClose(); };
  const isActive        = (p: string) => location.pathname === p;

  const handleNavClick = (path: string, scrollTo?: string) => {
    if (scrollTo) {
      if (location.pathname !== '/') { navigate('/'); setTimeout(() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' }), 100); }
      else document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
    } else { navigate(path); }
    if (isMobile) setMobileOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/trips?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); }
  };

  // ─── Menus utilisateur (avatar) ────────────────────────────────────────────
  const guestMenuItems = [
    { label: 'Connexion',  path: '/login',    icon: <LoginIcon /> },
    { label: 'Inscription', path: '/register', icon: <AppRegistrationIcon /> },
    { label: 'Contact',    path: '/contact',  icon: <ContactMailIcon />, scrollTo: 'footer' },
    { label: 'À propos',   path: '/about',    icon: <InfoIcon /> },
  ];
  const userMenuItems = [
    { label: 'Tableau de bord',  path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Mes réservations', path: '/bookings',  icon: <BookOnlineIcon /> },
    { label: 'Mes favoris',      path: '/saved',     icon: <FavoriteIcon /> },
    { label: 'Paramètres',       path: '/settings',  icon: <SettingsIcon /> },
  ];
  const organizerMenuItems = [
    { label: 'Dashboard Organisateur', path: '/organizer/dashboard', icon: <DashboardIcon /> },
    { label: 'Mes voyages',            path: '/organizer/trips',     icon: <FlightTakeoffIcon /> },
    { label: 'Réservations',           path: '/organizer/bookings',  icon: <BookOnlineIcon /> },
    { label: 'Avis clients',           path: '/organizer/reviews',   icon: <StarIcon /> },
    { label: 'Paramètres',             path: '/settings',            icon: <SettingsIcon /> },
  ];
  const adminMenuItems = [
    { label: 'Dashboard Admin',  path: '/admin/dashboard',   icon: <AdminPanelSettingsIcon /> },
    { label: 'Utilisateurs',     path: '/admin/users',       icon: <AccountCircleIcon /> },
    { label: 'Organisateurs',    path: '/admin/organizers',  icon: <BusinessCenterIcon /> },
    { label: 'Paramètres',       path: '/settings',          icon: <SettingsIcon /> },
  ];

  // ─── Drawer mobile ──────────────────────────────────────────────────────────
  const drawer = (
    <Box sx={{ width: 280, pt: 2, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LogoText onClick={() => navigate('/')}>TripBooking</LogoText>
        <IconButton onClick={() => setMobileOpen(false)}><MenuIcon /></IconButton>
      </Box>
      <Divider />
      <List>
        {/* Destinations en liste simple mobile */}
        <ListItem>
          <ListItemText primary="Destinations" primaryTypographyProps={{ fontWeight: 700, color: '#1a1a2e' }} />
        </ListItem>
        {groupedDestinations.map((group) => (
          <Box key={group.country} sx={{ px: 2, mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0D47A1', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {group.country}
            </Typography>
            {group.cities.map((city) => (
              <Box key={city} onClick={() => { navigate(`/trips?destination=${encodeURIComponent(city)}`); setMobileOpen(false); }}
                sx={{ py: '3px', cursor: 'pointer', fontSize: '0.87rem', color: 'text.secondary', '&:hover': { color: '#00BFA5' } }}>
                {city}
              </Box>
            ))}
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
        {/* Styles de voyage (catégories) */}
        <ListItem>
          <ListItemText primary="Styles de voyage" primaryTypographyProps={{ fontWeight: 700, color: '#1a1a2e' }} />
        </ListItem>
        {categories.map((cat) => (
          <ListItem button key={cat.id} onClick={() => { 
              const typeId = CATEGORY_TO_TYPE[cat.name];
              if (typeId) {
                navigate(`/travel-types?type=${typeId}`);
              } else {
                navigate(`/trips?category=${encodeURIComponent(cat.name)}`);
              }
              setMobileOpen(false); 
            }}
            sx={{ py: 0.5, '&:hover': { backgroundColor: alpha('#00BFA5', 0.06) } }}>
            <ListItemText primary={cat.name} primaryTypographyProps={{ fontSize: '0.87rem' }} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem button onClick={() => handleNavClick('/moments')}><ListItemText primary="Moments" /></ListItem>
        <ListItem button onClick={() => handleNavClick('/trips?promo=true')}><ListItemText primary="Offres" primaryTypographyProps={{ color: '#FF6D00', fontWeight: 600 }} /></ListItem>
        {!token && (
          <Box sx={{ p: 2 }}>
            <Button fullWidth variant="contained" onClick={() => navigate('/login')} sx={{ mb: 1, background: 'linear-gradient(90deg,#00BFA5,#0D47A1)', borderRadius: 2 }}>Connexion</Button>
            <Button fullWidth variant="outlined" onClick={() => navigate('/register')} sx={{ borderRadius: 2, borderColor: '#00BFA5', color: '#00BFA5' }}>Inscription</Button>
          </Box>
        )}
      </List>
    </Box>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <StyledAppBar position="fixed" elevation={0} scrolled={scrolled} isTransparent={isTransparent}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>

          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}
              sx={{ color: isTransparent ? 'white' : 'text.primary' }}>
              <MenuIcon />
            </IconButton>
          )}

          <LogoText onClick={() => navigate('/')} sx={{ flexGrow: isMobile ? 1 : 0, cursor: 'pointer' }}>
            TripBooking
          </LogoText>

          {/* Search bar (visible hors hero) */}
          {!isMobile && showSearchBar && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 2 }}>
              <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: 300 }}>
                <SearchField
                  fullWidth placeholder="Rechercher..." size="small"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#00BFA5', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </Box>
          )}

          {/* Desktop links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

              {/* ── DESTINATIONS dropdown (sans aucun "Voir tout") ─────────── */}
              <NavButton
                transparent={false}
                active={isActive('/destinations')}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', transition: 'transform 0.2s', transform: Boolean(destinationsAnchor) ? 'rotate(180deg)' : 'none' }} />}
                onClick={(e) => setDestinationsAnchor(e.currentTarget)}
              >
                Destinations
              </NavButton>

              <Menu
                anchorEl={destinationsAnchor}
                open={Boolean(destinationsAnchor)}
                onClose={() => setDestinationsAnchor(null)}
                TransitionComponent={Fade}
                PaperProps={{ component: DropdownPaper, sx: { mt: 1 } }}
                MenuListProps={{ disablePadding: true }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#1a1a2e', mb: 2.5 }}>
                  Destinations
                </Typography>

                <Grid container spacing={4} sx={{ minWidth: Math.min(groupedDestinations.length, 4) * 180 + 100 }}>
                  {groupedDestinations.map((group) => (
                    <Grid item key={group.country}>
                      <CountryHeader>{group.country}</CountryHeader>
                      {group.cities.slice(0, 6).map((city) => (
                        <DestLink
                          key={city}
                          onClick={() => { navigate(`/trips?destination=${encodeURIComponent(city)}`); setDestinationsAnchor(null); }}
                        >
                          {city}
                        </DestLink>
                      ))}
                    </Grid>
                  ))}
                </Grid>
              </Menu>

              {/* ── STYLES DE VOYAGE dropdown (catégories de la BDD) ──────── */}
              <NavButton
                transparent={false}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', transition: 'transform 0.2s', transform: Boolean(stylesAnchor) ? 'rotate(180deg)' : 'none' }} />}
                onClick={(e) => setStylesAnchor(e.currentTarget)}
              >
                Styles de voyage
              </NavButton>

              <Menu
                anchorEl={stylesAnchor}
                open={Boolean(stylesAnchor)}
                onClose={() => setStylesAnchor(null)}
                TransitionComponent={Fade}
                PaperProps={{ component: DropdownPaper, sx: { mt: 1 } }}
                MenuListProps={{ disablePadding: true }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              >
                <Box sx={{ display: 'flex', gap: 4 }}>
                  {/* Colonne gauche — description (style TourRadar) */}
                  <Box sx={{ width: 220, flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#1a1a2e', mb: 1.5 }}>
                      Styles de voyage
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#777', lineHeight: 1.65, mb: 2.5 }}>
                      Lancez-vous à corps perdu ou avancez à pas feutrés… Chaque aventure est le témoin de vos rêves et de vos désirs. Optez pour un style qui vous ressemble.
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => { navigate('/travel-types?type=detente'); setStylesAnchor(null); }}
                      sx={{
                        borderRadius: 8, textTransform: 'none', fontWeight: 600,
                        background: '#00BFA5', color: '#fff', fontSize: '0.83rem',
                        '&:hover': { backgroundColor: '#00A896' },
                      }}
                    >
                      Découvrir tous →
                    </Button>
                  </Box>

                  {/* Grille 3 colonnes — catégories (sans icônes pour rester simple) */}
                  <Box>
                    <Grid container columns={3} sx={{ width: 520 }}>
                      {categories.slice(0, 12).map((cat) => (
                        <Grid item xs={1} key={cat.id}>
                          <StyleItem onClick={() => { 
                              const typeId = CATEGORY_TO_TYPE[cat.name];
                              if (typeId) {
                                navigate(`/travel-types?type=${typeId}`);
                              } else {
                                navigate(`/trips?category=${encodeURIComponent(cat.name)}`);
                              }
                              setStylesAnchor(null); 
                            }}>
                            <Box className="style-label" sx={{ fontWeight: 500 }}>
                              {cat.name}
                            </Box>
                          </StyleItem>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Menu>

              {/* ── Autres liens simples (Contact supprimé) ───────────────── */}
              <NavButton transparent={false} onClick={() => handleNavClick('/moments')}>
                Moments
              </NavButton>

              {/* Offres — pill colorée */}
              <Button
                onClick={() => handleNavClick('/trips?promo=true')}
                sx={{
                  textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  color: '#FF6D00',
                  backgroundColor: alpha('#FF6D00', 0.09),
                  borderRadius: 20,
                  px: 1.8, py: 0.6,
                  border: '1px solid',
                  borderColor: alpha('#FF6D00', 0.25),
                  '&:hover': { backgroundColor: alpha('#FF6D00', 0.15) },
                }}
              >
                Offres
              </Button>

              {/* Avatar */}
              <Tooltip title={token ? 'Menu' : 'Connexion'}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {token && (
                    <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ position: 'relative' }}>
                      <NotificationsIcon sx={{ color: isTransparent ? 'white' : 'text.primary' }} />
                      {unreadCount > 0 && (
                        <Box sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                          color: 'white',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}>
                          {unreadCount}
                        </Box>
                      )}
                    </IconButton>
                  )}
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 0.5 }}>
                    <UserAvatar hasCustomImage={hasCustomPhoto} src={hasCustomPhoto && profilePhotoUrl ? profilePhotoUrl : undefined}>
                      {token && user
                        ? `${user.first_name?.[0]}${user.last_name?.[0]}`
                        : <AccountCircleIcon sx={{ fontSize: 28, color: 'white' }} />
                      }
                    </UserAvatar>
                  </IconButton>
                </Box>
              </Tooltip>
            </Box>
          )}

          {/* Mobile avatar */}
          {isMobile && (
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <UserAvatar hasCustomImage={hasCustomPhoto} src={hasCustomPhoto && profilePhotoUrl ? profilePhotoUrl : undefined}>
                {token && user
                  ? `${user.first_name?.[0]}${user.last_name?.[0]}`
                  : <AccountCircleIcon sx={{ fontSize: 28, color: 'white' }} />
                }
              </UserAvatar>
            </IconButton>
          )}
        </Toolbar>
      </StyledAppBar>

      {/* ─── Avatar dropdown menu (icônes professionnelles : noires/grises) ─── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{ sx: { minWidth: 220, mt: 1.5, borderRadius: 3, overflow: 'visible', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {!token ? (
          guestMenuItems.map((item) => (
            <StyledMenuItem key={item.path}
              onClick={() => { if ((item as any).scrollTo) handleNavClick(item.path, (item as any).scrollTo); else navigate(item.path); handleMenuClose(); }}>
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </StyledMenuItem>
          ))
        ) : (
          <Box>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600}>{user?.first_name} {user?.last_name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            {!user?.roles?.includes('ROLE_ORGANIZER') && !user?.roles?.includes('ROLE_ADMIN') &&
              userMenuItems.map((item) => (
                <StyledMenuItem key={item.path} onClick={() => { navigate(item.path); handleMenuClose(); }}>
                  <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </StyledMenuItem>
              ))
            }
            {user?.roles?.includes('ROLE_ORGANIZER') &&
              organizerMenuItems.map((item) => (
                <StyledMenuItem key={item.path} onClick={() => { navigate(item.path); handleMenuClose(); }}>
                  <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </StyledMenuItem>
              ))
            }
            {user?.roles?.includes('ROLE_ADMIN') &&
              adminMenuItems.map((item) => (
                <StyledMenuItem key={item.path} onClick={() => { navigate(item.path); handleMenuClose(); }}>
                  <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </StyledMenuItem>
              ))
            }
            <Divider />
            <StyledMenuItem onClick={() => { handleNavClick('/contact', 'footer'); handleMenuClose(); }}>
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}><ContactMailIcon /></ListItemIcon>
              <ListItemText>Contact</ListItemText>
            </StyledMenuItem>
            <StyledMenuItem onClick={() => { navigate('/about'); handleMenuClose(); }}>
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}><InfoIcon /></ListItemIcon>
              <ListItemText>À propos</ListItemText>
            </StyledMenuItem>
            <Divider />
            <StyledMenuItem onClick={handleLogout} sx={{ color: '#666' }}>
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}><LogoutIcon /></ListItemIcon>
              <ListItemText>Déconnexion</ListItemText>
            </StyledMenuItem>
          </Box>
        )}
      </Menu>

      {/* Notifications dropdown */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        TransitionComponent={Fade}
        PaperProps={{ sx: { width: 360, maxHeight: 400, mt: 1.5, borderRadius: 3, overflow: 'visible', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={600}>Notifications</Typography>
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Aucune notification</Typography>
          </Box>
        ) : (
          notifications.slice(0, 10).map((notif: any) => (
            <Box
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id)}
              sx={{
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                bgcolor: notif.isRead ? 'transparent' : alpha('#00BFA5', 0.05),
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: alpha('#00BFA5', 0.1) },
              }}
            >
              <Typography variant="subtitle2" fontWeight={notif.isRead ? 400 : 600}>
                {notif.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {notif.message}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                {new Date(notif.createdAt).toLocaleString('fr-FR')}
              </Typography>
            </Box>
          ))
        )}
        {notifications.length > 0 && (
          <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <Button size="small" onClick={() => { navigate('/notifications'); setNotifAnchor(null); }}>
              Voir toutes les notifications
            </Button>
          </Box>
        )}
      </Menu>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 320, borderTopRightRadius: 24, borderBottomRightRadius: 24 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;