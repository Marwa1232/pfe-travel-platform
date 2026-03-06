// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingHistory from './pages/BookingHistory';
import OrganizerRequest from './pages/OrganizerRequest';

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerTrips from './pages/organizer/OrganizerTrips';
import TripForm from './pages/organizer/TripForm';
import OrganizerBookings from './pages/organizer/OrganizerBookings';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrganizers from './pages/admin/AdminOrganizers';

import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/trips" element={<TripList />} />
                <Route path="/trips/:id" element={<TripDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bookings" element={<BookingHistory />} />
                <Route path="/organizer-request" element={<OrganizerRequest />} />

                {/* Organizer routes */}
                <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
                <Route path="/organizer/trips" element={<OrganizerTrips />} />
                <Route path="/organizer/trips/new" element={<TripForm />} />
                <Route path="/organizer/trips/:id/edit" element={<TripForm />} />
                <Route path="/organizer/bookings" element={<OrganizerBookings />} />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/organizers" element={<AdminOrganizers />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
