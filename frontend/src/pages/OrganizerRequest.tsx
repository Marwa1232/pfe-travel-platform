import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Fade,
  Zoom,
  LinearProgress,
  Autocomplete,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  BusinessCenter,
  Language,
  Facebook,
  Instagram,
  LocationOn,
  Send,
  CheckCircle,
  Upload,
  InsertDriveFile,
  PictureAsPdf,
  Image,
  Verified,
  Security,
  RocketLaunch,
  ArrowBack,
  ArrowForward,
  CloudUpload,
  Delete,
  Info,
  Terrain,
  Diamond,
  Museum,
  FamilyRestroom,
  Favorite,
  SportsSoccer,
  Park,
  Church,
  Assignment,
  Description,
  Badge,
  Store,
  School,
  Groups,
  PestControl,
  Spa,
  Hiking,
  FlightTakeoff,
} from '@mui/icons-material';
import api from '../services/api';

// Couleurs personnalisées
const COLORS = {
  primary: '#0EA5A0',
  primaryDark: '#0C8F8A',
  secondary: '#0F2D5C',
  secondaryLight: '#1A3F7A',
  white: '#FFFFFF',
  grey50: '#F8FAFC',
  grey100: '#F1F5F9',
  grey200: '#E2E8F0',
  grey400: '#94A3B8',
  grey600: '#475569',
  grey700: '#334155',
  grey800: '#1E293B',
  red: '#EF4444',
  green: '#10B981',
  amber: '#F59E0B',
};

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: COLORS.white,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
  boxShadow: `0 8px 32px ${alpha(COLORS.secondary, 0.08)}`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
}));

