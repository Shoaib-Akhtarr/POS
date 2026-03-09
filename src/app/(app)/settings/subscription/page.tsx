'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/apiService';

export default function SubscriptionPage() {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await api.get('/subscriptions/me');
                setSubscription(response.data);
            } catch (error) {
                console.error('Error fetching subscription:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSubscription();
        }
    }, [user]);

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const daysLeft = subscription ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">Subscription & Billing</h1>
                    <p className="text-slate-500 font-medium">Manage your plan and billing details.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Current Plan Card */}
                    <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-indigo-900/5 border border-slate-100 p-10 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Active Plan</span>
                                    <h2 className="text-5xl font-black text-indigo-600 capitalize italic">{subscription?.plan || 'Free'}</h2>
                                </div>
                                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-100 italic">
                                    {subscription?.status === 'trialing' ? 'Free Trial' : 'Active'}
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">📅</div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Renewal Date</p>
                                        <p className="text-slate-900 font-bold">{new Date(subscription?.endDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">💳</div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                                        <p className="text-slate-900 font-bold">No payment method attached</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 flex gap-4">
                            <button className="bg-indigo-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">
                                Upgrade Plan
                            </button>
                            <button className="bg-white text-slate-900 border-2 border-slate-100 font-black px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
                                View Invoices
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-600/30 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-8 block">Trial Remaining</span>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-7xl font-black italic">{daysLeft}</span>
                                <span className="text-xl font-bold opacity-80 uppercase tracking-widest">Days</span>
                            </div>
                            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mt-6">
                                <div
                                    className="bg-white h-full transition-all duration-1000"
                                    style={{ width: `${(daysLeft / 14) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <p className="text-xs font-medium leading-relaxed opacity-80 mt-10">
                            You're currently enjoying the full professional power of Karobar Sahulat. Upgrade anytime to keep your features.
                        </p>
                    </div>
                </div>

                <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 mb-6 italic">Billing History</h3>
                    <div className="text-center py-10">
                        <div className="text-4xl mb-4">📄</div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No transactions found</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
