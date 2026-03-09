'use client';

import { useState, useEffect, Suspense } from 'react';
import {
    register as serviceRegister,
    sendOTP,
    verifyOTP,
    storeTempPassword
} from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'email' | 'otp' | 'password' | 'details';

function RegisterForm() {
    const [step, setStep] = useState<Step>('email');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [shopName, setShopName] = useState('');
    const [businessType, setBusinessType] = useState('General Store');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'free';
    const { login: authLogin } = useAuth();

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((t) => t - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await sendOTP(email);
            setStep('otp');
            setTimer(60);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyOTP(email, otp);
            setStep('password');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await storeTempPassword(email, password);
            setStep('details');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await serviceRegister(name, email, shopName, businessType, plan);
            authLogin(data.token, data.role, data.shopId);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const steps = {
        email: (
            <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOTP}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-slate-900 font-bold"
                        placeholder="yours@example.com"
                    />
                </div>
                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-6 rounded-2xl shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Verification Code'}
                </button>
            </motion.form>
        ),
        otp: (
            <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
                        <span className="text-[10px] font-black text-indigo-600 uppercase">
                            {timer > 0 ? `Resend in ${timer}s` : <button type="button" onClick={handleSendOTP} className="underline">Resend Code</button>}
                        </span>
                    </div>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-black tracking-[10px] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
                        placeholder="000000"
                    />
                </div>
                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-6 rounded-2xl shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Code'}
                </button>
            </motion.form>
        ),
        password: (
            <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSetPassword}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-slate-900 font-bold"
                        placeholder="••••••••"
                    />
                </div>
                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-6 rounded-2xl shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Continue'}
                </button>
            </motion.form>
        ),
        details: (
            <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleFinalRegister}
                className="space-y-6"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-slate-900 font-bold"
                            placeholder="Shoaib Akhtar"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
                        <input
                            type="text"
                            required
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-slate-900 font-bold"
                            placeholder="My Karobar"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Type</label>
                        <select
                            required
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-slate-900 font-bold shadow-sm appearance-none"
                        >
                            <option>General Store</option>
                            <option>Medical Store</option>
                            <option>Clothing / Fashion</option>
                            <option>Electronic / Mobile</option>
                            <option>Restaurant / Cafe</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-6 rounded-2xl shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Complete Setup'}
                </button>
            </motion.form>
        )
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-100/40 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-white p-8 sm:p-12 relative z-10 backdrop-blur-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <div className="text-left mb-10">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 mb-8 text-white text-3xl font-black italic">
                                K
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                {step === 'email' && 'Get Started'}
                                {step === 'otp' && 'Verify Email'}
                                {step === 'password' && 'Choose Password'}
                                {step === 'details' && 'Final Details'}
                            </h1>
                            <p className="text-slate-500 font-medium italic">
                                {step === 'email' && 'Enter your email to receive a verification code.'}
                                {step === 'otp' && 'Enter the 6-digit code sent to your inbox.'}
                                {step === 'password' && 'Secure your account with a strong password.'}
                                {step === 'details' && 'Tell us about your business.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <span className="text-lg">⚠️</span>
                                {error}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <div key={step}>
                                {steps[step]}
                            </div>
                        </AnimatePresence>
                    </div>

                    <div className="bg-slate-50 rounded-[2rem] p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-8 italic">Onboarding</h3>
                            <div className="space-y-4">
                                {[
                                    { id: 'email', label: 'Email Verified', active: step !== 'email' },
                                    { id: 'password', label: 'Password Set', active: step === 'details' },
                                    { id: 'details', label: 'Shop Details', active: false }
                                ].map((s, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${s.active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            {s.active ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-widest ${s.active ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Selected Plan</span>
                                <span className="text-xs font-black italic">✓ Ready</span>
                            </div>
                            <p className="text-2xl font-black capitalize italic">{plan}</p>
                            <p className="text-[10px] font-medium opacity-80 mt-2">14-Day Free Trial included.</p>
                        </div>

                        <div className="mt-12 text-center pt-8 border-t border-slate-200/60">
                            <p className="text-xs font-bold text-slate-400 mb-4 italic">Already have an account?</p>
                            <Link href="/login" className="inline-block text-indigo-600 font-black text-sm hover:underline">Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-black">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
