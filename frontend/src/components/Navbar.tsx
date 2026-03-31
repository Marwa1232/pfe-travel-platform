import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  Badge,
  Tooltip,
  Fade,
  Zoom,
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
import { logout } from '../store/authSlice';
import { RootState } from '../store';

interface MenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  key: string;
  scrollTo?: string;
}

// Styled components
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'scrolled' && prop !== 'isTransparent',
})<{ scrolled: boolean; isTransparent: boolean }>(({ theme, scrolled, isTransparent }) => ({
  backgroundColor: scrolled 
    ? alpha(theme.palette.background.paper, 0.85)
    : isTransparent 
      ? 'transparent' 
      : alpha(theme.palette.background.paper, 0.95),
  backdropFilter: scrolled ? 'blur(20px)' : 'none',
  boxShadow: scrolled 
    ? '0 4px 30px rgba(0, 0, 0, 0.1)' 
    : 'none',
  borderBottom: scrolled 
    ? `1px solid ${alpha(theme.palette.primary.main, 0.1)}` 
    : 'none',
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
  fontSize: '1rem',
  textTransform: 'none',
  position: 'relative',
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '30%',
    height: 3,
    borderRadius: 3,
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease',
  } : {},
  '&:hover': { 
    backgroundColor: transparent 
      ? alpha(theme.palette.common.white, 0.1) 
      : alpha(theme.palette.primary.main, 0.08),
    color: transparent 
      ? theme.palette.common.white 
      : theme.palette.primary.main,
    '&::after': {
      width: '30%',
    },
  },
  '& .MuiButton-startIcon': {
    color: active 
      ? theme.palette.primary.main 
      : transparent 
        ? theme.palette.common.white 
        : theme.palette.primary.main,
    marginRight: theme.spacing(1),
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

// Logo avec police Arizonia et taille augmentée
const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Arizonia", cursive',
  fontWeight: 400,
  fontSize: '2.5rem',  // Taille agrandie
  background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  // Ajustement pour les petits écrans si nécessaire
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  '&:hover': {
    transform: 'scale(1.1)',
    borderColor: theme.palette.primary.main,
  },
}));

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Gestion du scroll pour l'effet glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = location.pathname === '/' && !scrolled;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  const handleMenuItemClick = (item: MenuItem) => {
    const scrollTarget = item.scrollTo;
    if (scrollTarget) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(scrollTarget);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(scrollTarget);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(item.path);
    }
    handleDrawerToggle();
  };

  // Menu principal sans icônes
  const menuItems: MenuItem[] = [
    { label: 'Voyages', path: '/trips', key: 'voyages' },
    { label: 'À propos', path: '/about', key: 'about' },
    { label: 'Contact', path: '/', key: 'contact', scrollTo: 'footer' },
  ];

  // Items pour utilisateurs normaux (avec icônes)
  const userMenuItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Mes réservations', path: '/bookings', icon: <BookOnlineIcon /> },
    { label: 'Mes favoris', path: '/saved', icon: <FavoriteIcon /> },
    { label: 'Paramètres', path: '/settings', icon: <SettingsIcon /> },
  ];

  // Items pour organisateurs
  const organizerMenuItems = [
    { label: 'Dashboard Organisateur', path: '/organizer/dashboard', icon: <DashboardIcon /> },
    { label: 'Mes voyages', path: '/organizer/trips', icon: <FlightTakeoffIcon /> },
    { label: 'Réservations', path: '/organizer/bookings', icon: <BookOnlineIcon /> },
    { label: 'Paramètres', path: '/settings', icon: <SettingsIcon /> },
  ];

  // Items pour admins
  const adminMenuItems = [
    { label: 'Dashboard Admin', path: '/admin/dashboard', icon: <AdminPanelSettingsIcon /> },
    { label: 'Utilisateurs', path: '/admin/users', icon: <AccountCircleIcon /> },
    { label: 'Organisateurs', path: '/admin/organizers', icon: <BusinessCenterIcon /> },
    { label: 'Paramètres', path: '/settings', icon: <SettingsIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LogoText variant="h5" onClick={() => navigate('/')}>
          TripBooking
        </LogoText>
        <IconButton onClick={handleDrawerToggle}>
          <MenuIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.key}
            onClick={() => handleMenuItemClick(item)}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive(item.path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.12) },
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ 
                color: isActive(item.path) ? '#00BFA5' : 'primary.main',
                minWidth: 40 
              }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? 600 : 400,
                color: isActive(item.path) ? 'primary.main' : 'text.primary',
              }}
            />
          </ListItem>
        ))}

        {token && user && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* Informations utilisateur dans le drawer */}
            <Box sx={{ px: 2, py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Menu selon le rôle */}
            {!user?.roles?.includes('ROLE_ORGANIZER') && !user?.roles?.includes('ROLE_ADMIN') ? (
              // Utilisateur normal
              userMenuItems.map((item) => (
                <ListItem
                  button
                  key={item.path}
                  onClick={() => { navigate(item.path); handleDrawerToggle(); }}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    backgroundColor: isActive(item.path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.12) },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive(item.path) ? '#00BFA5' : 'primary.main',
                    minWidth: 40 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 600 : 400,
                      color: isActive(item.path) ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItem>
              ))
            ) : null}

            {/* Espace Organisateur */}
            {user?.roles?.includes('ROLE_ORGANIZER') && (
              <>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Espace Organisateur
                  </Typography>
                </Box>
                {organizerMenuItems.map((item) => (
                  <ListItem
                    button
                    key={item.path}
                    onClick={() => { navigate(item.path); handleDrawerToggle(); }}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      backgroundColor: isActive(item.path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.12) },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isActive(item.path) ? '#00BFA5' : 'primary.main',
                      minWidth: 40 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive(item.path) ? 600 : 400,
                        color: isActive(item.path) ? 'primary.main' : 'text.primary',
                      }}
                    />
                  </ListItem>
                ))}
              </>
            )}

            {/* Administration */}
            {user?.roles?.includes('ROLE_ADMIN') && (
              <>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Administration
                  </Typography>
                </Box>
                {adminMenuItems.map((item) => (
                  <ListItem
                    button
                    key={item.path}
                    onClick={() => { navigate(item.path); handleDrawerToggle(); }}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      backgroundColor: isActive(item.path) ? alpha(theme.palette.error.main, 0.08) : 'transparent',
                      '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.12) },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isActive(item.path) ? 'error.main' : 'error.main',
                      minWidth: 40 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive(item.path) ? 600 : 400,
                        color: isActive(item.path) ? 'error.main' : 'error.main',
                      }}
                    />
                  </ListItem>
                ))}
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <ListItem
              button
              onClick={() => { handleLogout(); handleDrawerToggle(); }}
              sx={{
                borderRadius: 2,
                mx: 1,
                backgroundColor: alpha('#FF6D00', 0.08),
                '&:hover': { backgroundColor: alpha('#FF6D00', 0.12) },
              }}
            >
              <ListItemIcon sx={{ color: '#FF6D00', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Déconnexion"
                primaryTypographyProps={{ fontWeight: 600, color: '#FF6D00' }}
              />
            </ListItem>
          </>
        )}
      </List>

      {!token && (
        <Box sx={{ p: 2, position: 'absolute', bottom: 0, width: '100%' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => { navigate('/login'); handleDrawerToggle(); }}
            sx={{ 
              mb: 1,
              background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
              borderRadius: 2,
              py: 1.5,
            }}
          >
            Connexion
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => { navigate('/register'); handleDrawerToggle(); }}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              borderColor: '#00BFA5',
              color: '#00BFA5',
            }}
          >
            S'inscrire
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <StyledAppBar 
        position="fixed" 
        elevation={0}
        scrolled={scrolled}
        isTransparent={isTransparent}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Menu mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                color: isTransparent ? 'white' : 'text.primary',
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo avec police Arizonia et taille agrandie */}
          <LogoText
            variant="h5"
            onClick={() => navigate('/')}
            sx={{ 
              flexGrow: isMobile ? 1 : 0,
              display: { xs: 'block', md: 'block' },
              cursor: 'pointer',
            }}
          >
            TripBooking
          </LogoText>

          {/* Menu desktop (sans icônes) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, ml: 4 }}>
              {menuItems.map((item) => (
                <NavButton
                  key={item.key}
                  onClick={item.scrollTo ? (e) => {
                    e.preventDefault();
                    handleMenuItemClick(item);
                  } : () => navigate(item.path)}
                  active={isActive(item.path)}
                  transparent={isTransparent}
                  startIcon={item.icon}
                  sx={{ px: 2 }}
                >
                  {item.label}
                </NavButton>
              ))}
            </Box>
          )}

          {/* Partie droite : menu utilisateur */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {token && user ? (
              <>
                {/* Avatar utilisateur */}
                <Tooltip title="Menu utilisateur">
                  <IconButton
                    onClick={handleMenu}
                    sx={{ p: 0 }}
                  >
                    <UserAvatar>
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </UserAvatar>
                  </IconButton>
                </Tooltip>

                {/* Menu déroulant */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  TransitionComponent={Fade}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 240,
                      borderRadius: 3,
                      boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                      overflow: 'visible',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -8,
                        right: 14,
                        width: 16,
                        height: 16,
                        bgcolor: 'background.paper',
                        transform: 'rotate(45deg)',
                        borderTopLeftRadius: 4,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {/* Informations utilisateur */}
                  <Box sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {user?.first_name} {user?.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Menu selon le rôle */}
                  {!user?.roles?.includes('ROLE_ORGANIZER') && !user?.roles?.includes('ROLE_ADMIN') && (
                    <Box>
                      <StyledMenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                        <ListItemIcon><DashboardIcon fontSize="small" sx={{ color: '#00BFA5' }} /></ListItemIcon>
                        <ListItemText>Tableau de bord</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/bookings'); handleClose(); }}>
                        <ListItemIcon><BookOnlineIcon fontSize="small" sx={{ color: '#00BFA5' }} /></ListItemIcon>
                        <ListItemText>Mes réservations</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/saved'); handleClose(); }}>
                        <ListItemIcon><FavoriteIcon fontSize="small" sx={{ color: '#00BFA5' }} /></ListItemIcon>
                        <ListItemText>Mes favoris</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                        <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} /></ListItemIcon>
                        <ListItemText>Paramètres</ListItemText>
                      </StyledMenuItem>
                    </Box>
                  )}

                  {user?.roles?.includes('ROLE_ORGANIZER') && (
                    <Box>
                      <StyledMenuItem onClick={() => { navigate('/organizer/dashboard'); handleClose(); }}>
                        <ListItemIcon><DashboardIcon fontSize="small" sx={{ color: '#00BFA5' }} /></ListItemIcon>
                        <ListItemText>Dashboard organisateur</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/organizer/trips'); handleClose(); }}>
                        <ListItemIcon><FlightTakeoffIcon fontSize="small" sx={{ color: '#00BFA5' }} /></ListItemIcon>
                        <ListItemText>Mes voyages</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/organizer/bookings'); handleClose(); }}>
                        <ListItemIcon><BookOnlineIcon fontSize="small" sx={{ color: '#00BFA5' }} /></ListItemIcon>
                        <ListItemText>Réservations reçues</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                        <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} /></ListItemIcon>
                        <ListItemText>Paramètres</ListItemText>
                      </StyledMenuItem>
                    </Box>
                  )}

                  {user?.roles?.includes('ROLE_ADMIN') && (
                    <Box>
                      <StyledMenuItem onClick={() => { navigate('/admin/dashboard'); handleClose(); }}>
                        <ListItemIcon><AdminPanelSettingsIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                        <ListItemText>Dashboard admin</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/admin/users'); handleClose(); }}>
                        <ListItemIcon><AccountCircleIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                        <ListItemText>Utilisateurs</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/admin/organizers'); handleClose(); }}>
                        <ListItemIcon><BusinessCenterIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                        <ListItemText>Organisateurs</ListItemText>
                      </StyledMenuItem>

                      <StyledMenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                        <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} /></ListItemIcon>
                        <ListItemText>Paramètres</ListItemText>
                      </StyledMenuItem>
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <StyledMenuItem onClick={handleLogout} sx={{ color: '#FF6D00' }}>
                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#FF6D00' }} /></ListItemIcon>
                    <ListItemText>Déconnexion</ListItemText>
                  </StyledMenuItem>
                </Menu>
              </>
            ) : (
              <>
                {!isMobile && (
                  <Zoom in>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        onClick={() => navigate('/login')}
                        sx={{
                          color: isTransparent ? 'white' : 'text.primary',
                          borderColor: isTransparent ? 'white' : 'transparent',
                          '&:hover': { 
                            backgroundColor: isTransparent 
                              ? alpha(theme.palette.common.white, 0.1) 
                              : alpha(theme.palette.primary.main, 0.08),
                            color: isTransparent ? 'white' : 'primary.main',
                          },
                        }}
                      >
                        Connexion
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/register')}
                        sx={{
                          background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                          borderRadius: 2,
                          px: 3,
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
                          },
                        }}
                      >
                        S'inscrire
                      </Button>
                    </Box>
                  </Zoom>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Drawer mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 320,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;