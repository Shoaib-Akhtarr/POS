'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const tiers = [
    {
        name: 'Basic POS',
        price: '3,000',
        description: 'Essential tools for small shops to start billing and tracking.',
        features: ['High-Speed Billing', 'Inventory Tracking', 'Simple Sales Reports', 'USB/Bluetooth Printing'],
        cta: 'Get Started',
        planId: 'starter',
        highlight: false,
        period: '/mo'
    },
    {
        name: 'Standard POS',
        price: '5,000',
        description: 'Advanced features for businesses ready to scale up.',
        features: ['Multi-User Access', 'Advanced Analytics', 'Supplier Management', 'Customer Khata System', 'Expense Tracking'],
        cta: 'Go Standard',
        planId: 'professional',
        highlight: true,
        period: '/mo'
    },
    {
        name: 'Enterprise POS',
        price: '50,000',
        description: 'Full Standard POS power with a cost-effective yearly commitment.',
        features: ['Standard POS Features', '1 Full Year Access', 'Priority 24/7 Support', 'Dedicated Training', 'Price Lock Guarantee'],
        cta: 'Go Enterprise',
        planId: 'professional-yearly',
        highlight: false,
        period: '/yr'
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-grid">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20 px-4">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block"
                    >
                        Simple Scaling
                    </motion.span>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1] mb-8"
                    >
                        Transparent Plans for <br />
                        <span className="text-gradient">Every Stage of Growth.</span>
                    </motion.h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative glass p-10 rounded-[3rem] border-white/5 flex flex-col transition-all duration-500 overflow-hidden ${tier.highlight ? 'shadow-[0_0_80px_-16px_rgba(79,70,229,0.3)] ring-2 ring-primary/50' : 'shadow-2xl shadow-black/5'
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-bl-3xl shadow-lg">
                                    Best Value
                                </div>
                            )}

                            <div className="mb-10">
                                <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-4 italic">{tier.name}</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-black text-foreground opacity-40 italic font-mono uppercase">PKR</span>
                                    <span className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">{tier.price}</span>
                                    <span className="text-black font-bold text-xs tracking-widest uppercase">{tier.period}</span>
                                </div>
                                <p className="mt-6 text-black font-medium italic leading-relaxed">
                                    {tier.description}
                                </p>
                            </div>

                            <div className="space-y-4 mb-12 flex-1 pt-8 border-t border-white/5">
                                {tier.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 text-foreground font-bold text-sm">
                                        <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-[10px] shrink-0 border border-emerald-500/20">✓</div>
                                        <span className="opacity-80">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={`/register?plan=${tier.planId}`}
                                className={`group relative w-full py-5 rounded-2xl font-black text-center transition-all overflow-hidden ${tier.highlight
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40'
                                    : 'bg-foreground text-background hover:bg-muted transition-colors'
                                    }`}
                            >
                                <span className="relative z-10 uppercase tracking-widest italic">{tier.cta}</span>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Link>

                            <p className="mt-4 text-[10px] text-center text-black font-bold uppercase tracking-widest">
                                Cancel Anytime • No Hidden Fees
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

