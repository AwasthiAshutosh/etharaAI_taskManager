import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

const api = axios.create({
  baseURL: `${cleanApiUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('etharaai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip redirect for the auth-check call — AuthContext handles it internally
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/users/me')) {
        localStorage.removeItem('etharaai_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
