'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSettingsClick: () => void;
    onLogoutClick: () => void;
    offlineMode: boolean;
    hasUnsyncedData: boolean;
    onSync: () => void;
}

export default function Sidebar({
    isOpen,
    setIsOpen,
    onSettingsClick,
    onLogoutClick,
    offlineMode,
    hasUnsyncedData,
    onSync
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { logout } = useAuth();

    const currentView = pathname === '/' ? (searchParams.get('view') === 'pos' ? 'pos' : 'analytics') : pathname.substring(1);

    const navItems = [
        { id: 'analytics', label: 'Home', icon: '📊', path: '/' },
        { id: 'pos', label: 'POS / Sales', icon: '💰', path: '/?view=pos' },
        { id: 'products', label: 'Products', icon: '📦', path: '/products' },
        { id: 'purchases', label: 'Purchases', icon: '🛒', path: '/purchases' },
        { id: 'customers', label: 'Customers', icon: '👥', path: '/customers' },
        { id: 'transactions', label: 'Transactions', icon: '📄', path: '/transactions' },
        { id: 'settings', label: 'Settings', icon: '⚙️', isAction: true }
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
                        onClick={() => router.push('/')}
                    >
                        <div className="w-10 h-10 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pos-accent/20 group-hover:scale-110 transition-transform duration-300">
                            K
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black tracking-tight leading-none italic text-foreground">Karobar</h1>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sahulat POS</span>
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
                                    : 'text-muted hover:text-foreground hover:bg-muted/10'
                                    }`}
                            >
                                <span className="text-lg leading-none">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="space-y-6">
                    {/* Status Indicator */}
                    <div className="px-2 space-y-4">
                        <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-[9px] font-black tracking-widest ${offlineMode ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                            <div className="flex items-center space-x-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${offlineMode ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
                                <span>{offlineMode ? 'OFFLINE' : 'ONLINE'}</span>
                            </div>
                            {hasUnsyncedData && (
                                <button
                                    onClick={onSync}
                                    className="ml-2 hover:scale-110 transition-transform"
                                    title="Sync Data"
                                >
                                    🔄
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onLogoutClick}
                        className="flex items-center space-x-3 w-full p-4 rounded-xl text-red-500 font-bold text-[11px] uppercase tracking-wider hover:bg-red-500/5 transition-all duration-200 group border border-transparent hover:border-red-500/10"
                    >
                        <span className="text-lg leading-none group-hover:rotate-12 transition-transform">↪️</span>
                        <span>Log out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
