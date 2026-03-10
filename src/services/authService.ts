// authService.ts - Service for authentication
import api from './apiService';

// Helper function to check if we're in the browser
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Login user
export const login = async (email: string, password: string): Promise<{ token: string; role: string; shopId?: string; dashboardAccess: boolean }> => {
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
export const register = async (
  name: string,
  email: string,
  shopName: string,
  businessType: string,
  plan: string = 'free'
): Promise<{ token: string; role: string; shopId?: string; dashboardAccess: boolean }> => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      shopName,
      businessType,
      plan
    });
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

// Send OTP
export const sendOTP = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to send verification code';
    throw new Error(errorMessage);
  }
};

// Verify OTP
export const verifyOTP = async (email: string, otp: string): Promise<{ message: string }> => {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Invalid or expired code';
    throw new Error(errorMessage);
  }
};

// Store Temp Password
export const storeTempPassword = async (email: string, password: string): Promise<{ message: string }> => {
  try {
    const response = await api.post('/auth/store-temp-password', { email, password });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to store password';
    throw new Error(errorMessage);
  }
};

// Logout user
export const logout = (): void => {
  if (isBrowser()) {
    localStorage.removeItem('token');
  }
};

// Get User Profile
export const getProfile = async (): Promise<any> => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

// Update User Profile
export const updateProfile = async (data: { name: string; phoneNumber?: string; address?: string }): Promise<any> => {
  try {
    const response = await api.put('/user/profile', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Change Password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  try {
    const response = await api.put('/user/change-password', { currentPassword, newPassword });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to change password');
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
