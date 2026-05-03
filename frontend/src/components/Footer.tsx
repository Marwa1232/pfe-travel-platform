import React from 'react';
import { Box, Container, Typography, Link, IconButton, Divider, Grid } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const LUNA = {
  TEAL: '#0EA5A0',
  NAVY: '#0F2D5C',
  DARK: '#050B17', // Un bleu encore plus sombre pour le fond du footer
};

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: LUNA.DARK,
        color: '#FFFFFF',
        pt: 2, // Padding top réduit
        pb: 1, // Padding bottom réduit
        mt: 'auto',
        borderTop: `1px solid ${LUNA.NAVY}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={1} alignItems="flex-start">
          
          {/* Colonne 1: Logo & Social */}
          <Grid item xs={12} md={4}>
             {/* Logo avec dégradé Teal -> Navy */}
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Arizonia", cursive',
                fontSize: '1.6rem',
                background: `linear-gradient(135deg,  #0EA5A0, #0F2D5C )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
                textAlign: { xs: 'center', md: 'left' }
              }}
              onClick={() => (window.location.href = '/')}
            >
              TripBooking
            </Typography>
          
            <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1, maxWidth: '250px' }}>
              Explorez le monde avec des expériences uniques et des réservations simplifiées.
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: LUNA.TEAL } }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: LUNA.TEAL } }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Colonne 2: Liens Rapides (Compact) */}
          <Grid item xs={6} md={4}>
            <Typography variant="subtitle2" sx={{ color: LUNA.TEAL, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Link href="/trips" color="grey.400" variant="body2" underline="none" sx={{ '&:hover': { color: 'white' } }}>Nos Voyages</Link>
              <Link href="/about" color="grey.400" variant="body2" underline="none" sx={{ '&:hover': { color: 'white' } }}>À propos</Link>
              <Link href="/contact" color="grey.400" variant="body2" underline="none" sx={{ '&:hover': { color: 'white' } }}>Contact</Link>
            </Box>
          </Grid>

          {/* Colonne 3: Contact (Compact) */}
          <Grid item xs={6} md={4}>
            <Typography variant="subtitle2" sx={{ color: LUNA.TEAL, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
              Contactez-nous
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 16, color: LUNA.TEAL }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>+216 12 345 678</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 16, color: LUNA.TEAL }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>contact@tripbooking.tn</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: LUNA.TEAL }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>Tunis, Tunisie</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 1.5 }} />

        {/* Copyright Simple */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'grey.600' }}>
            © {new Date().getFullYear()} TripBooking.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="grey.600" variant="caption" underline="none" sx={{ '&:hover': { color: 'white' } }}>Confidentialité</Link>
            <Link href="#" color="grey.600" variant="caption" underline="none" sx={{ '&:hover': { color: 'white' } }}>Conditions</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;