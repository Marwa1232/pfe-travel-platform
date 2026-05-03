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
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  FlightTakeoff,
} from '@mui/icons-material';
import { register } from '../store/authSlice';
import PhoneNumberInput from '../components/PhoneNumberInput';

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
  animation: `${fadeUp} 0.6s ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.navy}, ${COLORS.teal})`,
  },
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

const StepIcon = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(COLORS.teal, 0.1),
  color: COLORS.teal,
  fontWeight: 700,
  fontSize: 14,
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

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    phone: '',
    first_name: '',
    last_name: '',
  });

  const validateName = (value: string) => {
    if (value && !/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'Seules les lettres sont autorisées';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email invalide';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (value && value.length < 6) {
      return 'Minimum 6 caractères';
    }
    if (value && !/\d/.test(value)) {
      return 'Doit contenir au moins un chiffre';
    }
    if (value && !/[A-Z]/.test(value)) {
      return 'Doit contenir au moins une majuscule';
    }
    return '';
  };

  const validatePhone = (value: string) => {
    if (!value || value.trim() === '') {
      return 'Le numéro de téléphone est obligatoire';
    }
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Numéro de téléphone invalide';
    }
    return '';
  };

  const countries = ['Tunisia', 'Algeria', 'Morocco', 'Libya', 'Egypt'];
  const steps = ['Informations personnelles', 'Sécurité'];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);

    if (name === 'email') {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
    if (name === 'password') {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
    if (name === 'phone') {
      setFieldErrors(prev => ({ ...prev, phone: validatePhone(value) }));
    }
    if (name === 'first_name') {
      setFieldErrors(prev => ({ ...prev, first_name: validateName(value) }));
    }
    if (name === 'last_name') {
      setFieldErrors(prev => ({ ...prev, last_name: validateName(value) }));
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.first_name || !formData.last_name || !formData.email) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      const firstNameErr = validateName(formData.first_name);
      if (firstNameErr) {
        setFieldErrors(prev => ({ ...prev, first_name: firstNameErr }));
        return;
      }
      const lastNameErr = validateName(formData.last_name);
      if (lastNameErr) {
        setFieldErrors(prev => ({ ...prev, last_name: lastNameErr }));
        return;
      }
      const phoneErr = validatePhone(formData.phone);
      if (phoneErr) {
        setFieldErrors(prev => ({ ...prev, phone: phoneErr }));
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
      const passErr = validatePassword(formData.password);
      if (passErr) {
        setFieldErrors(prev => ({ ...prev, password: passErr }));
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

    const passErr = validatePassword(formData.password);
    if (passErr) {
      setFieldErrors(prev => ({ ...prev, password: passErr }));
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
              <Grid container spacing={2.5}>
                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Prénom"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.first_name}
                    helperText={fieldErrors.first_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: COLORS.teal, fontSize: 20 }} />
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
                    error={!!fieldErrors.last_name}
                    helperText={fieldErrors.last_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: COLORS.teal, fontSize: 20 }} />
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
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: COLORS.teal, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <PhoneNumberInput
                    value={formData.phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                    label="Téléphone"
                    error={!!fieldErrors.phone}
                    helperText={fieldErrors.phone}
                    required
                    defaultCountry={formData.country || 'Tunisia'}
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
              <Grid container spacing={2.5}>
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
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password}
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
                          <Lock sx={{ color: COLORS.teal, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: alpha(COLORS.navy, 0.5) }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.6), fontWeight: 600 }}>
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
                              (formData.password?.length || 0) >= level * 2
                                ? level === 1
                                  ? '#f44336'
                                  : level === 2
                                  ? COLORS.teal
                                  : COLORS.teal
                                : alpha(COLORS.navy, 0.1),
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

      default:
        return null;
    }
  };

  return (
    <BackgroundBox>
      {/* Floating decorative icons */}
      <FloatingIcon sx={{ top: '10%', left: '5%', transform: 'rotate(-15deg)', animationDelay: '0s' }}>
        <FlightTakeoff sx={{ fontSize: 80 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '15%', right: '8%', transform: 'rotate(20deg)', animationDelay: '2s' }}>
        <FlightTakeoff sx={{ fontSize: 100 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ top: '50%', right: '3%', transform: 'rotate(10deg)', animationDelay: '4s' }}>
        <FlightTakeoff sx={{ fontSize: 60 }} />
      </FloatingIcon>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
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
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                TripBooking
              </Typography>
              <Typography variant="body1" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                Rejoignez notre communauté de voyageurs
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
                    <Person sx={{ fontSize: 40, color: COLORS.white }} />
                  </Avatar>
                  <Typography variant="h4" component="h1" gutterBottom fontWeight={800} sx={{ color: COLORS.navy }}>
                    Créer un compte
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                    {activeStep === 0 && "Parlez-nous un peu de vous"}
                    {activeStep === 1 && "Finalisons votre inscription"}
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
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: alpha(COLORS.navy, 0.6),
                            fontWeight: activeStep === index ? 700 : 400,
                          },
                        }}
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
                  {renderStepContent(activeStep)}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
                    <OutlineButton
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ArrowBack />}
                      sx={{ px: 3 }}
                    >
                      Retour
                    </OutlineButton>

                    <GradientButton
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
                      sx={{ px: 4 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: COLORS.white }} />
                      ) : activeStep === steps.length - 1 ? (
                        "S'inscrire"
                      ) : (
                        "Suivant"
                      )}
                    </GradientButton>
                  </Box>

                

                  <Box textAlign="center">
                    <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                      Déjà un compte ?{' '}
                      <Link 
                        to="/login" 
                        style={{ 
                          textDecoration: 'none', 
                          color: COLORS.teal,
                          fontWeight: 700,
                          transition: 'color 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = COLORS.navy}
                        onMouseLeave={(e) => e.currentTarget.style.color = COLORS.teal}
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