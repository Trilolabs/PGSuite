import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

const API_BASE = Platform.OS === 'web'
  ? 'http://127.0.0.1:8001/api/v1'
  : 'http://10.0.2.2:8001/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const refresh = await storage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          await storage.setItem('access_token', res.data.access);
          orig.headers.Authorization = `Bearer ${res.data.access}`;
          return api(orig);
        } catch {
          await storage.removeItem('access_token');
          await storage.removeItem('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login/', data),
  register: (data: any) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
};

export const propertyApi = {
  list: () => api.get('/properties/'),
  get: (id: string) => api.get(`/properties/${id}/`),
};

export const tenantApi = {
  list: (pid: string, params?: any) => api.get(`/properties/${pid}/tenants/`, { params }),
  get: (pid: string, id: string) => api.get(`/properties/${pid}/tenants/${id}/`),
  create: (pid: string, data: any) => api.post(`/properties/${pid}/tenants/`, data),
};

export const duesApi = {
  list: (pid: string, params?: any) => api.get(`/properties/${pid}/dues/`, { params }),
  summary: (pid: string) => api.get(`/properties/${pid}/dues/summary/`),
};

export const paymentApi = {
  list: (pid: string, params?: any) => api.get(`/properties/${pid}/payments/`, { params }),
  summary: (pid: string) => api.get(`/properties/${pid}/payments/summary/`),
  create: (pid: string, data: any) => api.post(`/properties/${pid}/payments/`, data),
};

export const expenseApi = {
  list: (pid: string, params?: any) => api.get(`/properties/${pid}/expenses/`, { params }),
  summary: (pid: string) => api.get(`/properties/${pid}/expenses/summary/`),
  create: (pid: string, data: any) => api.post(`/properties/${pid}/expenses/`, data),
};

export const roomApi = {
  list: (pid: string) => api.get(`/properties/${pid}/rooms/`),
  stats: (pid: string) => api.get(`/properties/${pid}/rooms/stats/`),
};

export const complaintApi = {
  list: (pid: string) => api.get(`/maintenance/properties/${pid}/complaints/`),
  create: (pid: string, data: any) => api.post(`/maintenance/properties/${pid}/complaints/`, data),
};

export const reviewApi = {
  list: (pid: string) => api.get(`/maintenance/properties/${pid}/reviews/`),
  summary: (pid: string) => api.get(`/maintenance/properties/${pid}/reviews/summary/`),
};

export const taskApi = {
  list: (pid: string, params?: any) => api.get(`/maintenance/properties/${pid}/tasks/`, { params }),
  create: (pid: string, data: any) => api.post(`/maintenance/properties/${pid}/tasks/`, data),
  complete: (pid: string, id: string) => api.post(`/maintenance/properties/${pid}/tasks/${id}/complete/`),
  stats: (pid: string) => api.get(`/maintenance/properties/${pid}/tasks/stats/`),
  templates: (pid: string) => api.get(`/maintenance/properties/${pid}/task-templates/`),
};

export const listingApi = {
  list: () => api.get('/listings/'),
  stats: () => api.get('/listings/stats/'),
  autoCreate: () => api.post('/listings/auto-create/'),
  toggle: (id: string) => api.post(`/listings/${id}/toggle-status/`),
};

export const leadApi = {
  list: (pid: string) => api.get(`/properties/${pid}/leads/`),
  stats: (pid: string) => api.get(`/properties/${pid}/leads/stats/`),
};

export const dashboardApi = {
  overview: () => api.get('/dashboard/dashboard/'),
};

export const reportsApi = {
  generate: (data: any) => api.post('/reports/generate/', data),
  past: (type: string) => api.get('/reports/past/', { params: { type } }),
};
