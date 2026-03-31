import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  FlightTakeoff,
  People,
  Star,
  SupportAgent,
  Verified,
  EmojiEvents,
} from '@mui/icons-material';

// Styled components professionnels
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 60,
    height: 4,
    background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
    borderRadius: 2,
  },
}));

const ValueCard = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.1),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
    borderColor: theme.palette.primary.main,
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
    boxShadow: '0 8px 20px rgba(0,191,165,0.3)',
  },
}));

const About: React.FC = () => {
  const stats = [
    { value: '500+', label: 'Destinations', icon: <FlightTakeoff />, color: '#00BFA5' },
    { value: '50K+', label: 'Voyageurs', icon: <People />, color: '#0D47A1' },
    { value: '4.8', label: 'Note moyenne', icon: <Star />, color: '#FFD700' },
    { value: '24/7', label: 'Support', icon: <SupportAgent />, color: '#FF6B6B' },
  ];

  const values = [
    {
      title: 'Confiance',
      description: 'Partenaires vérifiés et certifiés',
      icon: <Verified />,
      color: '#00BFA5',
    },
    {
      title: 'Excellence',
      description: 'Qualité de service premium',
      icon: <Star />,
      color: '#0D47A1',
    },
    {
      title: 'Expertise',
      description: 'Guides locaux expérimentés',
      icon: <EmojiEvents />,
      color: '#FFD700',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #1A2027, #2D3748)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              À propos de TripBooking
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Votre partenaire de confiance pour des voyages exceptionnels
            </Typography>
          </Box>
        </Fade>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Zoom in timeout={500 + index * 100}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'white', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, width: 48, height: 48, mx: 'auto', mb: 1 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h5" fontWeight="700" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Mission */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Fade in timeout={500}>
              <Box>
                <SectionTitle>Notre Mission</SectionTitle>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                  TripBooking connecte les voyageurs avec des expériences authentiques à travers le monde. 
                  Nous croyons que chaque voyage doit être unique et inoubliable.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Notre plateforme facilite la découverte de destinations exceptionnelles et met en relation 
                  des voyageurs passionnés avec des organisateurs locaux experts.
                </Typography>
              </Box>
            </Fade>
          </Grid>
          <Grid item xs={12} md={6}>
            <Fade in timeout={700}>
              <Box>
                <SectionTitle>Notre Vision</SectionTitle>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                  Devenir la référence incontournable pour les voyageurs en quête d'authenticité et de qualité.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Nous œuvrons chaque jour pour rendre le voyage accessible à tous, tout en préservant 
                  l'authenticité des cultures et des destinations.
                </Typography>
              </Box>
            </Fade>
          </Grid>
        </Grid>

        {/* Valeurs */}
        <Box sx={{ mb: 6 }}>
          <SectionTitle sx={{ mb: 4 }}>Nos Valeurs</SectionTitle>
          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in timeout={500 + index * 100}>
                  <ValueCard>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Avatar sx={{ bgcolor: alpha(value.color, 0.1), color: value.color, width: 60, height: 60, mb: 2 }}>
                        {value.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {value.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value.description}
                      </Typography>
                    </Box>
                  </ValueCard>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA */}
        <Zoom in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Prêt pour l'aventure ?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Rejoignez notre communauté de voyageurs
            </Typography>
            <GradientButton
              variant="contained"
              href="/trips"
              sx={{
                background: 'white',
                color: '#00BFA5',
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Explorer les voyages
            </GradientButton>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default About;