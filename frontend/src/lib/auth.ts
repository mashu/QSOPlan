import { create } from 'zustand';
import axios from 'axios';
import { User, APIError } from './types';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
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
      const response = await axios.post<{ access: string }>(`${process.env.NEXT_PUBLIC_API_URL}/api/token/`, {
        username,
        password,
      });
      const token = response.data.access;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      set({ token });
    } catch (error) {
      const apiError = error as APIError;
      console.error('Login error:', apiError.response?.data || apiError);
      throw apiError;
    }
  },
}));
