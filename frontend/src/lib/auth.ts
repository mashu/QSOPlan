import { create } from 'zustand';
import axios from 'axios';

interface AuthState {
  token: string | null;
  user: any | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
  login: (username: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
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
      console.log('Attempting login with:', { username, password });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/token/`, {
        username,
        password,
      });
      console.log('Login response:', response.data);
      const token = response.data.access;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      set({ token });
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  },
}));
