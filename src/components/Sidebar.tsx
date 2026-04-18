'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSettingsClick: () => void;
    onLogoutClick: () => void;
}

export default function Sidebar({
    isOpen,
    setIsOpen,
    onSettingsClick,
    onLogoutClick
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { logout } = useAuth();
    const { t } = useLanguage();

    const currentView = pathname === '/dashboard'
        ? (searchParams.get('view') === 'pos' ? 'pos' : 'analytics')
        : pathname.includes('subscription') ? 'subscription' : pathname.replace('/dashboard', '').slice(1);

    const navItems = [
        { id: 'analytics', label: t('dashboard'), icon: '📊', path: '/dashboard' },
        { id: 'pos', label: 'POS / ' + t('sales'), icon: '💰', path: '/dashboard?view=pos' },
        { id: 'products', label: t('inventory'), icon: '📦', path: '/products' },
        { id: 'purchases', label: t('purchases'), icon: '🛒', path: '/purchases' },
        { id: 'customers', label: t('customers'), icon: '👥', path: '/customers' },
        { id: 'transactions', label: t('reports'), icon: '📄', path: '/transactions' },
        { id: 'profile', label: t('profile'), icon: '👤', path: '/settings/profile' }
    ];

    const handleNavClick = (item: any) => {
        if (item.isAction) {
            if (item.id === 'settings') onSettingsClick();
        } else {
            router.push(item.path);
        }
        if (isOpen) setIsOpen(false);
    };

    return (
        <>
            {/* Backdrop for mobile sidebar */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Modern Sidebar (220px) */}
            <aside className={`
  fixed md:relative inset-y-0 left-0 w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col justify-between py-8 px-4 shadow-sm z-[110] transition-transform duration-300
  ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
`}>
                <div className="space-y-10">
                    {/* Mobile Close Button */}
                    <button
                        className="md:hidden absolute top-4 right-4 p-2 text-xl hover:bg-muted/10 rounded-xl"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>

                    {/* Logo/Brand */}
                    <div
                        className="flex items-center space-x-3 px-2 group cursor-pointer"
                        onClick={() => router.push('/dashboard')}
                    >
                        <div className="w-10 h-10 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pos-accent/20 group-hover:scale-110 transition-transform duration-300">
                            K
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black tracking-tight leading-none italic text-foreground">Karobar</h1>
                            <span className="text-[10px] font-bold text-black uppercase tracking-widest">Sahulat POS</span>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="space-y-1.5 focus:outline-none">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={`flex items-center space-x-3 w-full p-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-200 outline-none ${currentView === item.id
                                    ? 'bg-pos-accent text-white shadow-md shadow-pos-accent/20'
                                    : 'text-black hover:text-foreground hover:bg-muted/10'
                                    }`}
                            >
                                <span className="text-lg leading-none">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="space-y-6">
                </div>
            </aside>
        </>
    );
}

