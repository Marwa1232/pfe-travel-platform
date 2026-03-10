import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const BACKEND_URL = 'http://localhost:8000';

// Helper to fix image URLs - prepend backend URL for relative paths
export const fixImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return BACKEND_URL + url;
};

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
  create: (data: any, config?: any) => api.post('/trips', data, config),
  update: (id: number, data: any, config?: any) => api.put(`/trips/${id}`, data, config),
  delete: (id: number) => api.delete(`/trips/${id}`),
  uploadImages: (files: File[], tripId?: number, isCover: boolean = false) => {
    console.log('[DEBUG API] uploadImages called with files:', files.length);
    const formData = new FormData();
    files.forEach((file, index) => {
      console.log('[DEBUG API] Adding file:', index, file.name, file.size);
      formData.append('images[]', file);
    });
    if (tripId) {
      formData.append('trip_id', tripId.toString());
    }
    formData.append('is_cover', isCover.toString());
    return api.post('/trips/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
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
  delete: (id: number) => api.delete(`/bookings/${id}`),
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
