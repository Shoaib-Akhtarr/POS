'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const images = [
    {
        src: '/gallery/dashboard.png',
        alt: 'Elegant Dashboard Interface',
        title: 'Insights at a Glance',
        category: 'Analytics'
    },
    {
        src: '/gallery/billing.png',
        alt: 'Fast POS Billing Screen',
        title: 'Lightning Fast Billing',
        category: 'Sales'
    },
    {
        src: '/gallery/inventory.png',
        alt: 'Smart Inventory Management',
        title: 'Smart Stock Control',
        category: 'Inventory'
    },
    {
        src: '/gallery/khata.png',
        alt: 'Customer Khata & Ledger',
        title: 'Digital Customer Ledger',
        category: 'Khata'
    },
    {
        src: '/gallery/reports.png',
        alt: 'Detailed Financial Reports',
        title: 'Deep Business Analytics',
        category: 'Reports'
    },
    {
        src: '/gallery/mobile.png',
        alt: 'Fully Responsive Mobile View',
        title: 'POS on the Go',
        category: 'Mobile'
    }
];

export default function Gallery() {
    return (
        <section id="gallery" className="py-24 relative overflow-hidden bg-grid/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20 px-4">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block"
                    >
                        Visual Showcase
                    </motion.span>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1] mb-8"
                    >
                        Experience the <br />
                        <span className="text-gradient italic">Future of Retail.</span>
                    </motion.h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {images.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative h-[400px] rounded-[2.5rem] overflow-hidden glass border-white/5 shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors z-10" />
                            <div className="relative h-full w-full">
                                {/* Placeholder for actual product images - using gradients for premium feel if images are missing */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                                    <span className="text-6xl opacity-20 filter grayscale">🖼️</span>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-8 z-20 translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">{item.category}</span>
                                    <h4 className="text-xl font-black text-white mt-3 italic">{item.title}</h4>
                                    <p className="text-white/60 text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.alt}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
