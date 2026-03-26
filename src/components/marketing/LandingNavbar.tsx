'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '/features' },
        { name: 'About us', href: '/about' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'py-4'
                : 'py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`relative flex justify-between items-center px-6 py-3 rounded-2xl transition-all duration-500 ${isScrolled
                    ? 'glass shadow-xl shadow-primary/5 border-primary/10'
                    : 'bg-transparent border-transparent'
                    }`}>

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20"
                        >
                            K
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight text-foreground leading-none italic">
                                Karobar
                            </span>
                            <span className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">
                                Sahulat
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-5 py-2 text-sm font-bold text-black hover:text-primary transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-1/2 group-hover:left-1/4" />
                            </Link>
                        ))}
                    </div>

                    {/* Auth & Mobile Toggle Section */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="group relative px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-95"
                            >
                                <span className="relative z-10 font-black tracking-wide">DASHBOARD</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Link>
                        ) : (
                            <div className="hidden sm:flex items-center gap-6">
                                <Link
                                    href="/login"
                                    className="text-sm font-bold text-black hover:text-primary transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="group relative px-7 py-3 bg-foreground text-background rounded-xl font-bold text-xs overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/10 active:scale-95"
                                >
                                    <span className="relative z-10 font-black tracking-[0.15em] uppercase">Sign Up</span>
                                    <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none bg-muted/5 rounded-xl border border-white/5 active:scale-90 transition-all"
                        >
                            <motion.span
                                animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                                className="w-5 h-0.5 bg-foreground block"
                            />
                            <motion.span
                                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-5 h-0.5 bg-foreground block"
                            />
                            <motion.span
                                animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                                className="w-5 h-0.5 bg-foreground block"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 mx-4 glass border border-primary/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="flex flex-col p-4 gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-6 py-4 text-sm font-black text-foreground hover:bg-primary/10 rounded-2xl transition-all uppercase tracking-widest italic"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {!user && (
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="py-4 text-center text-xs font-black text-black uppercase tracking-widest bg-muted/5 rounded-2xl"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="py-4 text-center text-xs font-black text-white bg-primary rounded-2xl shadow-lg shadow-primary/20"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

