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
import { styled, alpha, keyframes } from '@mui/material/styles';
import { Visibility, VisibilityOff, Email, Lock, Login as LoginIcon } from '@mui/icons-material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { login } from '../store/authSlice';
import { RootState } from '../store/index';

// ─── 3 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  white: '#FFFFFF',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(10px, -15px) rotate(5deg); }
  50% { transform: translate(-5px, -25px) rotate(-5deg); }
  75% { transform: translate(15px, -10px) rotate(3deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

// ─── Styled components ──────────────────────────────────────────
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: 20,
  background: COLORS.white,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.12)}`,
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${alpha(COLORS.teal, 0.15)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.navy}, ${COLORS.teal})`,
  },
  animation: `${fadeUp} 0.6s ease-out`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: alpha(COLORS.white, 0.9),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: COLORS.white,
      boxShadow: `0 4px 12px ${alpha(COLORS.teal, 0.1)}`,
    },
    '&.Mui-focused': {
      backgroundColor: COLORS.white,
      boxShadow: `0 4px 20px ${alpha(COLORS.teal, 0.15)}`,
      '& fieldset': {
        borderColor: COLORS.teal,
        borderWidth: 2,
      },
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: COLORS.teal,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 12,
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${alpha(COLORS.teal, 0.35)}`,
  },
  '&:disabled': {
    background: alpha(COLORS.navy, 0.3),
  },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  borderColor: COLORS.teal,
  color: COLORS.teal,
  '&:hover': {
    borderColor: COLORS.navy,
    backgroundColor: alpha(COLORS.teal, 0.05),
  },
}));

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${alpha(COLORS.navy, 0.03)} 0%, ${alpha(COLORS.teal, 0.02)} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(COLORS.teal, 0.08)} 0%, transparent 70%)`,
    animation: `${float} 20s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(COLORS.navy, 0.08)} 0%, transparent 70%)`,
    animation: `${float} 15s ease-in-out infinite reverse`,
  },
});

const FloatingIcon = styled(Box)({
  position: 'absolute',
  opacity: 0.06,
  color: COLORS.teal,
  animation: `${float} 25s ease-in-out infinite`,
});

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      <FloatingIcon sx={{ top: '12%', left: '8%', transform: 'rotate(-15deg)', animationDelay: '0s' }}>
        <FlightTakeoffIcon sx={{ fontSize: 80 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '15%', right: '12%', transform: 'rotate(20deg)', animationDelay: '2s' }}>
        <FlightTakeoffIcon sx={{ fontSize: 100 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ top: '60%', left: '5%', transform: 'rotate(10deg)', animationDelay: '4s' }}>
        <FlightTakeoffIcon sx={{ fontSize: 60 }} />
      </FloatingIcon>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Zoom in timeout={800}>
          <Box>
            {/* Logo/Brand */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2.5rem', md: '3rem' },
                }}
              >
                TripBooking
              </Typography>
              <Typography variant="body1" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                Votre aventure commence ici
              </Typography>
            </Box>

            <Fade in timeout={1000}>
              <StyledPaper elevation={0}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      margin: '0 auto 16px',
                      background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
                      boxShadow: `0 8px 20px ${alpha(COLORS.teal, 0.3)}`,
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 40, color: COLORS.white }} />
                  </Avatar>
                  <Typography variant="h4" component="h1" gutterBottom fontWeight={800} sx={{ color: COLORS.navy }}>
                    Content de vous revoir !
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                    Connectez-vous pour accéder à votre espace personnel
                  </Typography>
                </Box>

                {error && (
                  <Fade in>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 12,
                        bgcolor: alpha(COLORS.teal, 0.05),
                        '& .MuiAlert-icon': { color: COLORS.teal },
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
                          <Email sx={{ color: COLORS.teal, fontSize: 20 }} />
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
                          <Lock sx={{ color: COLORS.teal, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: alpha(COLORS.navy, 0.5) }}
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
                            color: alpha(COLORS.navy, 0.4),
                            '&.Mui-checked': { color: COLORS.teal },
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.85rem', color: alpha(COLORS.navy, 0.7) }}>Se souvenir de moi</Typography>}
                    />
                    <Link 
                      to="/forgot-password" 
                      style={{ 
                        textDecoration: 'none', 
                        color: COLORS.teal,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = COLORS.navy}
                      onMouseLeave={(e) => e.currentTarget.style.color = COLORS.teal}
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
                    {loading ? <CircularProgress size={24} sx={{ color: COLORS.white }} /> : 'Se connecter'}
                  </GradientButton>

                  <Divider sx={{ my: 3, borderColor: alpha(COLORS.teal, 0.15) }}>
                    <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                      ou
                    </Typography>
                  </Divider>

                  <Box textAlign="center">
                    <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                      Pas encore de compte ?{' '}
                      <Link 
                        to="/register" 
                        style={{ 
                          textDecoration: 'none', 
                          color: COLORS.teal,
                          fontWeight: 700,
                          transition: 'color 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = COLORS.navy}
                        onMouseLeave={(e) => e.currentTarget.style.color = COLORS.teal}
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
              sx={{ mt: 3, color: alpha(COLORS.navy, 0.5), fontSize: '0.75rem' }}
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