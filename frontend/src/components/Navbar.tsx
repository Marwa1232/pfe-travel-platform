import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Menu, MenuItem, Avatar, Drawer, List, ListItem,
  ListItemIcon, ListItemText, Divider, useMediaQuery,
  useTheme, Tooltip, Fade, TextField, InputAdornment,
  Grid, Paper, Badge,
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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import { logout } from '../store/authSlice';
import { RootState } from '../store';
import { fixImageUrl } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────
interface Destination { id: number; name: string; country: string; region?: string; }
interface Category    { id: number; name: string; typeId?: string; }

const CATEGORY_TO_TYPE: Record<string, string> = {
  'Adventure': 'aventure', 'Aventure & Randonnée': 'aventure', 'Randonnée': 'aventure',
  'Culturel': 'culturel', 'Culturel & Historique': 'culturel', 'Historique': 'culturel',
  'Plage': 'plage', 'Plage & Relaxation': 'plage', 'Relaxation': 'plage',
  'Désert': 'desert', 'Désert & Safari': 'desert', 'Safari': 'desert',
  'Gastronomie': 'gastro', 'Wellness': 'wellness', 'Wellness & Spa': 'wellness',
  'Spa': 'wellness', 'Détente': 'wellness', 'Bien-être': 'wellness',
};

// ─── Couleurs ─────────────────────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  slate: '#64748B',
  ink: '#0F172A',
  white: '#FFFFFF',
  border: '#E2E8F0',
  red: '#DC2626',
  green: '#16A34A',
};

// ─── Styled ───────────────────────────────────────────────────────
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: p => p !== 'scrolled' && p !== 'isTransparent',
})<{ scrolled: boolean; isTransparent: boolean }>(({ theme, scrolled, isTransparent }) => ({
  backgroundColor: scrolled
    ? alpha(COLORS.white, 0.92)
    : isTransparent ? 'transparent' : alpha(COLORS.white, 0.97),
  backdropFilter: scrolled ? 'blur(20px)' : 'none',
  boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
  borderBottom: scrolled ? `1px solid ${alpha(COLORS.teal, 0.1)}` : 'none',
  transition: 'all 0.4s ease',
}));

const NavButton = styled(Button, {
  shouldForwardProp: p => p !== 'active' && p !== 'transparent',
})<{ active?: boolean; transparent?: boolean }>(({ theme, active, transparent }) => ({
  color: transparent && !active ? COLORS.white : active ? COLORS.teal : '#1a1a2e',
  fontWeight: active ? 700 : 500,
  fontSize: '0.9rem',
  textTransform: 'none',
  padding: '6px 12px',
  minWidth: 'auto',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: transparent ? alpha(COLORS.white, 0.15) : alpha(COLORS.teal, 0.08),
    color: transparent ? COLORS.white : COLORS.teal,
  },
  '&::after': {
    content: active ? '""' : 'none',
    position: 'absolute', bottom: 0, left: '12px', right: '12px',
    height: '2px', backgroundColor: COLORS.teal, borderRadius: '2px',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: 10,
  margin: '3px 8px',
  padding: '9px 14px',
  transition: 'all 0.18s ease',
  '&:hover': {
    backgroundColor: alpha(COLORS.teal, 0.07),
    transform: 'translateX(4px)',
    '& .MuiListItemIcon-root': { color: COLORS.teal },
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Arizonia", cursive',
  fontWeight: 400, fontSize: '2.55rem',
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  cursor: 'pointer', transition: 'transform 0.3s ease',
  '&:hover': { transform: 'scale(1.02)' },
  [theme.breakpoints.down('sm')]: { fontSize: '2rem' },
}));

const UserAvatar = styled(Avatar, {
  shouldForwardProp: p => p !== 'hasCustomImage',
})<{ hasCustomImage?: boolean }>(({ hasCustomImage }) => ({
  width: 42, height: 42, cursor: 'pointer',
  borderRadius: '50% !important',
  overflow: 'hidden !important',
  border: '2px solid transparent',
  transition: 'all 0.3s ease',
  background: hasCustomImage ? 'transparent' : `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy}) !important`,
  '&:hover': { border: `2px solid ${COLORS.teal}`, transform: 'scale(1.05)' },
  '& .MuiAvatar-img': { borderRadius: '50% !important', objectFit: 'cover' },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 30, height: 40, fontSize: '0.85rem',
    backgroundColor: alpha(COLORS.white, 0.92), backdropFilter: 'blur(10px)',
    '& fieldset': { borderColor: alpha(COLORS.teal, 0.25) },
    '&:hover fieldset': { borderColor: COLORS.teal },
    '&.Mui-focused fieldset': { borderColor: COLORS.teal, borderWidth: 1.5 },
  },
  '& input': { padding: '8px 0 8px 12px' },
}));

const DropdownPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 12px 48px rgba(15,45,92,0.12)',
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  overflow: 'visible',
  padding: theme.spacing(3, 4),
  marginTop: theme.spacing(1),
}));

const DestLink = styled(Box)(() => ({
  fontSize: '0.88rem', color: COLORS.slate, cursor: 'pointer',
  padding: '4px 0', transition: 'color 0.15s ease',
  '&:hover': { color: COLORS.teal },
}));

const CountryHeader = styled(Typography)(() => ({
  fontWeight: 700, fontSize: '0.92rem', color: COLORS.navy,
  marginBottom: 8, letterSpacing: '-0.01em',
}));

const StyleItem = styled(Box)(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: theme.spacing(1.5),
  padding: theme.spacing(1, 1.5), borderRadius: 10,
  transition: 'all 0.18s ease',
  '& .style-label': { fontSize: '0.88rem', color: '#374151', fontWeight: 450 },
  '&:hover': {
    backgroundColor: alpha(COLORS.teal, 0.07),
    '& .style-label': { color: COLORS.teal },
  },
}));

// ─── Component ────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useSelector((state: RootState) => state.auth);

  const userAny        = user as any;
  const profilePhotoUrl = userAny?.profile_photo_url ? fixImageUrl(userAny.profile_photo_url) : null;
  const hasCustomPhoto  = Boolean(profilePhotoUrl);

  // ── Role helpers ──
  const isAdmin     = user?.roles?.includes('ROLE_ADMIN');
  const isOrganizer = user?.roles?.includes('ROLE_ORGANIZER');
  const isUser      = token && !isAdmin && !isOrganizer;

  const [anchorEl,           setAnchorEl]           = useState<null | HTMLElement>(null);
  const [notifAnchor,        setNotifAnchor]        = useState<null | HTMLElement>(null);
  const [mobileOpen,         setMobileOpen]         = useState(false);
  const [scrolled,           setScrolled]           = useState(false);
  const [destinationsAnchor, setDestinationsAnchor] = useState<null | HTMLElement>(null);
  const [stylesAnchor,       setStylesAnchor]       = useState<null | HTMLElement>(null);
  const [destinations,       setDestinations]       = useState<Destination[]>([]);
  const [categories,         setCategories]         = useState<Category[]>([]);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [notifications,      setNotifications]      = useState<any[]>([]);
  const [unreadCount,        setUnreadCount]        = useState(0);

  const isTransparent = location.pathname === '/' && !scrolled;
  const showSearchBar = location.pathname !== '/' || scrolled;

  const groupedDestinations = React.useMemo(() => {
    const groups: { [country: string]: string[] } = {};
    destinations.forEach(dest => {
      if (!dest.country) return;
      if (!groups[dest.country]) groups[dest.country] = [];
      if (!groups[dest.country].includes(dest.name)) groups[dest.country].push(dest.name);
    });
    return Object.keys(groups).sort().map(country => ({ country, cities: groups[country].sort() }));
  }, [destinations]);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, c] = await Promise.all([
          fetch('http://localhost:8000/api/destinations').then(r => r.json()),
          fetch('http://localhost:8000/api/categories').then(r => r.json()),
        ]);
        setDestinations(d['hydra:member'] || d);
        setCategories(c['hydra:member'] || c);
      } catch {
        setDestinations([
          { id: 1, name: 'Tunis', country: 'Tunisie' },
          { id: 2, name: 'Sousse', country: 'Tunisie' },
          { id: 3, name: 'Djerba', country: 'Tunisie' },
        ]);
        setCategories([
          { id: 1, name: 'Aventure & Randonnée' }, { id: 2, name: 'Culturel & Historique' },
          { id: 3, name: 'Plage & Relaxation' },   { id: 4, name: 'Désert & Safari' },
          { id: 5, name: 'Gastronomie' },           { id: 6, name: 'Wellness & Spa' },
        ]);
      }
    };
    load();
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
        localStorage.removeItem('token'); localStorage.removeItem('user');
        window.location.href = '/login'; return;
      }
      if (!res.ok) return;
      const data = await res.json();
      const notifs = Array.isArray(data) ? data : data['hydra:member'] || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
    } catch { }
  };

  useEffect(() => {
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 10000);
    return () => clearInterval(iv);
  }, [token]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch { }
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

  // ── Menu items ────────────────────────────────────────────────
  const guestMenuItems = [
    { label: 'Connexion',   path: '/login',    icon: <LoginIcon /> },
    { label: 'Inscription', path: '/register', icon: <AppRegistrationIcon /> },
    { label: 'À propos',    path: '/about',    icon: <InfoIcon /> },
  ];
  const userMenuItems = [
    { label: 'Tableau de bord',  path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Mes réservations', path: '/bookings',  icon: <BookOnlineIcon /> },
    { label: 'Mes favoris',      path: '/saved',     icon: <FavoriteIcon /> },
    { label: 'Offres fidélité',  path: '/LoyaltyOffresPage',    icon: <EmojiEventsIcon /> },
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
    { label: 'Dashboard Admin',  path: '/admin/dashboard',  icon: <AdminPanelSettingsIcon /> },
    { label: 'Utilisateurs',     path: '/admin/users',      icon: <AccountCircleIcon /> },
    { label: 'Organisateurs',    path: '/admin/organizers', icon: <BusinessCenterIcon /> },
    { label: 'Paramètres',       path: '/settings',         icon: <SettingsIcon /> },
  ];

  // ── Mobile drawer ─────────────────────────────────────────────
  const drawer = (
    <Box sx={{ width: 300, height: '100%', bgcolor: COLORS.white, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
        <LogoText onClick={() => { navigate('/'); setMobileOpen(false); }}>TripBooking</LogoText>
        <IconButton onClick={() => setMobileOpen(false)} size="small"
          sx={{ color: COLORS.slate, '&:hover': { color: COLORS.teal } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {/* Destinations */}
        <ListItem sx={{ py: 1.5 }}>
          <ListItemText primary="Destinations"
            primaryTypographyProps={{ fontWeight: 700, color: COLORS.navy, fontSize: '0.85rem',
              textTransform: 'uppercase', letterSpacing: 1 }} />
        </ListItem>
        {groupedDestinations.map(group => (
          <Box key={group.country} sx={{ px: 2.5, mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: COLORS.teal, mb: 0.5,
              textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {group.country}
            </Typography>
            {group.cities.map(city => (
              <Box key={city} onClick={() => { navigate(`/trips?destination=${encodeURIComponent(city)}`); setMobileOpen(false); }}
                sx={{ py: '4px', cursor: 'pointer', fontSize: '0.87rem', color: COLORS.slate,
                  '&:hover': { color: COLORS.teal }, transition: 'color 0.15s' }}>
                {city}
              </Box>
            ))}
          </Box>
        ))}

        <Divider sx={{ my: 1, borderColor: alpha(COLORS.teal, 0.1) }} />

        {/* Styles de voyage - NON CLIQUABLES (juste affichage) */}
        <ListItem sx={{ py: 1.5 }}>
          <ListItemText primary="Styles de voyage"
            primaryTypographyProps={{ fontWeight: 700, color: COLORS.navy, fontSize: '0.85rem',
              textTransform: 'uppercase', letterSpacing: 1 }} />
        </ListItem>
        {categories.map(cat => (
          <ListItem key={cat.id} sx={{ py: 0.6, px: 2.5 }}>
            <ListItemText 
              primary={cat.name} 
              primaryTypographyProps={{ 
                fontSize: '0.87rem', 
                color: COLORS.slate,
              }} 
            />
          </ListItem>
        ))}

        <Divider sx={{ my: 1, borderColor: alpha(COLORS.teal, 0.1) }} />

        <ListItem button onClick={() => handleNavClick('/moments')}
          sx={{ px: 2.5, '&:hover': { bgcolor: alpha(COLORS.teal, 0.06) } }}>
          <ListItemText primary="Moments" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
        </ListItem>

        {isUser && (
          <ListItem button onClick={() => handleNavClick('/LoyaltyOffresPage')}
            sx={{ px: 2.5, '&:hover': { bgcolor: alpha(COLORS.amber, 0.06) } }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <EmojiEventsIcon sx={{ fontSize: 18, color: COLORS.amber }} />
            </ListItemIcon>
            <ListItemText primary="Offres fidélité"
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.amber }} />
          </ListItem>
        )}

        {!token && (
          <Box sx={{ p: 2.5, mt: 1 }}>
            <Button fullWidth variant="contained" onClick={() => { navigate('/login'); setMobileOpen(false); }}
              sx={{ mb: 1.2, background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
                borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}>
              Connexion
            </Button>
            <Button fullWidth variant="outlined" onClick={() => { navigate('/register'); setMobileOpen(false); }}
              sx={{ borderRadius: 2.5, borderColor: COLORS.teal, color: COLORS.teal,
                textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: alpha(COLORS.teal, 0.06) } }}>
              Inscription
            </Button>
          </Box>
        )}
      </List>
    </Box>
  );

  // ─── Render ───────────────────────────────────────────────────
  return (
    <>
      <StyledAppBar position="fixed" elevation={0} scrolled={scrolled} isTransparent={isTransparent} color="transparent">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, minHeight: '64px !important' }}>

          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}
              sx={{ color: isTransparent ? COLORS.white : COLORS.navy }}>
              <MenuIcon />
            </IconButton>
          )}

          <LogoText onClick={() => navigate('/')} sx={{ flexGrow: isMobile ? 1 : 0 }}>
            TripBooking
          </LogoText>

          {/* Search */}
          {!isMobile && showSearchBar && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 2 }}>
              <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: 300 }}>
                <SearchField fullWidth placeholder="Rechercher..." size="small"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: COLORS.teal, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }} />
              </form>
            </Box>
          )}

          {/* Desktop links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

              {/* Destinations dropdown - cliquable */}
              <NavButton transparent={isTransparent} active={isActive('/destinations')}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', transition: 'transform 0.2s',
                  transform: Boolean(destinationsAnchor) ? 'rotate(180deg)' : 'none' }} />}
                onClick={e => setDestinationsAnchor(e.currentTarget)}>
                Destinations
              </NavButton>

              <Menu anchorEl={destinationsAnchor} open={Boolean(destinationsAnchor)}
                onClose={() => setDestinationsAnchor(null)} TransitionComponent={Fade}
                PaperProps={{ component: DropdownPaper, sx: { mt: 1 } }}
                MenuListProps={{ disablePadding: true }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.navy, mb: 2.5 }}>
                  Destinations
                </Typography>
                <Grid container spacing={4} sx={{ minWidth: Math.min(groupedDestinations.length, 4) * 180 + 100 }}>
                  {groupedDestinations.map(group => (
                    <Grid item key={group.country}>
                      <CountryHeader>{group.country}</CountryHeader>
                      {group.cities.slice(0, 6).map(city => (
                        <DestLink key={city}
                          onClick={() => { navigate(`/trips?destination=${encodeURIComponent(city)}`); setDestinationsAnchor(null); }}>
                          {city}
                        </DestLink>
                      ))}
                    </Grid>
                  ))}
                </Grid>
              </Menu>

              {/* Styles dropdown - NON CLIQUABLE (affichage seulement) */}
              <NavButton transparent={isTransparent}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', transition: 'transform 0.2s',
                  transform: Boolean(stylesAnchor) ? 'rotate(180deg)' : 'none' }} />}
                onClick={e => setStylesAnchor(e.currentTarget)}>
                Styles de voyage
              </NavButton>

              <Menu anchorEl={stylesAnchor} open={Boolean(stylesAnchor)}
                onClose={() => setStylesAnchor(null)} TransitionComponent={Fade}
                PaperProps={{ component: DropdownPaper, sx: { mt: 1 } }}
                MenuListProps={{ disablePadding: true }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box sx={{ width: 220, flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.navy, mb: 1.5 }}>
                      Styles de voyage
                    </Typography>
                    <Typography sx={{ fontSize: '0.83rem', color: COLORS.slate, lineHeight: 1.65, mb: 2.5 }}>
                      Lancez-vous à corps perdu ou avancez à pas feutrés… Optez pour un style qui vous ressemble.
                    </Typography>
                    {/* Bouton fonctionnel */}
                    <Button variant="contained" size="small"
                      onClick={() => { navigate('/travel-types?type=detente'); setStylesAnchor(null); }}
                      sx={{ borderRadius: 8, textTransform: 'none', fontWeight: 600,
                        background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
                        color: COLORS.white, fontSize: '0.82rem',
                        '&:hover': { opacity: 0.9 } }}>
                      Découvrir tous →
                    </Button>
                  </Box>
                  <Box>
                    <Grid container columns={3} sx={{ width: 520 }}>
                      {categories.slice(0, 12).map(cat => (
                        <Grid item xs={1} key={cat.id}>
                          {/* Categories NON CLIQUABLES - affichage seulement */}
                          <StyleItem sx={{ cursor: 'default' }}>
                            <Box className="style-label" sx={{ fontWeight: 500 }}>{cat.name}</Box>
                          </StyleItem>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Menu>

              <NavButton transparent={isTransparent} onClick={() => handleNavClick('/moments')}>
                Moments
              </NavButton>

              {/* Offres - SEULEMENT ROLE_USER avec couleur AMBER */}
              {isUser && (
                <Button onClick={() => handleNavClick('/LoyaltyOffresPage')}
                  startIcon={<EmojiEventsIcon sx={{ fontSize: '16px !important' }} />}
                  sx={{
                    textTransform: 'none', fontWeight: 700, fontSize: '0.88rem',
                    color: COLORS.amber,
                    backgroundColor: alpha(COLORS.amber, 0.08),
                    borderRadius: 20, px: 1.8, py: 0.6,
                    border: '1px solid', borderColor: alpha(COLORS.amber, 0.25),
                    '&:hover': { backgroundColor: alpha(COLORS.amber, 0.14) },
                  }}>
                  Offres
                </Button>
              )}

              {/* Notifications + Avatar */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
                 {token && (
                  <IconButton onClick={e => setNotifAnchor(e.currentTarget)}
                    sx={{ color: isTransparent ? COLORS.white : COLORS.navy, position: 'relative' }}>
                    <Badge badgeContent={unreadCount}
                      sx={{
                        '& .MuiBadge-badge': { 
                          fontSize: '0.65rem', 
                          minWidth: 17, 
                          height: 17,
                          backgroundColor: COLORS.amber,
                          color: COLORS.white
                        }
                      }}>
                      <NotificationsIcon sx={{ fontSize: 22 }} />
                    </Badge>
                  </IconButton>
                )}
    
                <Tooltip title={token ? `${user?.first_name} ${user?.last_name}` : 'Connexion'}>
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                    <UserAvatar hasCustomImage={hasCustomPhoto}
                      src={hasCustomPhoto && profilePhotoUrl ? profilePhotoUrl : undefined}>
                      {token && user
                        ? `${user.first_name?.[0]}${user.last_name?.[0]}`
                        : <AccountCircleIcon sx={{ fontSize: 24, color: COLORS.white }} />}
                    </UserAvatar>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}

          {/* Mobile avatar */}
          {isMobile && (
            <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
              <UserAvatar hasCustomImage={hasCustomPhoto}
                src={hasCustomPhoto && profilePhotoUrl ? profilePhotoUrl : undefined}>
                {token && user
                  ? `${user.first_name?.[0]}${user.last_name?.[0]}`
                  : <AccountCircleIcon sx={{ fontSize: 24, color: COLORS.white }} />}
              </UserAvatar>
            </IconButton>
          )}
        </Toolbar>
      </StyledAppBar>

      {/* ── Avatar menu ─────────────────────────────────────────── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{ sx: { minWidth: 240, mt: 1.5, borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(15,45,92,0.14)', border: `1px solid ${alpha(COLORS.teal, 0.1)}` } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>

        {!token ? (
          <Box sx={{ p: 1 }}>
            {guestMenuItems.map(item => (
              <StyledMenuItem key={item.path}
                onClick={() => { navigate(item.path); handleMenuClose(); }}>
                <ListItemIcon sx={{ color: COLORS.slate, minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: '0.9rem' }}>{item.label}</ListItemText>
              </StyledMenuItem>
            ))}
          </Box>
        ) : (
          <Box>
            <Box sx={{ px: 2.5, py: 2,
              background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a4a8a 100%)`,
              display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <UserAvatar hasCustomImage={hasCustomPhoto}
                src={hasCustomPhoto && profilePhotoUrl ? profilePhotoUrl : undefined}
                sx={{ width: 38, height: 38, fontSize: '0.85rem' }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </UserAvatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.white,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 1 }}>
              {isUser && userMenuItems.map(item => (
                <StyledMenuItem key={item.path}
                  onClick={() => { navigate(item.path); handleMenuClose(); }}>
                  <ListItemIcon sx={{ color: item.path === '/LoyaltyOffresPage' ? COLORS.amber : COLORS.slate, minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: item.path === '/LoyaltyOffresPage' ? 600 : 400,
                      color: item.path === '/LoyaltyOffresPage' ? COLORS.amber : 'inherit' }}>
                    {item.label}
                  </ListItemText>
                </StyledMenuItem>
              ))}

              {isOrganizer && organizerMenuItems.map(item => (
                <StyledMenuItem key={item.path}
                  onClick={() => { navigate(item.path); handleMenuClose(); }}>
                  <ListItemIcon sx={{ color: COLORS.slate, minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primaryTypographyProps={{ fontSize: '0.88rem' }}>{item.label}</ListItemText>
                </StyledMenuItem>
              ))}

              {isAdmin && adminMenuItems.map(item => (
                <StyledMenuItem key={item.path}
                  onClick={() => { navigate(item.path); handleMenuClose(); }}>
                  <ListItemIcon sx={{ color: COLORS.slate, minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primaryTypographyProps={{ fontSize: '0.88rem' }}>{item.label}</ListItemText>
                </StyledMenuItem>
              ))}

              <Divider sx={{ my: 0.5, borderColor: alpha(COLORS.teal, 0.1) }} />

              <StyledMenuItem onClick={() => { handleNavClick('/about'); handleMenuClose(); }}>
                <ListItemIcon sx={{ color: COLORS.slate, minWidth: 36 }}><InfoIcon /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: '0.88rem' }}>À propos</ListItemText>
              </StyledMenuItem>

              <Divider sx={{ my: 0.5, borderColor: alpha(COLORS.teal, 0.1) }} />

              <StyledMenuItem onClick={handleLogout}
                sx={{ '&:hover': { bgcolor: alpha(COLORS.red, 0.06), '& .MuiListItemIcon-root': { color: COLORS.red } } }}>
                <ListItemIcon sx={{ color: '#94A3B8', minWidth: 36 }}><LogoutIcon /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: '0.88rem', color: COLORS.slate }}>
                  Déconnexion
                </ListItemText>
              </StyledMenuItem>
            </Box>
          </Box>
        )}
      </Menu>

      {/* ── Notifications dropdown ─────────────────────────────── */}
      <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)} TransitionComponent={Fade}
        PaperProps={{ sx: { width: 360, maxHeight: 420, mt: 1.5, borderRadius: '16px',
          boxShadow: '0 12px 48px rgba(15,45,92,0.14)', border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
          overflow: 'hidden' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <Box sx={{ px: 2.5, py: 1.8, borderBottom: `1px solid ${alpha(COLORS.teal, 0.1)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.navy }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Box sx={{ px: 1, py: 0.2, borderRadius: 10, bgcolor: alpha(COLORS.teal, 0.1) }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: COLORS.teal }}>
                {unreadCount} non lues
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 36, color: '#E2E8F0', mb: 1 }} />
              <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>Aucune notification</Typography>
            </Box>
          ) : (
            notifications.slice(0, 10).map(notif => (
              <Box key={notif.id} onClick={() => handleMarkAsRead(notif.id)}
                sx={{
                  px: 2.5, py: 1.8, cursor: 'pointer',
                  bgcolor: notif.isRead ? 'transparent' : alpha(COLORS.teal, 0.04),
                  borderBottom: `1px solid ${alpha(COLORS.teal, 0.06)}`,
                  borderLeft: notif.isRead ? 'none' : `3px solid ${COLORS.teal}`,
                  '&:hover': { bgcolor: alpha(COLORS.teal, 0.08) },
                  transition: 'background 0.15s',
                }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: notif.isRead ? 400 : 700,
                  color: COLORS.ink, mb: 0.4 }}>
                  {notif.title}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: COLORS.slate, mb: 0.4, lineHeight: 1.5 }}>
                  {notif.message}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                  {new Date(notif.createdAt).toLocaleString('fr-FR')}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        {notifications.length > 0 && (
          <Box sx={{ p: 1.5, borderTop: `1px solid ${alpha(COLORS.teal, 0.1)}`, textAlign: 'center' }}>
            <Button size="small" onClick={() => { setNotifAnchor(null); }}
              sx={{ textTransform: 'none', color: COLORS.teal, fontWeight: 600, fontSize: '0.82rem' }}>
              Marquer tout comme lu
            </Button>
          </Box>
        )}
      </Menu>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 300, borderTopRightRadius: 24, borderBottomRightRadius: 24,
            boxShadow: '4px 0 24px rgba(15,45,92,0.12)' },
        }}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;