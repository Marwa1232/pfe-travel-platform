import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import api from '../services/api';

interface Destination {
  id: number;
  name: string;
  country: string;
  region?: string;
}

const Destinations: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await api.get('/destinations');
        setDestinations(response.data);
      } catch (error) {
        console.error('Error loading destinations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        <PublicIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle', color: 'primary.main' }} />
        Destinations
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Découvrez les destinations les plus populaires pour vos prochaines aventures
      </Typography>

      {loading ? (
        <Typography>Chargement...</Typography>
      ) : (
        <Grid container spacing={3}>
          {destinations.map((dest) => (
            <Grid xs={12} sm={6} md={4} key={dest.id}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold">{dest.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{dest.country}</Typography>
                  {dest.region && <Typography variant="caption" color="text.secondary">{dest.region}</Typography>}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Destinations;
