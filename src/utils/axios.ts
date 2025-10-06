// utils/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://sismoya.bsit3b.site/api',
  timeout: 10000,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      console.log('Authentication failed, redirecting to login...');
      // You might want to redirect to login page here
      // router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;