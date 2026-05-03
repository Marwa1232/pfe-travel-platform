import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  Avatar,
  Fade,
  Zoom,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  SupportAgent,
  AccessTime,
} from '@mui/icons-material';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

// ─── STYLED COMPONENTS ──────────────────────────────────────────
const ContactCard = styled(Paper)(({ theme }) => ({
  background: COLORS.white,
  borderRadius: 16,
  overflow: 'hidden',
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.06)}`,
}));

const InfoCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.teal} 100%)`,
  padding: theme.spacing(4),
  height: '100%',
  color: COLORS.white,
  position: 'relative',
  overflow: 'hidden',
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(COLORS.white, 0.1),
    transform: 'translateX(4px)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '&:hover fieldset': {
      borderColor: COLORS.teal,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.teal,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: COLORS.teal,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 12,
  padding: theme.spacing(1.2, 3),
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  color: COLORS.white,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${alpha(COLORS.teal, 0.3)}`,
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  fontWeight: 800,
  color: COLORS.navy,
  letterSpacing: '-0.02em',
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(1),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 50,
    height: 3,
    background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.navy})`,
    borderRadius: 2,
  },
}));

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simuler l'envoi (remplacer par votre API)
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        severity: 'success',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    { icon: <Phone />, title: 'Téléphone', value: '+216 12 345 678', detail: 'Lun-Ven, 9h-18h' },
    { icon: <Email />, title: 'Email', value: 'contact@tripbooking.tn', detail: 'Réponse sous 24h' },
    { icon: <LocationOn />, title: 'Adresse', value: 'Tunis, Tunisie', detail: 'Centre urbain Nord' },
    { icon: <AccessTime />, title: 'Horaires', value: 'Lundi au Vendredi', detail: '9h00 - 18h00' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 6 }}>
      <Container maxWidth="lg">
        
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Title>Contactez-nous</Title>
            <Typography variant="body1" sx={{ color: alpha(COLORS.navy, 0.6), mt: 2, maxWidth: 500, mx: 'auto' }}>
              Une question, une suggestion ? Notre équipe est là pour vous aider
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3}>
          
          {/* Left - Informations de contact */}
          <Grid item xs={12} md={5}>
            <Zoom in timeout={500}>
              <ContactCard elevation={0}>
                <InfoCard>
                  {/* Icône décorative */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      backgroundColor: alpha(COLORS.white, 0.08),
                      pointerEvents: 'none',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -30,
                      left: -30,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      backgroundColor: alpha(COLORS.white, 0.05),
                      pointerEvents: 'none',
                    }}
                  />

                  <Typography variant="h5" fontWeight={700} sx={{ mb: 3, position: 'relative' }}>
                    Informations
                  </Typography>
                  
                  {contactInfo.map((info, index) => (
                    <InfoItem key={index}>
                      <Avatar sx={{ bgcolor: alpha(COLORS.white, 0.15), color: COLORS.white, width: 44, height: 44 }}>
                        {info.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.75, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                          {info.title}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {info.value}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {info.detail}
                        </Typography>
                      </Box>
                    </InfoItem>
                  ))}

                  {/* Support badge */}
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 12,
                      backgroundColor: alpha(COLORS.white, 0.1),
                      textAlign: 'center',
                    }}
                  >
                    <SupportAgent sx={{ fontSize: 28, mb: 0.5 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Support réactif
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Nous répondons à toutes vos questions
                    </Typography>
                  </Box>
                </InfoCard>
              </ContactCard>
            </Zoom>
          </Grid>

          {/* Right - Formulaire de contact */}
          <Grid item xs={12} md={7}>
            <Fade in timeout={700}>
              <ContactCard elevation={0}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: COLORS.navy, mb: 0.5 }}>
                    Envoyez-nous un message
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 3 }}>
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                  </Typography>

                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="Nom complet"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          size="medium"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          size="medium"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          label="Sujet"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          size="medium"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          label="Message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          multiline
                          rows={4}
                          required
                          size="medium"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <GradientButton
                          type="submit"
                          disabled={loading}
                          startIcon={loading ? null : <Send />}
                          fullWidth
                          sx={{ width: 'auto', minWidth: 180 }}
                        >
                          {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                        </GradientButton>
                      </Grid>
                    </Grid>
                  </form>

                  {/* Note de confidentialité */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 3, 
                      color: alpha(COLORS.navy, 0.4),
                    }}
                  >
                    Vos informations sont confidentielles et ne seront jamais partagées
                  </Typography>
                </Box>
              </ContactCard>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 12, bgcolor: snackbar.severity === 'success' ? COLORS.teal : COLORS.amber, color: COLORS.white }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;