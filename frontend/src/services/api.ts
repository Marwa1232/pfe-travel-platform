import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const BACKEND_URL = 'http://localhost:8000';

// Helper to fix image URLs - prepend backend URL for relative paths
export const fixImageUrl = (url: string | undefined | null): string => {
  if (!url) return '/placeholder.jpg';
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
  // Remove Content-Type for FormData to let browser set multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
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
  get: (id: number) => api.get(`/destinations/${id}`),
};

export const searchAI = {
  smartSearch: (query: string) => api.post('/ai/search', { query }),
};

export const recommendationAPI = {
  // Get personalized recommendations (requires auth)
  getPersonalized: (limit?: number) => 
    api.get('/recommendations/personalized', { params: { limit } }),
  
  // Get similar trips to a given trip
  getSimilar: (tripId: number, limit?: number) => 
    api.get(`/recommendations/similar/${tripId}`, { params: { limit } }),
  
  // Get trending trips
  getTrending: (limit?: number) => 
    api.get('/recommendations/trending', { params: { limit } }),
  
  // Submit feedback on recommendations
  submitFeedback: (tripId: number, feedback: 'like' | 'dislike' | 'booked' | 'hidden') => 
    api.post('/recommendations/feedback', { trip_id: tripId, feedback }),
  
  // Get search-based recommendations (no auth required)
  searchBased: (query: string) => 
    api.post('/recommendations/search-based', { query }),
  
  // Check LLM service status
  getStatus: () => api.get('/recommendations/status'),
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
  getCategory: (id: number) => api.get(`/admin/categories/${id}`),
  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
  
  // Destinations
  getDestinations: () => api.get('/admin/destinations'),
  getDestination: (id: number) => api.get(`/admin/destinations/${id}`),
  createDestination: (data: any) => api.post('/admin/destinations', data),
  updateDestination: (id: number, data: any) => api.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id: number) => api.delete(`/admin/destinations/${id}`),
};

export default api;
