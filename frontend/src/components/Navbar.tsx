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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookingsIcon from '@mui/icons-material/Book';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LogoutIcon from '@mui/icons-material/Logout';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ExploreIcon from '@mui/icons-material/Explore';
import { logout } from '../store/authSlice';
import { RootState } from '../store';

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

  // Handle scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.scrollTo) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(item.scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(item.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(item.path);
    }
  };

    const menuItems = [
    { label: 'Voyages', path: '/trips', icon: <FlightTakeoffIcon />, key: 'voyages' },
    { label: 'À propos', path: '/', icon: <FlightTakeoffIcon />, key: 'about' },
    { label: 'Contact', path: '/', icon: <FlightTakeoffIcon />, scrollTo: 'footer', key: 'contact' },
  ];

  const userMenuItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Mes réservations', path: '/bookings', icon: <BookingsIcon /> },
  ];

  const organizerMenuItems = [
    { label: 'Dashboard', path: '/organizer/dashboard', icon: <DashboardIcon /> },
    { label: 'Mes voyages', path: '/organizer/trips', icon: <FlightTakeoffIcon /> },
    { label: 'Réservations', path: '/organizer/bookings', icon: <BookingsIcon /> },
  ];

  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <AdminPanelSettingsIcon /> },
    { label: 'Utilisateurs', path: '/admin/users', icon: <AccountCircleIcon /> },
    { label: 'Organisateurs', path: '/admin/organizers', icon: <BusinessCenterIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          TripBooking
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.key}
            onClick={() => { 
              if (item.scrollTo) {
                handleMenuItemClick(item);
              } else {
                navigate(item.path); 
              }
              handleDrawerToggle(); 
            }}
            sx={{
              '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.08)' },
              py: 1.5,
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? '#00BFA5' : 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{ '& .MuiTypography-root': { fontWeight: isActive(item.path) ? 600 : 400 } }}
            />
          </ListItem>
        ))}

        {token && user && (
          <>
            <Divider sx={{ my: 1 }} />
            {userMenuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                onClick={() => { navigate(item.path); handleDrawerToggle(); }}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.08)' },
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? '#00BFA5' : 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{ '& .MuiTypography-root': { fontWeight: isActive(item.path) ? 600 : 400 } }}
                />
              </ListItem>
            ))}

            {user.roles?.includes('ROLE_ORGANIZER') && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Organisateur
                  </Typography>
                </Box>
                {organizerMenuItems.map((item) => (
                  <ListItem
                    button
                    key={item.path}
                    onClick={() => { navigate(item.path); handleDrawerToggle(); }}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.08)' },
                      py: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? '#00BFA5' : 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{ '& .MuiTypography-root': { fontWeight: isActive(item.path) ? 600 : 400 } }}
                    />
                  </ListItem>
                ))}
              </>
            )}

            {user.roles?.includes('ROLE_ADMIN') && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Administration
                  </Typography>
                </Box>
                {adminMenuItems.map((item) => (
                  <ListItem
                    button
                    key={item.path}
                    onClick={() => { navigate(item.path); handleDrawerToggle(); }}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.08)' },
                      py: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? '#00BFA5' : 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{ '& .MuiTypography-root': { fontWeight: isActive(item.path) ? 600 : 400 } }}
                    />
                  </ListItem>
                ))}
              </>
            )}

            <Divider sx={{ my: 1 }} />
            <ListItem
              button
              onClick={() => { handleLogout(); handleDrawerToggle(); }}
              sx={{
                '&:hover': { backgroundColor: 'rgba(255, 109, 0, 0.08)' },
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: '#FF6D00', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" sx={{ '& .MuiTypography-root': { color: '#FF6D00' } }} />
            </ListItem>
          </>
        )}
      </List>

      {!token && (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => { navigate('/login'); handleDrawerToggle(); }}
            sx={{ mb: 1 }}
          >
            Connexion
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => { navigate('/register'); handleDrawerToggle(); }}
          >
            S'inscrire
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          backgroundColor: scrolled 
            ? 'rgba(255, 255, 255, 0.85)' 
            : location.pathname === '/' 
              ? 'transparent' 
              : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled 
            ? '0 4px 30px rgba(0, 0, 0, 0.1)' 
            : 'none',
          borderBottom: scrolled 
            ? '1px solid rgba(255, 255, 255, 0.3)' 
            : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 4,
              display: { xs: 'none', md: 'block' },
            }}
          >
            TripBooking
          </Typography>

          {/* Mobile logo - always visible */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'block', md: 'none' },
            }}
          >
            TripBooking
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.key}
                  component={Link}
                  to={item.scrollTo ? '#' + item.scrollTo : item.path}
                  onClick={item.scrollTo ? (e) => {
                    e.preventDefault();
                    handleMenuItemClick(item);
                  } : undefined}
                  sx={{
                    color: location.pathname === '/' && !scrolled 
                      ? 'white' 
                      : isActive(item.path) 
                        ? 'primary.main' 
                        : 'text.secondary',
                    fontWeight: isActive(item.path) ? 600 : 400,
                    '&:hover': { 
                      backgroundColor: location.pathname === '/' && !scrolled 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0, 191, 165, 0.08)' 
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {token ? (
              <>
                {!isMobile && (
                  <>
                    {user?.roles?.includes('ROLE_ORGANIZER') && (
                      <Button
                        component={Link}
                        to="/organizer/dashboard"
                        sx={{
                          color: isActive('/organizer/dashboard') ? 'primary.main' : 'text.secondary',
                          fontWeight: isActive('/organizer/dashboard') ? 600 : 400,
                        }}
                      >
                        Organisateur
                      </Button>
                    )}
                    {user?.roles?.includes('ROLE_ADMIN') && (
                      <Button
                        component={Link}
                        to="/admin/dashboard"
                        sx={{
                          color: isActive('/admin/dashboard') ? 'primary.main' : 'text.secondary',
                          fontWeight: isActive('/admin/dashboard') ? 600 : 400,
                        }}
                      >
                        Admin
                      </Button>
                    )}
                  </>
                )}
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  sx={{ ml: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: 'secondary.main',
                      fontSize: '0.9rem',
                    }}
                  >
                    {user?.first_name?.[0] || <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      boxShadow: '0px 4px 20px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user?.first_name} {user?.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                    <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                    Tableau de bord
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/bookings'); handleClose(); }}>
                    <ListItemIcon><BookingsIcon fontSize="small" /></ListItemIcon>
                    Mes réservations
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: '#FF6D00' }}>
                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#FF6D00' }} /></ListItemIcon>
                    Déconnexion
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {!isMobile && (
                  <>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/login"
                      sx={{
                        color: location.pathname === '/' && !scrolled ? 'white' : 'text.secondary',
                        '&:hover': { 
                          backgroundColor: location.pathname === '/' && !scrolled 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0, 191, 165, 0.08)' 
                        },
                      }}
                    >
                      Connexion
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/register"
                    >
                      S'inscrire
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;