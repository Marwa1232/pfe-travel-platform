import React from 'react';
import { Container, Typography, Box, Grid, Button, Fade, Divider, Chip, Avatar } from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { 
  ArrowForward, 
  Language, 
  GppGood,
  Stars, 
  MilitaryTech,
  Verified,
  EmojiEvents,
  RocketLaunch,
  Security,
  Diamond,
  WorkspacePremium,
  TrendingUp,
  FlightTakeoff,
  Public,
  Shield,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

            const fadeUp = keyframes({         from: { opacity: 0, transform: 'translateY(30px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
  }); 

  const float = keyframes({        '0%, 100%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' },
}); 

// ─── STYLED COMPONENTS ──────────────────────────────────────────
const HeroSection = styled(Box)({
  position: 'relative',
  overflow: 'hidden',
  paddingTop: 80,
  paddingBottom: 60,
});

const HeroBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
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
    background: `radial-gradient(circle, ${alpha(COLORS.navy, 0.06)} 0%, transparent 70%)`,
    animation: `${float} 15s ease-in-out infinite reverse`,
  },
});

const NavLabel = styled(Typography)({
  fontSize: '0.7rem',
  fontWeight: 800,
  letterSpacing: '0.2em',
  color: COLORS.teal,
  textTransform: 'uppercase',
  marginBottom: 20,
  display: 'inline-block',
  padding: '4px 12px',
  backgroundColor: alpha(COLORS.teal, 0.08),
  borderRadius: 20,
});

const LargeTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  color: COLORS.navy,
  lineHeight: 1,
  letterSpacing: '-0.03em',
  fontSize: '4rem',
  [theme.breakpoints.down('md')]: { fontSize: '2.5rem' },
  [theme.breakpoints.down('sm')]: { fontSize: '2rem' },
}));

const StatCard = styled(Box)({
  padding: '24px 20px',
  borderRadius: 2,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  backgroundColor: COLORS.white,
  transition: 'all 0.3s ease',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: COLORS.teal,
    boxShadow: `0 12px 24px ${alpha(COLORS.navy, 0.08)}`,
  },
});

