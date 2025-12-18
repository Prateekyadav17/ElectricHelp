import axios from 'axios';

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: BASE,
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.code === 'ERR_NETWORK') {
      err.userMessage = 'Network or CORS error. Check server and URL.';
    }
    return Promise.reject(err);
  }
);

export const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token || ''}` } };
};

export default api;
