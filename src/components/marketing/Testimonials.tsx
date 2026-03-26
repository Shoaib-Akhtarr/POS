'use client';

import { motion } from 'framer-motion';

const testimonials = [
    {
        quote: "Karobar Sahulat transformed how I manage my retail shop. The Khata system alone saved me hours of manual work every week.",
        author: "Ahmed Khan",
        role: "General Store Owner",
        avatar: "👤",
        metrics: "Recovered Rs. 150k in first month"
    },
    {
        quote: "Finally a POS that understands the Pakistani market. Simple, fast, and works perfectly with my local receipt printer.",
        author: "Sara Ahmed",
        role: "Boutique Manager",
        avatar: "👤",
        metrics: "30% faster checkout"
    },
    {
        quote: "The analytics are amazing. I can see exactly which products are profitable and which ones are just taking up space.",
        author: "Zubair Qureshi",
        role: "Wholesale Distributor",
        avatar: "👤",
        metrics: "Optimized 20% inventory"
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 relative bg-grid">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block"
                    >
                        Success Stories
                    </motion.span>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-foreground tracking-tight"
                    >
                        Trusted by <span className="text-gradient italic">1,200+</span> Shop Owners
                    </motion.h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="glass p-10 rounded-[2.5rem] flex flex-col justify-between border-white/5 shadow-xl shadow-indigo-900/5 hover:border-primary/20 transition-colors"
                        >
                            <div>
                                <div className="text-4xl mb-8 opacity-20">❝</div>
                                <p className="text-lg font-medium text-foreground leading-relaxed italic mb-8">
                                    {t.quote}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-foreground italic">{t.author}</h4>
                                        <p className="text-[10px] font-bold text-black uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                                <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                    {t.metrics}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

