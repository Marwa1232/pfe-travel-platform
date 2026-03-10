import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
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
  MenuItem,
  IconButton,
  InputAdornment,
  Avatar,
  Fade,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Public,
  Language,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  FlightTakeoff,
} from '@mui/icons-material';
import { register } from '../store/authSlice';

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

const StepIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    country: 'Tunisia',
    preferred_language: 'fr',
  });

  const countries = ['Tunisia', 'Algeria', 'Morocco', 'Libya', 'Egypt'];
  const languages = [
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' },
  ];

  const steps = ['Informations personnelles', 'Sécurité', 'Préférences'];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.first_name || !formData.last_name || !formData.email) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }
    if (activeStep === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }

    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);

      const { confirmPassword, ...registerData } = formData;

      const result = await dispatch(register(registerData) as any);

      if (register.fulfilled.match(result)) {
        navigate('/login', {
          state: { message: 'Inscription réussie ! Connectez-vous maintenant.' },
        });
      } else {
        setError(result.payload?.error || "Erreur lors de l'inscription");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Prénom"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Nom"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Téléphone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Mot de passe"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
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
                </Grid>

                <Grid xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Confirmer le mot de passe"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: 'text.secondary' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Password strength indicator */}
                <Grid xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Force du mot de passe
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      {[1, 2, 3].map((level) => (
                        <Box
                          key={level}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor:
                              formData.password.length >= level * 2
                                ? level === 1
                                  ? '#f44336'
                                  : level === 2
                                  ? '#ff9800'
                                  : '#4caf50'
                                : alpha('#000', 0.1),
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    select
                    label="Pays"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Public sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Grid>

                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    select
                    label="Langue préférée"
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Language sx={{ color: '#00BFA5' }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Grid>

                {/* Benefits card */}
                <Grid xs={12}>
                  <Card sx={{ mt: 2, backgroundColor: alpha('#00BFA5', 0.05), borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        <CheckCircle sx={{ fontSize: 16, color: '#00BFA5', mr: 0.5, verticalAlign: 'middle' }} />
                        En créant un compte, vous bénéficiez :
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                        <Typography component="li" variant="caption" color="text.secondary">
                          Recommandations personnalisées
                        </Typography>
                        <Typography component="li" variant="caption" color="text.secondary">
                          Réservations plus rapides
                        </Typography>
                        <Typography component="li" variant="caption" color="text.secondary">
                          Offres exclusives membres
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <BackgroundBox>
      {/* Floating decorative icons */}
      <FloatingIcon sx={{ top: '10%', left: '5%', transform: 'rotate(-15deg)' }}>
        <FlightTakeoff sx={{ fontSize: 80 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '15%', right: '8%', transform: 'rotate(20deg)' }}>
        <FlightTakeoff sx={{ fontSize: 100 }} />
      </FloatingIcon>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
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
                Rejoignez notre communauté de voyageurs
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
                    <Person sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                    Créer un compte
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeStep === 0 && "Parlez-nous un peu de vous"}
                    {activeStep === 1 && "Sécurisez votre compte"}
                    {activeStep === 2 && "Finalisons votre inscription"}
                  </Typography>
                </Box>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconComponent={() => (
                          <StepIcon>
                            {index + 1}
                          </StepIcon>
                        )}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

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
                  {renderStepContent(activeStep)}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ArrowBack />}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Retour
                    </Button>

                    <GradientButton
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
                      sx={{ px: 4 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : activeStep === steps.length - 1 ? (
                        "S'inscrire"
                      ) : (
                        "Suivant"
                      )}
                    </GradientButton>
                  </Box>

                  <Box textAlign="center" sx={{ mt: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Déjà un compte ?{' '}
                      <Link 
                        to="/login" 
                        style={{ 
                          textDecoration: 'none', 
                          color: '#00BFA5',
                          fontWeight: 600,
                        }}
                      >
                        Se connecter
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </StyledPaper>
            </Fade>
          </Box>
        </Zoom>
      </Container>
    </BackgroundBox>
  );
};

export default Register;