import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
  Checkbox,
  FormControlLabel,
  Avatar,
  Grid,
  useTheme,
  Fade,
  Zoom,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Visibility, VisibilityOff, Email, Lock, Login as LoginIcon } from '@mui/icons-material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { login } from '../store/authSlice';
import { RootState } from '../store/index';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(0,191,165,0.2)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #00BFA5, #0D47A1, #00BFA5)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 4px 12px rgba(0,191,165,0.1)',
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 4px 20px rgba(0,191,165,0.2)',
      '& fieldset': {
        borderColor: '#00BFA5',
        borderWidth: 2,
      },
    },
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5),
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0,191,165,0.3)',
  },
  '&:disabled': {
    background: alpha(theme.palette.grey[500], 0.3),
  },
}));

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,191,165,0.1) 0%, transparent 70%)',
    animation: 'float 20s ease-in-out infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(13,71,161,0.1) 0%, transparent 70%)',
    animation: 'float 15s ease-in-out infinite reverse',
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translate(0, 0)' },
    '50%': { transform: 'translate(30px, -30px)' },
  },
});

const FloatingIcon = styled(Box)({
  position: 'absolute',
  opacity: 0.05,
  color: '#00BFA5',
});

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(login(formData) as any);
      if (login.fulfilled.match(result)) {
        const userRoles = result.payload.user?.roles || [];
        
        if (userRoles.includes('ROLE_ADMIN')) {
          navigate('/admin/dashboard');
        } else if (userRoles.includes('ROLE_ORGANIZER')) {
          navigate('/organizer/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <BackgroundBox>
      {/* Floating decorative icons */}
      <FloatingIcon sx={{ top: '15%', left: '10%', transform: 'rotate(-15deg)' }}>
        <FlightTakeoffIcon sx={{ fontSize: 80 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '20%', right: '15%', transform: 'rotate(20deg)' }}>
        <FlightTakeoffIcon sx={{ fontSize: 100 }} />
      </FloatingIcon>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Zoom in timeout={800}>
          <Box>
            {/* Logo/Brand */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  letterSpacing: '-0.5px',
                }}
              >
                TripBooking
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Votre aventure commence ici
              </Typography>
            </Box>

            <Fade in timeout={1000}>
              <StyledPaper elevation={3}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                    Content de vous revoir !
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connectez-vous pour accéder à votre espace personnel
                  </Typography>
                </Box>

                {error && (
                  <Fade in>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': { color: 'error.main' }
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <StyledTextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <StyledTextField
                    fullWidth
                    label="Mot de passe"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    margin="normal"
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'text.secondary' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 2,
                    mb: 3
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{
                            color: 'text.secondary',
                            '&.Mui-checked': { color: '#00BFA5' },
                          }}
                        />
                      }
                      label="Se souvenir de moi"
                    />
                    <Link 
                      to="/forgot-password" 
                      style={{ 
                        textDecoration: 'none', 
                        color: '#00BFA5',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    >
                      Mot de passe oublié ?
                    </Link>
                  </Box>

                  <GradientButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    endIcon={!loading && <LoginIcon />}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
                  </GradientButton>

                  <Box textAlign="center" sx={{ mt: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Pas encore de compte ?{' '}
                      <Link 
                        to="/register" 
                        style={{ 
                          textDecoration: 'none', 
                          color: '#00BFA5',
                          fontWeight: 600,
                          transition: 'color 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#0D47A1'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#00BFA5'}
                      >
                        Créer un compte
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </StyledPaper>
            </Fade>

            {/* Footer note */}
            <Typography 
              variant="body2" 
              align="center" 
              sx={{ mt: 3, color: 'text.secondary' }}
            >
              En vous connectant, vous acceptez nos conditions d'utilisation
            </Typography>
          </Box>
        </Zoom>
      </Container>
    </BackgroundBox>
  );
};

export default Login;