const FeatureItem = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 20,
  padding: '24px 20px',
      borderRadius: 2,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  transition: 'all 0.3s ease',
  backgroundColor: COLORS.white,
  '&:hover': {
    transform: 'translateX(8px)',
    borderColor: COLORS.teal,
    boxShadow: `0 8px 20px ${alpha(COLORS.navy, 0.06)}`,
  },
});

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 2,
  padding: '14px 32px',
  fontSize: '0.85rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'none',
  color: COLORS.white,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${alpha(COLORS.teal, 0.35)}`,
  },
});

const OutlineButton = styled(Button)({
  borderRadius: 12,
  padding: '14px 32px',
  fontSize: '0.85rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'none',
  borderColor: COLORS.teal,
  color: COLORS.teal,
  '&:hover': {
    borderColor: COLORS.navy,
    backgroundColor: alpha(COLORS.teal, 0.05),
    transform: 'translateY(-2px)',
  },
});

const CTASection = styled(Box)({
  marginTop: 80,
  padding: '60px 40px',
  borderRadius: 2,
  background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.teal} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  textAlign: 'center',
});

const About: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { 
      title: 'Vérification Premium', 
      desc: 'Audit complet de chaque organisateur avec vérification d\'identité et certification professionnelle.',
      icon: <MilitaryTech sx={{ fontSize: 28 }} />,
      color: COLORS.teal,
    },
    { 
      title: 'Transactions Sécurisées', 
      desc: 'Chiffrement AES-256 bits. Vos fonds sont protégés par un système de séquestre jusqu\'au départ.',
      icon: <GppGood sx={{ fontSize: 28 }} />,
      color: COLORS.teal,
    },
    { 
      title: 'Excellence Premium', 
      desc: 'Accès privilégié à des itinéraires exclusifs, loin du tourisme de masse.',
      icon: <Diamond sx={{ fontSize: 28 }} />,
      color: COLORS.amber,
    },
    { 
      title: 'Assistance Globale', 
      desc: 'Coordination en temps réel sur tous les fuseaux horaires pour une assistance sans faille 24/7.',
      icon: <Public sx={{ fontSize: 28 }} />,
      color: COLORS.teal,
    },
  ];

  const stats = [
    { value: '500+', label: 'Destinations Exclusives', icon: <FlightTakeoff sx={{ fontSize: 24 }} />, color: COLORS.teal },
    { value: '50K+', label: 'Voyageurs Satisfaits', icon: <TrendingUp sx={{ fontSize: 24 }} />, color: COLORS.navy },
    { value: '4.9', label: 'Note de Confiance', icon: <Verified sx={{ fontSize: 24 }} />, color: COLORS.amber },
    { value: '24/7', label: 'Support Conciergerie', icon: <Security sx={{ fontSize: 24 }} />, color: COLORS.teal },
  ];

  return (
    <Box sx={{ bgcolor: alpha(COLORS.navy, 0.02), minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* Hero Section */}
      <HeroSection>
        <HeroBackground />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Box sx={{ display: 'inline-block', mb: 2 }}>
                <NavLabel>
                  <Verified sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                  L'EXCELLENCE TECHNOLOGIQUE
                </NavLabel>
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  fontWeight: 900,
                  color: COLORS.navy,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  mb: 3,
                }}
              >
                L'art de voyager{' '}
                <Box component="span" sx={{ color: COLORS.teal }}>autrement</Box>
              </Typography>
              <Typography
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  color: alpha(COLORS.navy, 0.6),
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                }}
              >
                TripBooking redéfinit les standards du voyage moderne en fusionnant 
                sécurité de pointe et expériences exclusives.
              </Typography>
            </Box>
          </Fade>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 10 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={500 + index * 100}>
                  <StatCard>
                    <Avatar sx={{ 
                      width: 56, height: 56, 
                      bgcolor: alpha(stat.color, 0.1), 
                      color: stat.color, 
                      mx: 'auto', 
                      mb: 2,
                      borderRadius: 2,
                    }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h3" fontWeight={800} sx={{ color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </StatCard>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Main Content */}
          <Grid container spacing={6}>
            <Grid item xs={12} md={5}>
              <Fade in timeout={600}>
                <Box sx={{ position: 'sticky', top: 100 }}>
                  <Box sx={{ mb: 2 }}>
                    <NavLabel>NOTRE PHILOSOPHIE</NavLabel>
                  </Box>
                  <LargeTitle>
                    La confiance ne se donne pas, elle se mérite.
                  </LargeTitle>
                  <Divider sx={{ my: 3, borderColor: alpha(COLORS.teal, 0.2), width: 60 }} />
                  <Typography sx={{ color: alpha(COLORS.navy, 0.7), mb: 4, lineHeight: 1.8, fontSize: '1rem' }}>
                    Chaque étape de votre voyage est protégée par nos protocoles rigoureux. 
                    Nous collaborons uniquement avec des experts locaux certifiés et vérifiés.
                  </Typography>
                  <GradientButton 
                    onClick={() => navigate('/trips')} 
                    endIcon={<ArrowForward />}
                  >
                    Explorer la Collection
                  </GradientButton>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {features.map((feature, index) => (
                  <Fade in timeout={700 + index * 100} key={index}>
                    <FeatureItem>
                      <Avatar sx={{ 
                        width: 52, 
                        height: 52, 
                        bgcolor: alpha(feature.color, 0.1), 
                        color: feature.color,
                        borderRadius: 2,
                      }}>
                        {feature.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ color: COLORS.navy, mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), lineHeight: 1.6 }}>
                          {feature.desc}
                        </Typography>
                      </Box>
                    </FeatureItem>
                  </Fade>
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Programme Fidélité Section */}
          <Fade in timeout={800}>
            <Box sx={{ mt: 12, mb: 4 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box>
                    <NavLabel>PROGRAMME FIDÉLITÉ</NavLabel>
                    <Typography variant="h3" fontWeight={800} sx={{ color: COLORS.navy, mb: 2, letterSpacing: '-0.02em' }}>
                      Voyagez plus,<br />
                      économisez plus
                    </Typography>
                    <Typography sx={{ color: alpha(COLORS.navy, 0.7), mb: 3, lineHeight: 1.7 }}>
                      Gagnez des points à chaque réservation et bénéficiez de réductions exclusives 
                      sur vos prochains voyages. Plus vous voyagez, plus vous économisez.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<EmojiEvents sx={{ fontSize: 16 }} />}
                        label="1 point = 10 EUR dépensés"
                        sx={{ bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber, borderRadius: 8 }}
                      />
                      <Chip 
                        icon={<WorkspacePremium sx={{ fontSize: 16 }} />}
                        label="Jusqu'à 20% de réduction"
                        sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, borderRadius: 8 }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 4, 
                    borderRadius: 2, 
                    bgcolor: COLORS.white, 
                    border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
                    textAlign: 'center',
                  }}>
                    <RocketLaunch sx={{ fontSize: 48, color: COLORS.teal, mb: 2 }} />
                    <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, mb: 1 }}>
                      Rejoignez le programme
                    </Typography>
                    <Typography sx={{ color: alpha(COLORS.navy, 0.6), mb: 3 }}>
                      Créez votre compte gratuitement et commencez à cumuler des points
                    </Typography>
                    <OutlineButton onClick={() => navigate('/register')}>
                      Créer mon compte
                    </OutlineButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>

          {/* CTA Section */}
          <Fade in timeout={900}>
            <CTASection>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <WorkspacePremium sx={{ fontSize: 56, color: COLORS.white, mb: 2, opacity: 0.9 }} />
                <Typography variant="h3" fontWeight={900} sx={{ color: COLORS.white, mb: 2, letterSpacing: '-0.02em' }}>
                  L'excellence est un choix.
                </Typography>
                <Typography sx={{ opacity: 0.9, mb: 4, maxWidth: 500, mx: 'auto', fontSize: '1rem' }}>
                  Rejoignez une communauté de voyageurs qui ne font aucun compromis sur la qualité et la sécurité.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/organizer-request')}
                    sx={{ 
                      bgcolor: COLORS.amber, 
                      color: COLORS.white, 
                      px: 5, 
                      py: 1.5, 
                          borderRadius: 2, 
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      '&:hover': { bgcolor: alpha(COLORS.amber, 0.85), transform: 'translateY(-2px)' } 
                    }}
                  >
                    DEVENIR ORGANISATEUR
                  </Button>
                  <OutlineButton 
                    onClick={() => navigate('/trips')}
                    sx={{ bgcolor: COLORS.white, color: COLORS.navy, borderColor: COLORS.white }}
                  >
                    DÉCOUVRIR LES VOYAGES
                  </OutlineButton>
                </Box>
              </Box>
            </CTASection>
          </Fade>
        </Container>
      </HeroSection>
    </Box>
  );
};

export default About;