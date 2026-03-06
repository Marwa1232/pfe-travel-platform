import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { tripAPI } from '../services/api';
import TripCard from '../components/TripCard';

interface Trip {
  id: number;
  [key: string]: any;
}

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    destination: '',
    category: '',
    min_price: '',
    max_price: '',
  });

  useEffect(() => {
    loadTrips();
  }, [filters]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.list(filters);
      setTrips(response.data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        
        {/* Sidebar Filters */}
        <Grid xs={12} md={3}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Destination</InputLabel>
            <Select
              value={filters.destination}
              label="Destination"
              onChange={(e) =>
                setFilters({ ...filters, destination: e.target.value })
              }
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="1">Tunis</MenuItem>
              <MenuItem value="2">Djerba</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Prix min"
            type="number"
            value={filters.min_price}
            onChange={(e) =>
              setFilters({ ...filters, min_price: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Prix max"
            type="number"
            value={filters.max_price}
            onChange={(e) =>
              setFilters({ ...filters, max_price: e.target.value })
            }
          />
        </Grid>

        {/* Trip List */}
        <Grid xs={12} md={9}>
          {loading ? (
            <Typography>Chargement...</Typography>
          ) : (
            <Grid container spacing={3}>
              {trips.map((trip) => (
                <Grid xs={12} sm={6} md={4} key={trip.id}>
                  <TripCard trip={trip as any} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default TripList;