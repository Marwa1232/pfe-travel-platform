import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider, TextField, Button, Paper } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TerrainIcon from '@mui/icons-material/Terrain';
import ExploreIcon from '@mui/icons-material/Explore';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { styled, alpha } from '@mui/material/styles';

// Styled components
const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.grey[400],
  textDecoration: 'none',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  display: 'inline-block',
  position: 'relative',
  '&:hover': {
    color: '#00BFA5',
    transform: 'translateX(5px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: -2,
    left: 0,
    width: 0,
    height: 1,
    backgroundColor: '#00BFA5',
    transition: 'width 0.3s ease',
  },
  '&:hover::before': {
    width: '100%',
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[400],
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.common.white,
    backgroundColor: '#00BFA5',
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 12px rgba(0,191,165,0.3)',
  },
}));

const NewsletterInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: theme.palette.common.white,
    backgroundColor: alpha(theme.palette.common.white, 0.05),
    borderRadius: theme.spacing(3),
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.common.white, 0.2),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00BFA5',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: alpha(theme.palette.common.white, 0.5),
  },
}));

const PaymentMethod = styled(Box)(({ theme }) => ({
  width: 50,
  height: 35,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
    transform: 'translateY(-2px)',
  },
}));

const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <Box
      component="footer"
      id="footer"
      sx={{
        backgroundColor: '#0A0F1C',
        color: '#FFFFFF',
        pt: 8,
        pb: 4,
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #00BFA5, #0D47A1, #00BFA5)',
        },
      }}
    >
      {/* Background Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,191,165,0.1) 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(30px, -30px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,71,161,0.1) 0%, transparent 70%)',
          animation: 'float 15s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6}>
          {/* Company Info - Enhanced */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              TripBooking
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, lineHeight: 1.8 }}>
              Votre partenaire de confiance pour découvrir les merveilles de l'Afrique du Nord.
              Des voyages inoubliables, des expériences authentiques.
            </Typography>
            
            {/* Rating Badge */}
            <Paper
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 700 }}>
                  4.8
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>
                  Note moyenne
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              <Box>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                  10K+
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>
                  Voyageurs
                </Typography>
              </Box>
            </Paper>

            {/* Social Icons */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <SocialButton size="small">
                <FacebookIcon fontSize="small" />
              </SocialButton>
              <SocialButton size="small">
                <InstagramIcon fontSize="small" />
              </SocialButton>
              <SocialButton size="small">
                <TwitterIcon fontSize="small" />
              </SocialButton>
              <SocialButton size="small">
                <LinkedInIcon fontSize="small" />
              </SocialButton>
              <SocialButton size="small">
                <YouTubeIcon fontSize="small" />
              </SocialButton>
            </Box>
          </Grid>



          {/* Contact Info - Enhanced */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
              Contactez-nous
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: alpha('#00BFA5', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PhoneIcon sx={{ color: '#00BFA5', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>
                    Téléphone
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    +216 12 345 678
                  </Typography>
                </Box>
              </Box>

              

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: alpha('#00BFA5', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <LocationOnIcon sx={{ color: '#00BFA5', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>
                    Adresse
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    Avenue Habib Bourguiba<br />
                    Tunis, Tunisie 1000
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Newsletter */}
            <Box component="form" onSubmit={handleSubscribe} sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 1 }}>
                Newsletter
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <NewsletterInput
                  size="small"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    minWidth: 'auto',
                    width: 45,
                    height: 45,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0D47A1, #00BFA5)',
                    },
                  }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
              {subscribed && (
                <Typography variant="caption" sx={{ color: '#00BFA5', mt: 1, display: 'block' }}>
                  ✓ Merci de votre inscription !
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Trust Badges */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2, md: 4 },
            flexWrap: 'wrap',
            my: 4,
            p: 2,
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ color: '#00BFA5', fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: 'grey.400' }}>
              Paiement sécurisé
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupportAgentIcon sx={{ color: '#00BFA5', fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: 'grey.400' }}>
              Support 24/7
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon sx={{ color: '#00BFA5', fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: 'grey.400' }}>
              Meilleur prix garanti
            </Typography>
          </Box>
        </Box>

        {/* Payment Methods */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <PaymentMethod>Visa</PaymentMethod>
          <PaymentMethod>MC</PaymentMethod>
          <PaymentMethod>Amex</PaymentMethod>
          <PaymentMethod>PayPal</PaymentMethod>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright and Legal Links */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: 2,
          mt: 3,
        }}>
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            © {new Date().getFullYear()} TripBooking. Tous droits réservés.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <FooterLink href="#" sx={{ fontSize: '0.8rem' }}>
              Mentions légales
            </FooterLink>
            <FooterLink href="#" sx={{ fontSize: '0.8rem' }}>
              Politique de confidentialité
            </FooterLink>
            <FooterLink href="#" sx={{ fontSize: '0.8rem' }}>
              CGV
            </FooterLink>
            <FooterLink href="#" sx={{ fontSize: '0.8rem' }}>
              Cookies
            </FooterLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;