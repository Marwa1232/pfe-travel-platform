import React from 'react';
import { Box, Container, Typography, Link, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0A0F1C',
        color: '#FFFFFF',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        {/* Logo avec police Arizonia */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Arizonia", cursive',
              fontWeight: 400,
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
            onClick={() => window.location.href = '/'}
          >
            TripBooking
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

        {/* 3 colonnes */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Colonne 1 - Contact */}
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <PhoneIcon sx={{ fontSize: 18, color: '#00BFA5' }} />
              <Typography variant="body2" sx={{ color: 'grey.400' }}>+216 12 345 678</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <EmailIcon sx={{ fontSize: 18, color: '#00BFA5' }} />
              <Typography variant="body2" sx={{ color: 'grey.400' }}>contact@tripbooking.tn</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 18, color: '#00BFA5' }} />
              <Typography variant="body2" sx={{ color: 'grey.400' }}>Tunis, Tunisie</Typography>
            </Box>
          </Box>

          {/* Colonne 2 - Liens rapides */}
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
              Liens
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Link href="/trips" color="grey.400" underline="hover" sx={{ '&:hover': { color: '#00BFA5' } }}>Voyages</Link>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Link href="/about" color="grey.400" underline="hover" sx={{ '&:hover': { color: '#00BFA5' } }}>À propos</Link>
            </Typography>
            <Typography variant="body2">
              <Link href="/contact" color="grey.400" underline="hover" sx={{ '&:hover': { color: '#00BFA5' } }}>Contact</Link>
            </Typography>
          </Box>

          {/* Colonne 3 - Légal */}
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
              Légal
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Link href="#" color="grey.400" underline="hover" sx={{ '&:hover': { color: '#00BFA5' } }}>Mentions légales</Link>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Link href="#" color="grey.400" underline="hover" sx={{ '&:hover': { color: '#00BFA5' } }}>CGV</Link>
            </Typography>
            <Typography variant="body2">
              <Link href="#" color="grey.400" underline="hover" sx={{ '&:hover': { color: '#00BFA5' } }}>Confidentialité</Link>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright */}
        <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center', mt: 3 }}>
          © {new Date().getFullYear()} TripBooking. Tous droits réservés.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;