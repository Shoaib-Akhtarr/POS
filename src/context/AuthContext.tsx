'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, verifySession } from '@/services/authService';

interface AuthContextType {
  user: { token: string } | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ token: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const currentUser = getCurrentUser();
      if (currentUser?.token) {
        // Asynchronously verify this token against the backend
        const verifiedUser = await verifySession(currentUser.token);
        if (verifiedUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Token was spoofed or expired
          setUser(null);
          setIsAuthenticated(false);
          router.push('/login');
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [router]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setUser({ token });
    router.push('/'); // Redirect to dashboard after login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}