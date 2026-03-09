'use client';

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { getProfile, updateProfile } from '@/services/authService';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'shop'>('general');
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        address: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setUser(data);
            setFormData({
                name: data.name || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || ''
            });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            await updateProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            fetchProfile();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-full w-full items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pos-accent"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-background p-4 lg:p-10">
                <div className="max-w-4xl mx-auto space-y-10">
                    {/* Profile Header */}
                    <div className="relative overflow-hidden bg-sidebar border border-sidebar-border rounded-[2.5rem] p-8 lg:p-12 shadow-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pos-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="relative flex flex-col md:flex-row items-center gap-8">
                            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-pos-accent rounded-[2rem] flex items-center justify-center text-white font-black text-4xl lg:text-5xl shadow-2xl shadow-pos-accent/20 italic">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter mb-2">{user?.name}</h1>
                                <p className="text-muted-foreground font-medium mb-4">{user?.email}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="px-4 py-1.5 bg-background border border-card-border rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Owner @ {user?.shop?.name}
                                    </span>
                                    <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                        {user?.shop?.subscriptionStatus} Plan
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 p-1.5 bg-sidebar border border-sidebar-border rounded-2xl w-fit">
                        {[
                            { id: 'general', label: 'General', icon: '👤' },
                            { id: 'security', label: 'Security', icon: '🔒' },
                            { id: 'shop', label: 'Shop Details', icon: '🏪' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-pos-accent text-white shadow-lg shadow-pos-accent/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div className="bg-sidebar border border-sidebar-border rounded-[2rem] p-8 lg:p-10 shadow-sm relative overflow-hidden">
                                    <h3 className="text-xl font-black italic text-foreground mb-8 flex items-center gap-3">
                                        Personal Information
                                        <div className="h-px flex-1 bg-card-border"></div>
                                    </h3>

                                    {message.text && (
                                        <div className={`mb-8 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                            {message.type === 'error' ? '⚠️' : '✅'}
                                            {message.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pos-accent/20 focus:border-pos-accent outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 opacity-50 cursor-not-allowed">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address (Read Only)</label>
                                            <input
                                                type="email"
                                                value={user?.email}
                                                disabled
                                                className="w-full bg-muted/5 border border-card-border rounded-xl px-4 py-3 text-sm italic"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                placeholder="e.g. 0300-1234567"
                                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pos-accent/20 focus:border-pos-accent outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Residential Address</label>
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                rows={3}
                                                placeholder="Enter your full address"
                                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pos-accent/20 focus:border-pos-accent outline-none transition-all resize-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="bg-pos-accent text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-pos-accent/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {updating ? 'Updating...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="max-w-2xl">
                                <ChangePasswordForm />
                            </div>
                        )}

                        {activeTab === 'shop' && (
                            <div className="bg-sidebar border border-sidebar-border rounded-[2rem] p-8 lg:p-10 shadow-sm">
                                <h3 className="text-xl font-black italic text-foreground mb-8 flex items-center gap-3">
                                    Linked Shop Profile
                                    <div className="h-px flex-1 bg-card-border"></div>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Business Name</p>
                                            <p className="text-2xl font-black tracking-tight italic">{user?.shop?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Business Category</p>
                                            <p className="text-lg font-bold text-foreground/80">{user?.shop?.businessType}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subscription Plan</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-2xl font-black text-pos-accent uppercase tracking-tighter italic">{user?.shop?.plan}</p>
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black border border-emerald-500/20">{user?.shop?.subscriptionStatus}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Currency</p>
                                            <p className="text-lg font-bold">{user?.shop?.settings?.currency || 'PKR'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between py-10 border-t border-card-border">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic mb-1">User ID: {user?._id}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest underline cursor-pointer hover:text-red-500 transition-colors opacity-30 italic">Request Account Deletion</p>
                        </div>

                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center space-x-3 px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-red-500/5 hover:shadow-red-500/20 active:scale-95 group border border-red-500/20"
                        >
                            <span className="text-lg leading-none group-hover:rotate-12 transition-transform">↪️</span>
                            <span>Log out from Session</span>
                        </button>
                    </div>

                    {/* Local Logout Confirmation Modal */}
                    <AnimatePresence>
                        {showLogoutConfirm && (
                            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-card border border-card-border w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
                                >
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
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
