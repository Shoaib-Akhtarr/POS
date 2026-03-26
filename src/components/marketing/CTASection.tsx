'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative bg-slate-900 rounded-[3rem] p-12 md:p-24 overflow-hidden border border-white/5 shadow-[0_32px_128px_-16px_rgba(79,70,229,0.2)]"
                >
                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-accent/10 to-transparent"></div>

                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-7xl font-black text-white tracking-tight mb-8 leading-none"
                        >
                            Start Managing Your Shop <span className="text-primary italic">Smarter</span> Today.
                        </motion.h3>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/60 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto"
                        >
                            Join 1,200+ shop owners grow their business with Karobar Sahulat.
                            Setup takes less than 2 minutes. No credit card required.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-6"
                        >
                            <Link
                                href="/demo"
                                className="group relative w-full sm:w-auto px-16 py-6 bg-white text-black rounded-2xl font-black text-xl transition-all hover:-translate-y-1 active:scale-95 overflow-hidden shadow-2xl"
                            >
                                <span className="relative z-10 uppercase tracking-widest font-black italic">Lets Try It Free Now</span>
                                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none"></div>
        </section>
    );
}

