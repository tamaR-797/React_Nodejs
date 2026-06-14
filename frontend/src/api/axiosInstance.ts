import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { logout } from '../features/auth/authSlice';
import { getStoredAuth, isTokenExpired } from '../utils/authUtils';

const apiBaseUrl = (() => {
  const url = import.meta.env.VITE_API_URL?.toString();
  if (!url) return 'http://localhost:5000/api';
  return url.endsWith('/api') ? url : `${url.replace(/\/+$/, '')}/api`;
})();

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    let token = store.getState().auth.token;

    if (!token) {
      const stored = getStoredAuth();
      token = stored?.token || null;
    }

    if (isTokenExpired(token)) {
      try {
        localStorage.removeItem('auth');
      } catch (e) {
        // ignore
      }
      store.dispatch(logout());
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(new Error('Session expired'));
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      if (typeof window !== 'undefined') window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
