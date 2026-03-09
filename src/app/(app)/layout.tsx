'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute requireAdmin={false}>
            {children}
        </ProtectedRoute>
    );
}
