import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const About: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        <InfoIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle', color: 'primary.main' }} />
        À propos de TripBooking
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Votre plateforme de confiance pour des expériences de voyage inoubliables
      </Typography>

      <Grid container spacing={4}>
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <TravelExploreIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Notre Mission
              </Typography>
              <Typography variant="body1" color="text.secondary">
                TripBooking连接Voyageurs和Organisateurs，提供独特而难忘的旅行体验。我们致力于让每个人都能够轻松探索世界，发现新的文化和目的地。
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <GroupIcon sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Notre Équipe
              </Typography>
              <Typography variant="body1" color="text.secondary">
                我们是一个充满热情的团队，来自不同背景，但共同热爱旅行。我们相信旅行可以改变生活，丰富心灵。
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <VerifiedIcon sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Nos Valeurs
              </Typography>
              <Typography variant="body1" color="text.secondary">
                - 安全可靠<br/>
                - 透明诚信<br/>
                - 客户服务优先<br/>
                - 可持续旅游
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <SupportAgentIcon sx={{ fontSize: 50, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Pourquoi Nous Choisir
              </Typography>
              <Typography variant="body1" color="text.secondary">
                - 超过500个精选目的地<br/>
                - 专业认证的当地导游<br/>
                - 24/7客户支持<br/>
                - 灵活的取消政策
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Prêt à démarrer votre aventure?
        </Typography>
        <Button variant="contained" size="large" href="/trips">
          Découvrir les voyages
        </Button>
      </Box>
    </Container>
  );
};

export default About;
