import { create } from 'zustand';
import { authApi } from '../lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: string;
    avatar_url: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; name: string; phone: string; password: string; confirm_password: string }) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await authApi.login({ email, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Login failed';
            set({ error: msg, isLoading: false });
            throw err;
        }
    },

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await authApi.register(data);
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || 'Registration failed';
            set({ error: msg, isLoading: false });
            throw err;
        }
    },

    logout: async () => {
        const refresh = localStorage.getItem('refresh_token');
        try {
            if (refresh) await authApi.logout(refresh);
        } catch { }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
    },

    loadUser: async () => {
        if (!localStorage.getItem('access_token')) return;
        set({ isLoading: true });
        try {
            const res = await authApi.me();
            set({ user: res.data, isAuthenticated: true, isLoading: false });
        } catch {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
