import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1A2027',
        color: '#FFFFFF',
        pt: 6,
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TripBooking
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 2, lineHeight: 1.8 }}>
              Votre partenaire de confiance pour découvrir les merveilles de l'Afrique du Nord.
              Des voyages inoubliables vous attendent.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                sx={{
                  color: 'grey.400',
                  '&:hover': { color: '#00BFA5' },
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: 'grey.400',
                  '&:hover': { color: '#00BFA5' },
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: 'grey.400',
                  '&:hover': { color: '#00BFA5' },
                }}
              >
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>

         
          {/* Contact Info */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ color: '#00BFA5', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  +216 12 345 678
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#00BFA5', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  contact@tripbooking.tn
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOnIcon sx={{ color: '#00BFA5', fontSize: 20, mt: 0.5 }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  Avenue Habib Bourguiba<br />
                  Tunis, Tunisie
                </Typography>
              </Box>
            </Box>
          </Grid>

        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            © {new Date().getFullYear()} TripBooking. Tous droits réservés.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" underline="none" sx={{ color: 'grey.500', fontSize: '0.875rem', '&:hover': { color: '#00BFA5' } }}>
              Mentions légales
            </Link>
            <Link href="#" underline="none" sx={{ color: 'grey.500', fontSize: '0.875rem', '&:hover': { color: '#00BFA5' } }}>
              Politique de confidentialité
            </Link>
            <Link href="#" underline="none" sx={{ color: 'grey.500', fontSize: '0.875rem', '&:hover': { color: '#00BFA5' } }}>
              CGV
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
