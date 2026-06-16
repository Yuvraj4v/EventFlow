// ============================================================
// Auth Store - Global auth state with Zustand
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // ─── Login ────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success(data.message || 'Welcome back!');
          return { success: true, user: data.user };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      // ─── Register ─────────────────────────────────────────
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', userData);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success(data.message || 'Welcome to EventFlow!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      // ─── Logout ───────────────────────────────────────────
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
      },

      // ─── Fetch current user ───────────────────────────────
      fetchUser: async () => {
        const { token } = get();
        if (!token) return;
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch (error) {
          // Token expired or invalid
          set({ user: null, token: null, isAuthenticated: false });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      // ─── Update user (after profile edit) ─────────────────
      updateUser: (userData) => {
        set(state => ({ user: { ...state.user, ...userData } }));
      },

      // ─── Toggle saved event ───────────────────────────────
      toggleSavedEvent: (eventId) => {
        set(state => {
          const savedEvents = state.user?.savedEvents || [];
          const isAlreadySaved = savedEvents.some(id => id === eventId || id?._id === eventId);
          return {
            user: {
              ...state.user,
              savedEvents: isAlreadySaved
                ? savedEvents.filter(id => (id?._id || id) !== eventId)
                : [...savedEvents, eventId]
            }
          };
        });
      }
    }),
    {
      name: 'eventflow-auth', // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
    }
  )
);

export default useAuthStore;
