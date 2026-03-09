// authService.ts - Service for authentication
import api from './apiService';

// Helper function to check if we're in the browser
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Login user
export const login = async (email: string, password: string): Promise<{ token: string }> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    // Token is stored by the interceptors or manually if needed
    if (response.data.token && isBrowser()) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    // Check if it's a network error (offline)
    if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Network error - unable to login. Please check your connection.');
    }
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

// Register user
export const register = async (name: string, email: string, password: string): Promise<{ token: string }> => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    // Store token in localStorage
    if (response.data.token && isBrowser()) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    // Check if it's a network error (offline)
    if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Network error - unable to register. Please check your connection.');
    }
    const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
    throw new Error(errorMessage);
  }
};

// Logout user
export const logout = (): void => {
  if (isBrowser()) {
    localStorage.removeItem('token');
  }
};

// Get current user from local state
export const getCurrentUser = (): { token: string } | null => {
  if (!isBrowser()) return null;
  const token = localStorage.getItem('token');
  return token ? { token } : null;
};

// Verify session user via the backend API check
export const verifySession = async (token: string): Promise<any> => {
  if (!isBrowser()) return null;
  if (!token) return null;

  try {
    // We pass the token explicitly for verification, 
    // though the apiService interceptor would also add it if it's already in localStorage.
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Session verification failed:', error);
    // If it fails verification (401), clean up the local storage
    if (isBrowser()) {
      localStorage.removeItem('token');
    }
    return null;
  }
};

// Change Password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  try {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to change password';
    throw new Error(errorMessage);
  }
};