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
  Divider,
  Fade,
  Zoom,
  Chip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Info,
  Group,
  TravelExplore,
  Verified,
  SupportAgent,
  RocketLaunch,
  EmojiEvents,
  Public,
  Favorite,
  FlightTakeoff,
  Hotel,
  Restaurant,
  CameraAlt,
  CheckCircle,
  Star,
} from '@mui/icons-material';

// Styled components
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(3),
  transition: 'all 0.3s ease',
  height: '100%',
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
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 32px rgba(0,191,165,0.15)',
  },
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
}));

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
  position: 'relative',
  overflow: 'hidden',
  pt: 12,
  pb: 4,
});

const FloatingIcon = styled(Box)({
  position: 'absolute',
  opacity: 0.1,
  color: '#00BFA5',
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-20px)' },
  },
});

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0,191,165,0.15)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #0D47A1, #00BFA5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0,191,165,0.3)',
  },
}));

const About: React.FC = () => {
  const stats = [
    { value: '500+', label: 'Destinations', icon: <Public />, color: '#00BFA5' },
    { value: '50K+', label: 'Voyageurs', icon: <Group />, color: '#0D47A1' },
    { value: '4.8', label: 'Note moyenne', icon: <Star />, color: '#FFD700' },
    { value: '24/7', label: 'Support client', icon: <SupportAgent />, color: '#FF6B6B' },
  ];

  const values = [
    {
      title: 'Sécurité & Confiance',
      icon: <Verified sx={{ fontSize: 40 }} />,
      description: 'Tous nos partenaires sont vérifiés et certifiés',
      color: '#00BFA5',
    },
    {
      title: 'Expériences Uniques',
      icon: <TravelExplore sx={{ fontSize: 40 }} />,
      description: 'Des voyages authentiques et personnalisés',
      color: '#0D47A1',
    },
    {
      title: 'Durabilité',
      icon: <Favorite sx={{ fontSize: 40 }} />,
      description: 'Tourisme responsable et respectueux',
      color: '#FF6B6B',
    },
    {
      title: 'Support Premium',
      icon: <SupportAgent sx={{ fontSize: 40 }} />,
      description: 'Assistance 24/7 en plusieurs langues',
      color: '#FFA07A',
    },
  ];

  const team = [
    { name: 'Ahmed Ben Ali', role: 'Fondateur & CEO', avatar: '👨‍💼' },
    { name: 'Sarra Mansour', role: 'Directrice des opérations', avatar: '👩‍💼' },
    { name: 'Mehdi Trabelsi', role: 'Responsable partenariats', avatar: '👨‍💻' },
    { name: 'Nour Hamdi', role: 'Support client', avatar: '👩‍💻' },
  ];

  return (
    <BackgroundBox>
      {/* Éléments décoratifs flottants */}
      <FloatingIcon sx={{ top: '15%', left: '5%', transform: 'rotate(-15deg)' }}>
        <FlightTakeoff sx={{ fontSize: 120 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '15%', right: '5%', transform: 'rotate(20deg)' }}>
        <Hotel sx={{ fontSize: 100 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ top: '40%', right: '10%', transform: 'rotate(10deg)' }}>
        <Restaurant sx={{ fontSize: 80 }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '30%', left: '8%', transform: 'rotate(-5deg)' }}>
        <CameraAlt sx={{ fontSize: 90 }} />
      </FloatingIcon>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Info sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="800"
              sx={{
                background: 'linear-gradient(135deg, #00BFA5, #0D47A1, #667eea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              À propos de TripBooking
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Votre plateforme de confiance pour des expériences de voyage inoubliables
            </Typography>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in timeout={500 + index * 100}>
                <StatsCard>
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" fontWeight="700" sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Mission & Équipe */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Fade in timeout={500}>
              <GlassCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: alpha('#00BFA5', 0.1), color: '#00BFA5', width: 60, height: 60 }}>
                      <RocketLaunch sx={{ fontSize: 35 }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight="700">
                      Notre Mission
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    TripBooking connecte les voyageurs avec les organisateurs locaux pour créer 
                    des expériences uniques et authentiques. Nous croyons que chaque voyage 
                    devrait être une aventure inoubliable, et nous travaillons chaque jour pour 
                    rendre cela possible.
                  </Typography>
                  <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="🌍 Voyages authentiques" />
                    <Chip label="🤝 Connexions locales" />
                    <Chip label="✨ Expériences uniques" />
                  </Box>
                </CardContent>
              </GlassCard>
            </Fade>
          </Grid>

          <Grid item xs={12} md={6}>
            <Fade in timeout={700}>
              <GlassCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: alpha('#0D47A1', 0.1), color: '#0D47A1', width: 60, height: 60 }}>
                      <Group sx={{ fontSize: 35 }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight="700">
                      Notre Équipe
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Une équipe passionnée de voyageurs, technologues et experts du tourisme, 
                    unis par la même vision : rendre le voyage accessible à tous.
                  </Typography>
                  <Grid container spacing={2}>
                    {team.map((member, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: alpha('#00BFA5', 0.1) }}>
                            <Typography variant="h6">{member.avatar}</Typography>
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.role}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </GlassCard>
            </Fade>
          </Grid>
        </Grid>

        {/* Nos Valeurs */}
        <GlassPaper sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight="700" align="center" gutterBottom>
            Nos Valeurs Fondamentales
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Ce qui nous guide au quotidien
          </Typography>
          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in timeout={500 + index * 100}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: alpha(value.color, 0.05),
                      border: `1px solid ${alpha(value.color, 0.2)}`,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${alpha(value.color, 0.2)}`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha(value.color, 0.1),
                        color: value.color,
                        width: 70,
                        height: 70,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {value.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </Box>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </GlassPaper>

        {/* Pourquoi Nous Choisir */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Fade in timeout={500}>
              <GlassCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: alpha('#FF6B6B', 0.1), color: '#FF6B6B', width: 60, height: 60 }}>
                      <CheckCircle sx={{ fontSize: 35 }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight="700">
                      Pourquoi Nous Choisir
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {[
                      '🎯 Plus de 500 destinations sélectionnées',
                      '🏆 Guides locaux certifiés et expérimentés',
                      '💬 Support client 24/7 en 5 langues',
                      '🔄 Politique d\'annulation flexible',
                      '💰 Meilleur prix garanti',
                      '⭐ Plus de 10 000 avis 5 étoiles',
                    ].map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
                          <Typography variant="body1">{item}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </GlassCard>
            </Fade>
          </Grid>

          <Grid item xs={12} md={6}>
            <Fade in timeout={700}>
              <GlassCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: alpha('#FFD700', 0.1), color: '#FFD700', width: 60, height: 60 }}>
                      <EmojiEvents sx={{ fontSize: 35 }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight="700">
                      Certifications
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { label: 'Agence certifiée', year: '2024', icon: '🏅' },
                      { label: 'Meilleure plateforme de voyage', year: '2023', icon: '🏆' },
                      { label: 'Prix de l\'innovation touristique', year: '2024', icon: '🌟' },
                      { label: 'Label tourisme durable', year: '2024', icon: '♻️' },
                    ].map((cert, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha('#00BFA5', 0.05),
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h5">{cert.icon}</Typography>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {cert.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {cert.year}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip label="Certifié" size="small" color="primary" />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </GlassCard>
            </Fade>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Zoom in timeout={1000}>
          <GlassPaper
            sx={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #00BFA5, #0D47A1)',
              color: 'white',
            }}
          >
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Prêt à démarrer votre aventure ?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Rejoignez des milliers de voyageurs qui nous font confiance
            </Typography>
            <GradientButton
              size="large"
              href="/trips"
              sx={{
                background: 'white',
                color: '#00BFA5',
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Découvrir les voyages
            </GradientButton>
          </GlassPaper>
        </Zoom>
      </Container>
    </BackgroundBox>
  );
};

export default About;