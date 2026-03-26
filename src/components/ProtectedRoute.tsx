'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // If trying to access non-public routes while not logged in
        router.push(`/login?redirect=${pathname}`);
      } else if (requireAdmin && user?.role !== 'admin') {
        // If authenticated but role is demo and route requires admin
        router.push('/demo');
      } else if (pathname.startsWith('/dashboard') && !user?.dashboardAccess) {
        // Stage 2 protection: Authenticated but not authorized for dashboard
        console.log(`[AUTH PROTECT] Redirecting unauthorized user from ${pathname} to /pricing`);
        router.push('/pricing');
      }
    }
  }, [isAuthenticated, loading, user, requireAdmin, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black italic">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (requireAdmin && user?.role !== 'admin') {
    return null; // Will redirect to /demo via useEffect
  }

  return <>{children}</>;
}