const StepCard = styled(Card)(({ theme }) => ({
  background: COLORS.white,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  boxShadow: `0 8px 24px ${alpha(COLORS.secondary, 0.06)}`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(COLORS.primary, 0.12)}`,
  },
}));

const UploadZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(COLORS.primary, 0.3)}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: COLORS.primary,
    backgroundColor: alpha(COLORS.primary, 0.02),
  },
}));

const FileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  background: alpha(COLORS.primary, 0.02),
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: COLORS.primary,
    transform: 'translateY(-2px)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  color: COLORS.white,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.primary})`,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${alpha(COLORS.primary, 0.3)}`,
  },
  '&.Mui-disabled': {
    background: COLORS.grey200,
    color: COLORS.grey400,
  }
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: COLORS.secondary,
  color: COLORS.white,
  '&:hover': {
    backgroundColor: COLORS.secondaryLight,
  },
  '&.Mui-disabled': {
    backgroundColor: COLORS.grey200,
    color: COLORS.grey400,
  }
}));

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${COLORS.grey50} 0%, ${COLORS.grey100} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  py: 4,
});

const FloatingIcon = styled(Box)({
  position: 'absolute',
  opacity: 0.08,
  color: COLORS.primary,
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-20px)' },
  },
});

const tripTypes = [
  { value: 'aventure', label: 'Aventure', icon: <Terrain />, color: '#16A34A' },
  { value: 'luxe', label: 'Luxe', icon: <Diamond />, color: '#8B5CF6' },
  { value: 'culturel', label: 'Culturel', icon: <Museum />, color: '#3B82F6' },
  { value: 'familial', label: 'Familial', icon: <FamilyRestroom />, color: '#F59E0B' },
  { value: 'romantique', label: 'Romantique', icon: <Favorite />, color: '#EC4899' },
  { value: 'sportif', label: 'Sportif', icon: <SportsSoccer />, color: '#EF4444' },
  { value: 'ecotourisme', label: 'Écotourisme', icon: <Park />, color: '#10B981' },
  { value: 'religieux', label: 'Religieux', icon: <Church />, color: '#6366F1' },
];

const COUNTRIES = [
  { code: 'TN', name: 'Tunisie', licenseFormat: 'TN-XXXX/YYYY', licensePattern: '^TN-\\d{4}/\\d{4}$', licenseExample: 'TN-1234/2024', taxFormat: '8 chiffres', taxPattern: '^\\d{8}$', taxExample: '12345678' },
  { code: 'DZ', name: 'Algérie', licenseFormat: 'DZ-XXXXX', licensePattern: '^DZ-\\d{5}$', licenseExample: 'DZ-12345', taxFormat: '15 chiffres', taxPattern: '^\\d{15}$', taxExample: '123456789012345' },
  { code: 'LY', name: 'Libye', licenseFormat: 'LY-XXXXX', licensePattern: '^LY-\\d{5}$', licenseExample: 'LY-56789', taxFormat: '9-12 chiffres', taxPattern: '^\\d{9,12}$', taxExample: '123456789' },
  { code: 'MA', name: 'Maroc', licenseFormat: 'MA-XXXX', licensePattern: '^MA-\\d{4}$', licenseExample: 'MA-1234', taxFormat: '9 chiffres', taxPattern: '^\\d{9}$', taxExample: '123456789' },
  { code: 'EG', name: 'Égypte', licenseFormat: 'EG-XXXXX', licensePattern: '^EG-\\d{5}$', licenseExample: 'EG-12345', taxFormat: '9 chiffres', taxPattern: '^\\d{9}$', taxExample: '123456789' },
];

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  file: File;
  preview?: string;
}

interface ValidationErrors {
  agency_name?: string;
  license_number?: string;
  tax_number?: string;
  country?: string;
  experience?: string;
  trip_types?: string;
}

const OrganizerRequest: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState({
    agency_name: '',
    description: '',
    experience: '',
    trip_types: [] as string[],
    website: '',
    facebook: '',
    instagram: '',
    license_number: '',
    tax_number: '',
    address: '',
    country: '',
  });

  const steps = ['Informations', 'Expérience', 'Documents', 'Réseaux sociaux'];

  const validateAgencyName = (value: string): string | undefined => {
    if (!value.trim()) return 'Le nom de l\'agence est obligatoire';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Le nom doit contenir uniquement des lettres';
    if (value.length < 2) return 'Le nom doit contenir au moins 2 caractères';
    return undefined;
  };

  const validateCountry = (value: string): string | undefined => {
    if (!value) return 'Le pays est obligatoire';
    return undefined;
  };

  const validateLicenseNumber = (value: string, country: string): string | undefined => {
    if (!value.trim()) return 'Le numéro de licence est obligatoire';
    
    const countryConfig = COUNTRIES.find(c => c.code === country);
    if (!countryConfig) return undefined;
    
    const regex = new RegExp(countryConfig.licensePattern);
    if (!regex.test(value)) {
      return `Format invalide. Exemple: ${countryConfig.licenseExample}`;
    }
    return undefined;
  };

  const validateTaxNumber = (value: string, country: string): string | undefined => {
    if (!value.trim()) return undefined;
    
    const countryConfig = COUNTRIES.find(c => c.code === country);
    if (!countryConfig) return undefined;
    
    const regex = new RegExp(countryConfig.taxPattern);
    if (!regex.test(value)) {
      return `Format invalide. Exemple: ${countryConfig.taxExample}`;
    }
    return undefined;
  };

  const validateExperience = (value: string): string | undefined => {
    if (!value.trim()) return 'L\'expérience est obligatoire';
    if (value.length < 20) return 'Veuillez fournir plus de détails (minimum 20 caractères)';
    return undefined;
  };

  const validateTripTypes = (types: string[]): string | undefined => {
    if (types.length === 0) return 'Sélectionnez au moins un type de voyage';
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    
    if (name === 'agency_name') {
      setErrors(prev => ({ ...prev, agency_name: validateAgencyName(value) }));
    } else if (name === 'experience') {
      setErrors(prev => ({ ...prev, experience: validateExperience(value) }));
    }
  };

  const handleCountryChange = (countryCode: string | null) => {
    const country = countryCode || '';
    setFormData(prev => ({ ...prev, country }));
    setErrors(prev => ({ 
      ...prev, 
      country: validateCountry(country),
      license_number: formData.license_number ? validateLicenseNumber(formData.license_number, country) : undefined,
      tax_number: formData.tax_number ? validateTaxNumber(formData.tax_number, country) : undefined,
    }));
  };

  const handleTripTypeToggle = (value: string) => {
    const newTripTypes = formData.trip_types.includes(value)
      ? formData.trip_types.filter(t => t !== value)
      : [...formData.trip_types, value];
    
    setFormData(prev => ({
      ...prev,
      trip_types: newTripTypes
    }));
    setErrors(prev => ({ 
      ...prev, 
      trip_types: validateTripTypes(newTripTypes)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocuments: Document[] = Array.from(files).map((file, index) => ({
        id: Date.now() + index + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        file: file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));
      setDocuments(prev => [...prev, ...newDocuments]);
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <PictureAsPdf sx={{ color: COLORS.red }} />;
    if (type.includes('image')) return <Image sx={{ color: COLORS.green }} />;
    return <InsertDriveFile sx={{ color: COLORS.primary }} />;
  };

  const handleNext = () => {
    const stepErrors: ValidationErrors = {};
    
    if (activeStep === 0) {
      stepErrors.agency_name = validateAgencyName(formData.agency_name) || undefined;
      stepErrors.country = validateCountry(formData.country) || undefined;
      stepErrors.license_number = validateLicenseNumber(formData.license_number, formData.country) || undefined;
      stepErrors.tax_number = validateTaxNumber(formData.tax_number, formData.country) || undefined;
      
      if (!formData.description) {
        setError('La description est obligatoire');
        setActiveStep(0);
        return;
      }
    } else if (activeStep === 1) {
      stepErrors.experience = validateExperience(formData.experience) || undefined;
      stepErrors.trip_types = validateTripTypes(formData.trip_types) || undefined;
    } else if (activeStep === 2) {
      if (documents.length === 0) {
        setError('Veuillez télécharger au moins un document professionnel');
        return;
      }
    }
    
    const hasErrors = Object.values(stepErrors).some(e => e);
    if (hasErrors) {
      setErrors(stepErrors);
      setError('Veuillez corriger les erreurs avant de continuer');
      return;
    }
    
    setActiveStep(prev => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (key === 'trip_types') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value as string);
        }
      });

      documents.forEach((doc, index) => {
        formDataToSend.append(`document_${index}`, doc.file);
      });

      const response = await api.post('/user/organizer-request', formDataToSend);

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <BackgroundBox>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Fade in timeout={1000}>
            <GlassPaper sx={{ textAlign: 'center', py: 6 }}>
              <Zoom in timeout={500}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                    },
                  }}
                >
                  <CheckCircle sx={{ fontSize: 70, color: COLORS.white }} />
                </Box>
              </Zoom>
              
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Demande envoyée !
              </Typography>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                Nous avons bien reçu votre demande avec tous vos documents
              </Typography>

              <Card sx={{ maxWidth: 400, mx: 'auto', mb: 4, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Security sx={{ color: COLORS.primary, fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Statut de la demande</Typography>
                      <Typography variant="h6" fontWeight={600}>En attente de vérification</Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    sx={{ 
                      mt: 2, 
                      borderRadius: 2,
                      bgcolor: alpha(COLORS.primary, 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: COLORS.primary }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Vérification sous 24-48 heures
                  </Typography>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <OutlineButton onClick={() => navigate('/dashboard')}>
                  Retour au tableau de bord
                </OutlineButton>
                <GradientButton onClick={() => navigate('/organizer/profile')}>
                  Compléter mon profil
                </GradientButton>
              </Box>
            </GlassPaper>
          </Fade>
        </Container>
      </BackgroundBox>
    );
  }

  return (
    <BackgroundBox>
      <FloatingIcon sx={{ top: '10%', left: '5%', transform: 'rotate(-15deg)' }}>
        <BusinessCenter sx={{ fontSize: 120 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '10%', right: '5%', transform: 'rotate(20deg)' }}>
        <RocketLaunch sx={{ fontSize: 100 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ top: '50%', left: '2%', transform: 'rotate(10deg)' }}>
        <FlightTakeoff sx={{ fontSize: 80 }} />
      </FloatingIcon>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                mx: 'auto',
                mb: 2,
              }}
            >
              <Verified sx={{ fontSize: 40, color: COLORS.white }} />
            </Avatar>
            <Typography variant="h2" fontWeight="800" sx={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}>
              Devenir Organisateur
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Rejoignez notre plateforme et partagez vos expériences de voyage avec des milliers de voyageurs
            </Typography>
          </Box>
        </Fade>

        <GlassPaper sx={{ mb: 4, p: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: COLORS.primary },
                      '&.Mui-completed': { color: COLORS.secondary },
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <LinearProgress 
            variant="determinate" 
            value={(activeStep + 1) * 25} 
            sx={{ 
              mt: 2, 
              borderRadius: 2, 
              height: 6,
              bgcolor: alpha(COLORS.primary, 0.1),
              '& .MuiLinearProgress-bar': { bgcolor: COLORS.primary }
            }}
          />
        </GlassPaper>

        <GlassPaper>
          {error && (
            <Fade in>
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {activeStep === 0 && (
            <Fade in timeout={500}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Assignment sx={{ color: COLORS.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    Informations de l'agence
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Veuillez fournir les informations de votre agence ou votre marque personnelle
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Nom de l'agence / Marque"
                      name="agency_name"
                      value={formData.agency_name}
                      onChange={handleChange}
                      placeholder="Ex: Sahara Adventures, Travel Tunisia..."
                      error={!!errors.agency_name}
                      helperText={errors.agency_name}
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={COUNTRIES.map(c => c.code)}
                      value={formData.country || null}
                      onChange={(_, newValue) => handleCountryChange(newValue)}
                      getOptionLabel={(option) => COUNTRIES.find(c => c.code === option)?.name || option}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label="Pays"
                          placeholder="Sélectionnez un pays"
                          error={!!errors.country}
                          helperText={errors.country}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <LocationOn sx={{ mr: 1, color: COLORS.primary }} />,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  {formData.country && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Numéro de licence"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        placeholder={`Ex: ${COUNTRIES.find(c => c.code === formData.country)?.licenseExample}`}
                        error={!!errors.license_number}
                        helperText={errors.license_number || `Format: ${COUNTRIES.find(c => c.code === formData.country)?.licenseFormat}`}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                  )}
                  {formData.country && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Numéro fiscal (optionnel)"
                        name="tax_number"
                        value={formData.tax_number}
                        onChange={handleChange}
                        placeholder={COUNTRIES.find(c => c.code === formData.country)?.taxExample || ''}
                        error={!!errors.tax_number}
                        helperText={errors.tax_number || `Format: ${COUNTRIES.find(c => c.code === formData.country)?.taxFormat}`}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={4}
                      label="Description de l'activité"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Décrivez votre activité, vos services, votre vision..."
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Site web (optionnel)"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://votre-site.com"
                      InputProps={{
                        startAdornment: <Language sx={{ mr: 1, color: COLORS.primary }} />,
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Rue, ville, code postal"
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: COLORS.primary }} />,
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  {formData.country && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, bgcolor: alpha(COLORS.grey100, 0.5), borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Formats acceptés pour {COUNTRIES.find(c => c.code === formData.country)?.name}:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          Licence: {COUNTRIES.find(c => c.code === formData.country)?.licenseFormat}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          Fiscal: {COUNTRIES.find(c => c.code === formData.country)?.taxFormat}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Fade>
          )}

          {activeStep === 1 && (
            <Fade in timeout={500}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Badge sx={{ color: COLORS.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    Expérience professionnelle
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Partagez votre expérience dans l'organisation de voyages
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={4}
                      label="Expérience dans l'organisation"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      error={!!errors.experience}
                      helperText={errors.experience}
                      placeholder="Décrivez votre expérience, vos qualifications, depuis combien de temps vous organisez des voyages..."
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Types de voyages proposés *
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Sélectionnez les types de voyages que vous proposez
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {tripTypes.map((type) => (
                        <Chip
                          key={type.value}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {type.icon}
                              <span>{type.label}</span>
                            </Box>
                          }
                          onClick={() => handleTripTypeToggle(type.value)}
                          sx={{
                            bgcolor: formData.trip_types.includes(type.value) ? type.color : 'transparent',
                            color: formData.trip_types.includes(type.value) ? COLORS.white : COLORS.grey700,
                            borderColor: type.color,
                            '&:hover': {
                              bgcolor: formData.trip_types.includes(type.value) ? type.color : alpha(type.color, 0.1),
                            },
                          }}
                          variant={formData.trip_types.includes(type.value) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                    {errors.trip_types && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.trip_types}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {activeStep === 2 && (
            <Fade in timeout={500}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Description sx={{ color: COLORS.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    Documents professionnels
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Téléchargez vos documents justificatifs (licence, registre de commerce, etc.)
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="file-upload">
                      <UploadZone>
                        <CloudUpload sx={{ fontSize: 48, color: COLORS.primary, mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                          Cliquez pour télécharger
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ou glissez-déposez vos fichiers ici
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                        </Typography>
                      </UploadZone>
                    </label>
                  </Grid>

                  {documents.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Documents téléchargés ({documents.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {documents.map((doc) => (
                          <Grid item xs={12} sm={6} md={4} key={doc.id}>
                            <FileCard>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: alpha(COLORS.primary, 0.1) }}>
                                  {getFileIcon(doc.type)}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="subtitle2" noWrap>
                                    {doc.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {doc.size}
                                  </Typography>
                                </Box>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRemoveDocument(doc.id)}
                                  sx={{ color: COLORS.red }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                              {doc.preview && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    height: 100,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <img
                                    src={doc.preview}
                                    alt="Preview"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                </Box>
                              )}
                            </FileCard>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Alert 
                      severity="info" 
                      icon={<Info />}
                      sx={{ borderRadius: 2 }}
                    >
                      Les documents suivants sont recommandés : registre de commerce, licence d'exploitation, 
                      attestation d'assurance, pièce d'identité du responsable.
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {activeStep === 3 && (
            <Fade in timeout={500}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Store sx={{ color: COLORS.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    Réseaux sociaux (optionnel)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Ajoutez vos réseaux sociaux professionnels pour améliorer votre visibilité
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Page Facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/votrepage"
                      InputProps={{
                        startAdornment: <Facebook sx={{ mr: 1, color: '#1877F2' }} />,
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Compte Instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@votrecompte"
                      InputProps={{
                        startAdornment: <Instagram sx={{ mr: 1, color: '#E4405F' }} />,
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: `1px solid ${alpha(COLORS.grey200, 0.8)}` }}>
            <OutlineButton
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Retour
            </OutlineButton>
            
            {activeStep < steps.length - 1 ? (
              <GradientButton
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Suivant
              </GradientButton>
            ) : (
              <GradientButton
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: COLORS.white }} /> : <Send />}
              >
                {loading ? 'Envoi...' : 'Soumettre la demande'}
              </GradientButton>
            )}
          </Box>
        </GlassPaper>
      </Container>
    </BackgroundBox>
  );
};

export default OrganizerRequest;