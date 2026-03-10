'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, verifySession } from '@/services/authService';

interface AuthContextType {
  user: { token: string; shopId?: string; name?: string; email?: string; role?: string; canAccessDashboard?: boolean } | null;
  loading: boolean;
  login: (token: string, role: string, shopId?: string, canAccessDashboard?: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ token: string; shopId?: string; name?: string; email?: string; role?: string; canAccessDashboard?: boolean } | null>(null);
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
            role: verifiedUser.role,
            canAccessDashboard: verifiedUser.canAccessDashboard
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

  const login = (token: string, role: string, shopId?: string, canAccessDashboard: boolean = false) => {
    localStorage.setItem('token', token);
    setUser({ token, role, shopId, canAccessDashboard });
    setIsAuthenticated(true);

    // Stage-based redirect logic:
    // 1. Authorized for dashboard (Admin or approved user) -> Dashboard
    // 2. Demo role -> Demo page
    // 3. Regular registered user -> Stay on main site
    if (canAccessDashboard) {
      router.push('/dashboard');
    } else if (role === 'demo') {
      router.push('/demo');
    } else {
      router.push('/');
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
