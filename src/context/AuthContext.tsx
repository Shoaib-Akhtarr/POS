'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, verifySession } from '@/services/authService';

interface AuthContextType {
  user: { token: string; shopId?: string; name?: string; email?: string; role?: string } | null;
  loading: boolean;
  login: (token: string, role: string, shopId?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ token: string; shopId?: string; name?: string; email?: string; role?: string } | null>(null);
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
          setUser({
            token: currentUser.token,
            shopId: verifiedUser.shopId,
            name: verifiedUser.name,
            email: verifiedUser.email,
            role: verifiedUser.role
          });
          setIsAuthenticated(true);
        } else {
          // Token was spoofed or expired
          setUser(null);
          setIsAuthenticated(false);
          // router.push('/login'); // Don't redirect here, let components handle it
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [router]);

  const login = (token: string, role: string, shopId?: string) => {
    localStorage.setItem('token', token);
    setUser({ token, role, shopId });
    setIsAuthenticated(true);

    // Role route handling: Admin/User -> Dashboard, Demo -> Demo
    if (role === 'admin' || role === 'user') {
      router.push('/dashboard');
    } else {
      router.push('/demo');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
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
