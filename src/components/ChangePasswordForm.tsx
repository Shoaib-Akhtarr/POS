import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { changePassword } from '@/services/authService';

export default function ChangePasswordForm() {
    const { t } = useLanguage();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            return setError(t('passwordsDontMatch'));
        }

        if (newPassword.length < 6) {
            return setError(t('minCharPlaceholder' as any) || 'New password must be at least 6 characters');
        }

        try {
            setLoading(true);
            await changePassword(currentPassword, newPassword);
            setSuccess(t('passwordChangedSuccess'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || t('errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xs font-semibold tracking-wide uppercase text-black">{t('securityCredentials')}</h3>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6 relative overflow-hidden transition-all duration-300 shadow-sm">
                {loading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 border-2 border-pos-accent border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-medium mt-3 text-pos-accent tracking-wide uppercase">{t('processing')}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium flex items-start gap-3 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm font-medium flex items-start gap-3 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground/80">{t('currentPassword')}</label>
                        <input
                            type="password"
                            placeholder={t('oldPasswordPlaceholder')}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-1 focus:ring-pos-accent focus:border-pos-accent text-sm text-foreground placeholder:text-black/50 transition-colors shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground/80">{t('newPassword')}</label>
                            <input
                                type="password"
                                placeholder={t('minCharPlaceholder' as any)}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-1 focus:ring-pos-accent focus:border-pos-accent text-sm text-foreground placeholder:text-black/50 transition-colors shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground/80">{t('confirmPassword')}</label>
                            <input
                                type="password"
                                placeholder={t('retypePlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-1 focus:ring-pos-accent focus:border-pos-accent text-sm text-foreground placeholder:text-black/50 transition-colors shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                            className={`px-6 py-2.5 rounded-lg font-medium tracking-wide text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-pos-accent ${loading || !currentPassword || !newPassword || !confirmPassword
                                    ? 'bg-muted/10 text-black cursor-not-allowed border border-card-border'
                                    : 'bg-pos-accent text-white hover:opacity-90 shadow-md border border-transparent active:scale-95'
                                }`}
                        >
                            {loading ? t('processing') : t('updatePassword')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

