import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  updateOnboarding: (data) => api.patch('/auth/onboarding', data),
};

// Chat
export const chatAPI = {
  createSession: () => api.post('/chat/session'),
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: () => api.get('/chat/history'),
  getSession: (id) => api.get(`/chat/session/${id}`),
};

// Appointments
export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.patch(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
  getCounsellors: () => api.get('/appointments/counsellors'),
  addNote: (id, data) => api.post(`/appointments/${id}/notes`, data),
};

// Resources
export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getOne: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.patch(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Posts
export const postAPI = {
  getAll: (params) => api.get('/posts', { params }),
  create: (data) => api.post('/posts', data),
  comment: (id, data) => api.post(`/posts/${id}/comments`, data),
  like: (id) => api.post(`/posts/${id}/like`),
  report: (id, data) => api.post(`/posts/${id}/report`, data),
  delete: (id) => api.delete(`/posts/${id}`),
};

// Mood
export const moodAPI = {
  create: (data) => api.post('/mood', data),
  getHistory: (params) => api.get('/mood/history', { params }),
  getToday: () => api.get('/mood/today'),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  addCounsellor: (data) => api.post('/admin/counsellors', data),
  getFlaggedChats: () => api.get('/admin/flagged-chats'),
  exportData: (type, params) => api.get(`/admin/export/${type}`, { params, responseType: 'blob' }),
};

export default api;
