import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const BACKEND_URL = 'http://localhost:8000';

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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/user/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
    api.post('/user/change-password', data),
  updatePreferences: (data: { interests?: string[] }) =>
    api.put('/user/preferences', data),
  updateSocialLinks: (data: { facebook?: string; instagram?: string; website?: string; linkedin?: string; x_link?: string }) =>
    api.put('/user/social-links', data),
  deleteAccount: (password: string) =>
    api.delete('/user/account', { data: { password } }),
  disableAccount: (password: string) =>
    api.post('/user/account/disable', { password }),
};

export const organizerAPI = {
  getStats: () => api.get('/organizer/stats'),
  getBookings: (params?: any) => api.get('/organizer/bookings', { params }),
  getTrips: (params?: any) => api.get('/organizer/trips', { params }),
  getReviews: (params?: any) => api.get('/organizer/reviews', { params }),
  updateProfile: (data: any) => api.put('/organizer/profile', data),
};

export const tripAPI = {
  list: (params?: any) => api.get('/trips', { params }),
  get: (id: number) => api.get(`/trips/${id}`),
  create: (data: any, config?: any) => api.post('/trips', data, config),
  update: (id: number, data: any, config?: any) => api.put(`/trips/${id}`, data, config),
  delete: (id: number) => api.delete(`/trips/${id}`),
  getPolicy: (id: number) => api.get(`/trips/${id}/policy`),
  cancelSession: (tripId: number, sessionId: number) => api.post(`/trips/${tripId}/sessions/${sessionId}/cancel`, {}),
  uploadImages: (files: File[], tripId?: number, isCover: boolean = false) => {
    const formData = new FormData();
    files.forEach((file) => {
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
  getPersonalized: (limit?: number) =>
    api.get('/recommendations/personalized', { params: { limit } }),
  getSimilar: (tripId: number, limit?: number) =>
    api.get(`/recommendations/similar/${tripId}`, { params: { limit } }),
  getTrending: (limit?: number) =>
    api.get('/recommendations/trending', { params: { limit } }),
  submitFeedback: (tripId: number, feedback: 'like' | 'dislike' | 'booked' | 'hidden') =>
    api.post('/recommendations/feedback', { trip_id: tripId, feedback }),
  searchBased: (query: string) =>
    api.post('/recommendations/search-based', { query }),
  getStatus: () => api.get('/recommendations/status'),
};

export const reviewAPI = {
  getTripReviews: (tripId: number) =>
    api.get(`/reviews/trip/${tripId}`),
  createReview: (data: { trip_id: number; rating: number; comment?: string }) =>
    api.post('/reviews', data),
  canReview: (tripId: number) =>
    api.get(`/reviews/can-review/${tripId}`),
  deleteReview: (id: number) =>
    api.delete(`/reviews/${id}`),
};

export const organizerReviewAPI = {
  getAll: (status?: string) =>
    api.get('/organizer/reviews', { params: { status } }),
  approve: (id: number) =>
    api.put(`/organizer/reviews/${id}/approve`),
  reject: (id: number) =>
    api.put(`/organizer/reviews/${id}/reject`),
  respond: (id: number, response: string) =>
    api.put(`/organizer/reviews/${id}/respond`, { response }),
  flag: (id: number, reason: string) =>
    api.put(`/organizer/reviews/${id}/flag`, { reason }),
};

export const bookingAPI = {
  create: (data: any) => api.post('/bookings', data),
  get: (id: number) => api.get(`/bookings/${id}`),
  myBookings: () => api.get('/bookings/me'),
  getByTrip: (tripId: number) => api.get(`/bookings/trip/${tripId}`),
  delete: (id: number) => api.delete(`/bookings/${id}`),
  getCancelOptions: (id: number) => api.get(`/bookings/${id}/cancel-options`),
  cancel: (id: number, choice: string) => api.post(`/bookings/${id}/cancel`, { choice }),
};

export const paymentAPI = {
  // body optionnel : { offer_id? }
  createIntent: (bookingId: number, body?: { offer_id?: number | null }) =>
    api.post(`/payments/create-intent/${bookingId}`, body ?? {}),
confirm: (paymentIntentId: string, offerId?: number | null) =>
    api.post('/payments/confirm', { payment_intent_id: paymentIntentId, ...(offerId ? { offer_id: offerId } : {}) }),
  refund: (bookingId: number) =>
    api.post(`/payments/refund/${bookingId}`),
};

export const loyaltyAPI = {
  getPoints: () =>
    api.get('/loyalty/points'),
  getOffers: (tripId?: number, includeInactive?: boolean) =>
    api.get('/loyalty/offers', {
      params: {
        ...(tripId ? { trip_id: tripId } : {}),
        ...(includeInactive ? { include_inactive: '1' } : {}),
      },
    }),
  createOffer: (data: {
    title: string;
    description?: string;
    discount_type: 'percentage_discount' | 'fixed_discount';
    discount_value: string;
    points_required: string;
    trip_id?: number;
    expires_at?: string;
  }) => api.post('/loyalty/offers', data),
  deleteOffer: (id: number) =>
    api.delete(`/loyalty/offers/${id}`),
  activateOffer: (id: number) =>
    api.patch(`/loyalty/offers/${id}/activate`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getDetailedStats: () => api.get('/admin/stats/detailed'),
  getFinancialStats: () => api.get('/admin/financial'),
  getSystemHealth: () => api.get('/admin/system/health'),
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id: number, isActive: boolean) =>
    api.put(`/admin/users/${id}/status`, { is_active: isActive }),
  getOrganizers: () => api.get('/admin/organizers'),
  approveOrganizer: (id: number) =>
    api.put(`/admin/organizers/${id}/approve`),
  blockOrganizer: (id: number) =>
    api.put(`/admin/organizers/${id}/block`),
  getCategories: () => api.get('/admin/categories'),
  getCategory: (id: number) => api.get(`/admin/categories/${id}`),
  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
  getDestinations: () => api.get('/admin/destinations'),
  getDestination: (id: number) => api.get(`/admin/destinations/${id}`),
  createDestination: (data: any) => api.post('/admin/destinations', data),
  updateDestination: (id: number, data: any) => api.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id: number) => api.delete(`/admin/destinations/${id}`),
  getReviews: (params?: { status?: string; flagged?: '1' }) =>
    api.get('/admin/reviews', { params }),
  deleteReview: (id: number) => api.delete(`/admin/reviews/${id}`),
  unflagReview: (id: number) => api.patch(`/admin/reviews/${id}/unflag`),
};

export const momentAPI = {
  getAllMoments: () => api.get('/moments'),
  getTripMoments: (tripId: number) => api.get(`/moments/trip/${tripId}`),
  getMyEligibleBookings: () => api.get('/moments/my-bookings'),
  createMoment: (formData: FormData) => api.post('/moments', formData),
  deleteMoment: (id: number) => api.delete(`/moments/${id}`),
};

export const favoriteAPI = {
  list: () => api.get('/favorites'),
  add: (tripId: number) => api.post(`/favorites/${tripId}`),
  remove: (tripId: number) => api.delete(`/favorites/${tripId}`),
  check: (tripId: number) => api.get(`/favorites/check/${tripId}`),
  toggle: (tripId: number) => api.post(`/favorites/toggle/${tripId}`),
};

export default api;