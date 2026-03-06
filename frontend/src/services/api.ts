import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const tripAPI = {
  list: (params?: any) => api.get('/trips', { params }),
  get: (id: number) => api.get(`/trips/${id}`),
  create: (data: any) => api.post('/trips', data),
  update: (id: number, data: any) => api.put(`/trips/${id}`, data),
  delete: (id: number) => api.delete(`/trips/${id}`),
};

export const destinationAPI = {
  list: () => api.get('/destinations'),
  popular: () => api.get('/destinations/popular'),
  get: (id: number) => api.get(`/destinations/${id}`),
};

export const searchAI = {
  smartSearch: (query: string) => api.post('/ai/search', { query }),
};

export const bookingAPI = {
  create: (data: any) => api.post('/bookings', data),
  get: (id: number) => api.get(`/bookings/${id}`),
  myBookings: () => api.get('/bookings/me'),
};

// Admin APIs
export const adminAPI = {
  // Stats
  getStats: () => api.get('/admin/stats'),
  getDetailedStats: () => api.get('/admin/stats/detailed'),
  getFinancialStats: () => api.get('/admin/financial'),
  getSystemHealth: () => api.get('/admin/system/health'),
  
  // Users
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id: number, isActive: boolean) => 
    api.put(`/admin/users/${id}/status`, { is_active: isActive }),
  
  // Organizers
  getOrganizers: () => api.get('/admin/organizers'),
  approveOrganizer: (id: number) => 
    api.put(`/admin/organizers/${id}/approve`),
  blockOrganizer: (id: number) => 
    api.put(`/admin/organizers/${id}/block`),
  
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: any) => api.post('/admin/categories', data),
  
  // Destinations
  getDestinations: () => api.get('/admin/destinations'),
  createDestination: (data: any) => api.post('/admin/destinations', data),
};

export default api;
