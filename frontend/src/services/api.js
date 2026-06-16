// ============================================================
// API Service - Axios instance with interceptors
// ============================================================
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (Zustand persist stores it here)
    try {
      const stored = localStorage.getItem('eventflow-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401
      localStorage.removeItem('eventflow-auth');
      // Only redirect if not already on auth page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API helper functions ────────────────────────────────────
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  getBySlug: (slug) => api.get(`/events/slug/${slug}`),
  getFeatured: () => api.get('/events/featured'),
  getSimilar: (id) => api.get(`/events/${id}/similar`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`)
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason })
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getOne: (slug) => api.get(`/categories/${slug}`)
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  toggleSaveEvent: (eventId) => api.post(`/users/save-event/${eventId}`),
  getSavedEvents: () => api.get('/users/saved-events'),
  getDashboardStats: () => api.get('/users/dashboard-stats')
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  toggleFeatured: (id) => api.patch(`/admin/events/${id}/featured`),
  updateEventStatus: (id, status) => api.patch(`/admin/events/${id}/status`, { status })
};
