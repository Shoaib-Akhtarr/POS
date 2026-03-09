'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-grid">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-20 px-4">
                    {/* Trust Indicator / Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-sm"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span>Trusted by 1,200+ Businesses across Pakistan</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-5xl md:text-8xl font-black text-foreground tracking-tight leading-[0.95] mb-10"
                    >
                        Run Your Shop <br />
                        <span className="text-gradient italic">Smarter.</span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="text-lg md:text-2xl text-muted font-medium mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        The ultimate Digital POS & Khata system for growing businesses.
                        Manage sales, inventory, and recoveries in one elegant workspace.
                    </motion.p>

                    {/* CTA Group */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link
                            href="/demo"
                            className="group relative w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                Lets Try It Free Now
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Link>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all"
                    >
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-lg">🛡️</span> No Credit Card Required
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-lg">⚡</span> Setup in 2 Minutes
                        </div>
                    </motion.div>
                </div>

                {/* Product Preview / Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="relative mx-auto max-w-6xl group"
                >
                    <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/10 opacity-50"></div>
                        <div className="aspect-[16/10] bg-[#0c111d] rounded-[2.5rem] overflow-hidden border border-white/5 relative shadow-inner">
                            <Image
                                src="/pos_preview.png"
                                alt="Karobar Sahulat Dashboard Preview"
                                fill
                                priority
                                sizes="(max-width: 1200px) 100vw, 1100px"
                                className="object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-1000"
                                style={{ position: 'absolute', height: '100%', width: '100%', left: '0', top: '0', right: '0', bottom: '0' }}
                                suppressHydrationWarning
                            />

                            {/* Dashboard Overlay Gradients */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent"></div>

                            {/* Overlay Feature Tag */}
                            <div className="absolute bottom-8 left-8 flex items-center gap-3">
                                <div className="p-3 glass rounded-2xl shadow-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-black text-white/90 uppercase tracking-widest">Live Billing View</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
}
