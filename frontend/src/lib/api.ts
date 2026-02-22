import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8001/api/v1';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 by refreshing token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                try {
                    const res = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
                    localStorage.setItem('access_token', res.data.access);
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// ===================== Auth =====================
export const authApi = {
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login/', data),
    register: (data: { email: string; name: string; phone: string; password: string; confirm_password: string }) =>
        api.post('/auth/register/', data),
    logout: (refresh: string) =>
        api.post('/auth/logout/', { refresh }),
    me: () => api.get('/auth/me/'),
    updateProfile: (data: any) => api.put('/auth/me/', data),
    changePassword: (data: { old_password: string; new_password: string }) =>
        api.post('/auth/password/change/', data),
};

// ===================== Properties =====================
export const propertyApi = {
    list: () => api.get('/properties/'),
    get: (id: string) => api.get(`/properties/${id}/`),
    create: (data: any) => api.post('/properties/', data),
    update: (id: string, data: any) => api.patch(`/properties/${id}/`, data),
    delete: (id: string) => api.delete(`/properties/${id}/`),
    dashboard: (id: string) => api.get(`/properties/${id}/dashboard/`),
    settings: (id: string) => api.get(`/properties/${id}/settings/`),
    updateSettings: (id: string, data: any) => api.put(`/properties/${id}/settings/`, data),
    vacancy: (id: string) => api.get(`/properties/${id}/vacancy/`),
};

// ===================== Rooms =====================
export const roomApi = {
    list: (propId: string) => api.get(`/properties/${propId}/rooms/`),
    get: (propId: string, id: string) => api.get(`/properties/${propId}/rooms/${id}/`),
    create: (propId: string, data: any) => api.post(`/properties/${propId}/rooms/`, data),
    update: (propId: string, id: string, data: any) => api.patch(`/properties/${propId}/rooms/${id}/`, data),
    floors: (propId: string) => api.get(`/properties/${propId}/floors/`),
    createFloor: (propId: string, data: { name: string }) => api.post(`/properties/${propId}/floors/`, data),
    stats: (propId: string) => api.get(`/properties/${propId}/rooms/stats/`),
};

// ===================== Tenants =====================
export const tenantApi = {
    list: (propertyId: string, params?: any) => api.get(`/properties/${propertyId}/tenants/`, { params }),
    get: (propertyId: string, id: string) => api.get(`/properties/${propertyId}/tenants/${id}/`),
    create: (propertyId: string, data: any) => api.post(`/properties/${propertyId}/tenants/`, data),
    update: (propertyId: string, id: string, data: any) => api.patch(`/properties/${propertyId}/tenants/${id}/`, data),
    checkout: (propertyId: string, id: string, data?: any) => api.post(`/properties/${propertyId}/tenants/${id}/checkout/`, data),
    giveNotice: (propertyId: string, id: string) => api.post(`/properties/${propertyId}/tenants/${id}/give-notice/`),
    changeRoom: (propertyId: string, id: string, data: any) => api.post(`/properties/${propertyId}/tenants/${id}/change-room/`, data),
    passbook: (propertyId: string, id: string) => api.get(`/properties/${propertyId}/tenants/${id}/passbook/`),
    documents: (id: string) => api.get(`/tenants/${id}/documents/`),
    uploadDocument: (id: string, data: FormData) => api.post(`/tenants/${id}/documents/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    cancelBooking: (propertyId: string, id: string, data?: any) => api.post(`/properties/${propertyId}/tenants/${id}/cancel-booking/`, data),
    acceptBooking: (propertyId: string, id: string) => api.post(`/properties/${propertyId}/tenants/${id}/accept-booking/`),
};

// ===================== Financials =====================
export const duesApi = {
    list: (propertyId: string, params?: any) => api.get(`/properties/${propertyId}/dues/`, { params }),
    create: (propertyId: string, data: any) => api.post(`/properties/${propertyId}/dues/`, data),
    generate: (propertyId: string) => api.post(`/properties/${propertyId}/dues/generate/`),
    summary: (propertyId: string) => api.get(`/properties/${propertyId}/dues/summary/`),
};

export const paymentApi = {
    list: (propertyId: string, params?: any) => api.get(`/properties/${propertyId}/payments/`, { params }),
    summary: (propertyId: string) => api.get(`/properties/${propertyId}/payments/summary/`),
    create: (propertyId: string, data: any) => api.post(`/properties/${propertyId}/payments/`, data),
    receipt: (propertyId: string, id: string) => api.get(`/properties/${propertyId}/payments/${id}/receipt/`),
};

export const expenseApi = {
    list: (propertyId: string, params?: any) => api.get(`/properties/${propertyId}/expenses/`, { params }),
    create: (propertyId: string, data: any) => api.post(`/properties/${propertyId}/expenses/`, data),
    summary: (propertyId: string) => api.get(`/properties/${propertyId}/expenses/summary/`),
};

// ===================== Dues Packages =====================
export const duesPackageApi = {
    list: (propertyId: string) => api.get(`/properties/${propertyId}/dues-packages/`),
    create: (propertyId: string, data: any) => api.post(`/properties/${propertyId}/dues-packages/`, data),
    update: (propertyId: string, id: string, data: any) => api.patch(`/properties/${propertyId}/dues-packages/${id}/`, data),
    delete: (propertyId: string, id: string) => api.delete(`/properties/${propertyId}/dues-packages/${id}/`),
    toggle: (propertyId: string, id: string) => api.post(`/properties/${propertyId}/dues-packages/${id}/toggle/`),
};

// ===================== Dashboard =====================
export const dashboardApi = {
    overview: () => api.get('/dashboard/'),
};

// ===================== Leads =====================
export const leadApi = {
    list: (propertyId: string, params?: any) => api.get(`/properties/${propertyId}/leads/`, { params }),
    create: (propertyId: string, data: any) => api.post(`/properties/${propertyId}/leads/`, data),
    stats: (propertyId: string) => api.get(`/properties/${propertyId}/leads/stats/`),
};

// ===================== Maintenance =====================
export const complaintApi = {
    list: (propertyId: string) => api.get(`/properties/${propertyId}/complaints/`),
    create: (propertyId: string, data: any) => api.post(`/properties/${propertyId}/complaints/`, data),
    assign: (propertyId: string, id: string, data: any) => api.post(`/properties/${propertyId}/complaints/${id}/assign/`, data),
    resolve: (propertyId: string, id: string, data?: any) => api.post(`/properties/${propertyId}/complaints/${id}/resolve/`, data),
};
