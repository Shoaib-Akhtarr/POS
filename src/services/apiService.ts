// apiService.ts - Service for API communication
import axios from 'axios';

// Use the environment variable for the API URL, with a fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error); // Debug log
  return Promise.reject(error);
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // We only want to log 500s or network issues as errors. 
    // 400 and 401 are expected business logic states (invalid pass, duplicate email, etc.)
    if (error?.response?.status && error.response.status < 500) {
      console.warn(`[API] ${error?.config?.method?.toUpperCase()} ${error?.config?.url} | Status: ${error.response.status}`);
      return Promise.reject(error);
    }

    const responseData = error?.response?.status ? JSON.stringify(error.response.data) : 'N/A';
    console.error(`[API ERROR] ${error?.config?.method?.toUpperCase()} ${error?.config?.url} | Status: ${error?.response?.status || 'N/A'}`);
    console.error('API Error Details (String):', String(error));
    console.error('API Error Data (JSON):', responseData);

    return Promise.reject(error);
  }
);

export default api;