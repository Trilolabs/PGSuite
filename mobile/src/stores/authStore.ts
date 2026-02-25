import { create } from 'zustand';
import { storage } from '../lib/storage';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    await storage.setItem('access_token', res.data.access);
    await storage.setItem('refresh_token', res.data.refresh);
    set({ user: res.data.user, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await authApi.register(data);
    await storage.setItem('access_token', res.data.access);
    await storage.setItem('refresh_token', res.data.refresh);
    set({ user: res.data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refresh = await storage.getItem('refresh_token');
      if (refresh) await authApi.logout(refresh);
    } catch {}
    await storage.removeItem('access_token');
    await storage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await storage.getItem('access_token');
      if (!token) { set({ isLoading: false }); return; }
      const res = await authApi.me();
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },
}));
