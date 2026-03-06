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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  BusinessCenter,
  Description,
  Language,
  Facebook,
  Instagram,
  Send,
  CheckCircle,
} from '@mui/icons-material';
import api from '../services/api';

const tripTypes = [
  { value: 'aventure', label: 'Aventure' },
  { value: 'luxe', label: 'Luxe' },
  { value: 'culturel', label: 'Culturel' },
  { value: 'familial', label: 'Familial' },
  { value: 'romantique', label: 'Romantique' },
  { value: 'sportif', label: 'Sportif' },
  { value: 'ecotourisme', label: 'Écotourisme' },
  { value: 'religieux', label: 'Religieux' },
];

const OrganizerRequest: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    agency_name: '',
    description: '',
    experience: '',
    trip_types: [] as string[],
    website: '',
    facebook: '',
    instagram: '',
  });

  const steps = ['Informations', 'Expérience', 'Réseaux sociaux'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleTripTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormData(prev => ({ ...prev, trip_types: event.target.value as string[] }));
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (!formData.agency_name || !formData.description) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.experience || formData.trip_types.length === 0) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }
    setActiveStep(prev => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.experience || formData.trip_types.length === 0) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/organizer-request', {
        agency_name: formData.agency_name,
        description: formData.description,
        experience: formData.experience,
        trip_types: formData.trip_types,
        website: formData.website || null,
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Demande envoyée !
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Nous avons bien reçu votre demande. Vos informations seront vérifiées par l'administration dans un délai de 24 heures.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{ px: 4, borderRadius: 3 }}
          >
            Retour au tableau de bord
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D47A1, #00BFA5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <BusinessCenter sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Devenir Organisateur
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Rejoignez notre plateforme et partagez vos expériences de voyage avec des milliers de voyageurs
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Informations de l'agence
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Veuillez fournir les informations de votre agence ou votre marque personnelle
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Nom de l'agence / Marque"
                    name="agency_name"
                    value={formData.agency_name}
                    onChange={handleChange}
                    placeholder="Ex: Sahara Adventures, Travel Tunisia..."
                  />
                </Grid>
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
                    placeholder="Décrivez votre activité, vos services..."
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
                      startAdornment: <Language sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Expérience professionnelle
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
                    placeholder="Décrivez votre expérience, vos qualifications, depuis combien de temps..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom fontWeight={500}>
                    Types de voyages proposés *
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Sélectionnez les types de voyages que vous proposez
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tripTypes.map((type) => (
                      <Chip
                        key={type.value}
                        label={type.label}
                        onClick={() => {
                          const newTypes = formData.trip_types.includes(type.value)
                            ? formData.trip_types.filter(t => t !== type.value)
                            : [...formData.trip_types, type.value];
                          setFormData(prev => ({ ...prev, trip_types: newTypes }));
                        }}
                        color={formData.trip_types.includes(type.value) ? 'primary' : 'default'}
                        variant={formData.trip_types.includes(type.value) ? 'filled' : 'outlined'}
                        sx={{ borderRadius: 2 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Réseaux sociaux (optionnel)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Navigation buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{ px: 4 }}
            >
              Retour
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ px: 4 }}
              >
                Suivant
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                sx={{ px: 4 }}
              >
                {loading ? 'Envoi...' : 'Soumettre la demande'}
              </Button>
            )}
          </Box>
        </Paper>

        {/* Info box */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 3,
            background: 'rgba(13, 71, 161, 0.05)',
            border: '1px solid',
            borderColor: 'rgba(13, 71, 161, 0.1)',
          }}
        >
          <Typography variant="body1" fontWeight={600} gutterBottom>
            📋 Ce que nous vérifions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Validité des informations professionnelles
            • Expérience dans le domaine du tourisme
            • Références et agréments (si applicables)
            • Qualité des services proposés
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default OrganizerRequest;
