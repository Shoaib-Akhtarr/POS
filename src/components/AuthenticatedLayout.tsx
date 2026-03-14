'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import ChangePasswordForm from '@/components/ChangePasswordForm';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    cartCount?: number;
    onCartToggle?: () => void;
    showCartToggle?: boolean;
}

export default function AuthenticatedLayout({
    children,
    cartCount = 0,
    onCartToggle,
    showCartToggle = false
}: AuthenticatedLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { theme, setTheme } = useTheme();
    const { logout } = useAuth();

    return (
        <ProtectedRoute>
            <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-sidebar-border bg-sidebar sticky top-0 z-[60]">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-3 -ml-2 text-2xl hover:bg-muted/10 rounded-xl transition-colors"
                    >
                        ☰
                    </button>

                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-pos-accent rounded-lg flex items-center justify-center text-white font-black text-sm">
                            K
                        </div>
                        <h1 className="text-sm font-black italic text-foreground leading-none">Karobar Sahulat</h1>
                    </div>

                    {showCartToggle ? (
                        <button
                            onClick={onCartToggle}
                            className="relative p-2"
                        >
                            🛒
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-pos-accent text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    ) : (
                        <div className="w-10"></div> // Spacer
                    )}
                </header>

                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    onSettingsClick={() => setShowSettingsModal(true)}
                    onLogoutClick={() => setShowLogoutConfirm(true)}
                />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    {children}
                </main>

                {/* Global Overlays */}
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-card border border-card-border w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-red-500/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/10 ring-4 ring-red-500/5">
                                    <span className="text-4xl animate-pulse">👋</span>
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-foreground mb-3">Sign Out?</h3>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 px-4">
                                    Are you sure you want to end your session?
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 bg-muted/5 hover:bg-muted/10 text-foreground rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all border border-card-border active:scale-95">Stay Logged In</button>
                                    <button onClick={logout} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 border border-white/10">Yes, Sign Out</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Popup Modal */}
                <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${showSettingsModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)} />
                    <div className={`relative w-full max-w-3xl bg-card border border-card-border rounded-3xl shadow-2xl transition-all duration-300 transform ${showSettingsModal ? 'scale-100' : 'scale-95'}`}>
                        <div className="max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-card-border">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-xl bg-pos-accent/10 border border-pos-accent/20 flex items-center justify-center text-pos-accent">⚙️</div>
                                    <h2 className="text-lg font-bold tracking-tight text-foreground italic uppercase">Settings</h2>
                                </div>
                                <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Appearance</h3>
                                            <div className="bg-background border border-card-border rounded-2xl p-2 flex gap-2">
                                                {['light', 'dark', 'system'].map((mode) => (
                                                    <button key={mode} onClick={() => setTheme(mode)} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${theme === mode || (mode === 'system' && !theme) ? 'bg-card text-foreground shadow-sm border border-card-border' : 'text-muted-foreground hover:text-foreground'}`}>
                                                        <span className="text-lg mb-1">{mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '🖥️'}</span>
                                                        <span className="text-[10px] font-bold uppercase">{mode}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">System</h3>
                                            <div className="bg-card border border-card-border rounded-2xl p-4 flex items-center justify-between group cursor-default">
                                                <div>
                                                    <p className="text-sm font-bold text-foreground italic">Karobar Sahulat POS</p>
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">v1.0.4 Premium</p>
                                                </div>
                                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase">Active</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-card-border pt-10">
                                        <ChangePasswordForm />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-card-border bg-muted/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <span>© 2024 Karobar Sahulat</span>
                                <span>Designed with ❤️ by Shawaiz & Shoaib</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
