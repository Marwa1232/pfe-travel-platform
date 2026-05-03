import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Destinations from './pages/Destinations';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingHistory from './pages/BookingHistory';
import Saved from './pages/Saved';
import SettingsPage from './pages/Settings';
import OrganizerRequest from './pages/OrganizerRequest';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Moments from './pages/Moments';
import TravelTypesArticle from './pages/Traveltypesarticle';
import CheckoutPage from './pages/CheckoutPage';
import LoyaltyOffersPage from './pages/LoyaltyOffersPage';

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerTrips from './pages/organizer/OrganizerTrips';
import TripForm from './pages/organizer/TripForm';
import OrganizerBookings from './pages/organizer/OrganizerBookings';
import OrganizerReviews from './pages/organizer/OrganizerReviews';
import OrganizerCalendar from './pages/organizer/Organizercalendar';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrganizers from './pages/admin/AdminOrganizers';

import { store } from './store';

// ─── COMPOSANT WRAPPER POUR LE PADDING ──────────────────────────────────────
// Ce composant ajoute l'espace de 72px en haut pour éviter que le contenu
// soit caché sous la Navbar. On l'utilise partout SAUF sur la Home.
const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ pt: '72px' }}>
    {children}
  </Box>
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            
            {/* Le padding global 'pt: 72px' a été supprimé ici */}
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Home : Pas de PageContainer pour que l'image Hero soit tout en haut */}
                <Route path="/" element={<Home />} />

                {/* Toutes les autres routes sont enveloppées dans PageContainer */}
                <Route path="/about" element={<PageContainer><About /></PageContainer>} />
                <Route path="/destinations" element={<PageContainer><Destinations /></PageContainer>} />
                <Route path="/trips" element={<PageContainer><TripList /></PageContainer>} />
                <Route path="/trips/:id" element={<PageContainer><TripDetail /></PageContainer>} />
                <Route path="/login" element={<PageContainer><Login /></PageContainer>} />
                <Route path="/register" element={<PageContainer><Register /></PageContainer>} />
                <Route path="/travel-types" element={<PageContainer><TravelTypesArticle /></PageContainer>} />
                <Route path="/LoyaltyOffresPage" element={<PageContainer><LoyaltyOffersPage /></PageContainer>} />

                {/* User routes */}
                <Route path="/dashboard" element={<PageContainer><Dashboard /></PageContainer>} />
                <Route path="/bookings" element={<PageContainer><BookingHistory /></PageContainer>} />
                <Route path="/saved" element={<PageContainer><Saved /></PageContainer>} />
                <Route path="/settings" element={<PageContainer><SettingsPage /></PageContainer>} />
                <Route path="/organizer-request" element={<PageContainer><OrganizerRequest /></PageContainer>} />
                <Route path="/terms" element={<PageContainer><Terms /></PageContainer>} />
                <Route path="/contact" element={<PageContainer><Contact /></PageContainer>} />
                <Route path="/moments" element={<PageContainer><Moments /></PageContainer>} />
                <Route path="/moments/:tripId" element={<PageContainer><Moments /></PageContainer>} />
                <Route path="/checkout/:bookingId" element={<PageContainer><CheckoutPage /></PageContainer>} />

                {/* Organizer routes */}
                <Route path="/organizer/dashboard" element={<PageContainer><OrganizerDashboard /></PageContainer>} />
                <Route path="/organizer/trips" element={<PageContainer><OrganizerTrips /></PageContainer>} />
                <Route path="/organizer/trips/new" element={<PageContainer><TripForm /></PageContainer>} />
                <Route path="/organizer/trips/:id/edit" element={<PageContainer><TripForm /></PageContainer>} />
                <Route path="/organizer/bookings" element={<PageContainer><OrganizerBookings /></PageContainer>} />
                <Route path="/organizer/reviews" element={<PageContainer><OrganizerReviews /></PageContainer>} />
                <Route path="/organizer/calendar" element={<PageContainer><OrganizerCalendar /></PageContainer>} />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<PageContainer><AdminDashboard /></PageContainer>} />
                <Route path="/admin/users" element={<PageContainer><AdminUsers /></PageContainer>} />
                <Route path="/admin/organizers" element={<PageContainer><AdminOrganizers /></PageContainer>} />
                <Route path="/admin/organizers/:id" element={<PageContainer><AdminOrganizers /></PageContainer>} />
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