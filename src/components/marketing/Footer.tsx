'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
    const socials = [
        { icon: <Twitter className="w-5 h-5" suppressHydrationWarning />, label: 'Twitter', href: '#' },
        { icon: <Facebook className="w-5 h-5" suppressHydrationWarning />, label: 'Facebook', href: '#' },
        { icon: <Linkedin className="w-5 h-5" suppressHydrationWarning />, label: 'LinkedIn', href: '#' },
        { icon: <Instagram className="w-5 h-5" suppressHydrationWarning />, label: 'Instagram', href: '#' },
    ];

    return (
        <footer className="bg-[#020617] pt-24 pb-12 overflow-hidden relative border-t border-white/5" suppressHydrationWarning>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                                K
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tight text-white leading-none italic">
                                    Karobar
                                </span>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                    Sahulat
                                </span>
                            </div>
                        </div>
                        <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm italic mb-10">
                            The intelligent POS system empowering traditional shops to thrive in a digital economy. Built for speed, reliability, and growth.
                        </p>
                        <div className="flex gap-4">
                            {socials.map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-primary/20 hover:border-primary/20 transition-all cursor-pointer group"
                                    aria-label={social.label}
                                    suppressHydrationWarning
                                >
                                    {social.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h5 className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] mb-8">Product</h5>
                        <ul className="space-y-4">
                            {[
                                { name: 'Home', href: '/' },
                                { name: 'Features', href: '/features' },
                                { name: 'About us', href: '/about' },
                                { name: 'Gallery', href: '/gallery' },
                                { name: 'Pricing', href: '/pricing' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-white/60 hover:text-primary font-bold text-sm transition-colors tracking-tight italic">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] mb-8">Support</h5>
                        <ul className="space-y-4">
                            {['Help Center', 'Tutorials', 'Documentation', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-white/60 hover:text-primary font-bold text-sm transition-colors tracking-tight italic">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest italic tracking-[0.15em]">
                        © 2024 Karobar Sahulat. Empowering Local Commerce.
                    </p>
                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest italic">
                        <span>Made with <span className="text-rose-500 animate-pulse">❤️</span> in Pakistan</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
