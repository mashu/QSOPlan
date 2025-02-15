import { create } from 'zustand';
import axios from 'axios';  // Added back for type checking
import api from './api';
import type { User } from './types';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  login: (username: string, password: string) => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: null,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ token: null, user: null });
  },
  login: async (username, password) => {
    try {
      const response = await api.post('/api/token/', { username, password });
      const token = response.data.access;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      set({ token });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error;
      } else {
        throw new Error('Network error occurred during login');
      }
    }
  },
}));

export default useAuthStore;
