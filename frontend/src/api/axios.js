import axios from 'axios';
import { getToken, getRefreshToken, setToken, clearAuth } from '../utils/cookie';

// C-01 FIX: NEXT_PUBLIC_API_URL must be set — never fall back to a hardcoded IP.
// Set this in .env.local (dev) or as a build argument in Docker (production).
if (!process.env.NEXT_PUBLIC_API_URL && typeof window === 'undefined') {
  throw new Error(
    '[axios.js] NEXT_PUBLIC_API_URL is not set. ' +
    'Create a .env.local file with NEXT_PUBLIC_API_URL=http://localhost:8001/api'
  );
}
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Automatically unwrap the 'data' field from standard API responses
    // We unwrap if 'data' exists and it's either explicitly successful or has a message/statusCode indicating a wrapped response
    if (response.data && response.data.data !== undefined) {
      if (response.data.success || response.data.message || response.data.statusCode) {
        return { ...response, data: response.data.data };
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          // Fix: Simplify payload to most likely API format
          const res = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
          
          // Response handling
          const data = res.data.success ? res.data.data : res.data;
          const token = data.accessToken || data.token;
          
          if (token) {
            setToken(token);
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }
          throw new Error('No token in refresh response');
        } catch (refreshError) {
          clearAuth();
          if (typeof window !== 'undefined') window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
