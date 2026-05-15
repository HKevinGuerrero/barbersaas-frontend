import axios from 'axios';

const API_URL = 'https://localhost:7276/api';

export const api = axios.create({
  baseURL: API_URL,
});

// INTERCEPTOR: Añade el token a todas las peticiones si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;