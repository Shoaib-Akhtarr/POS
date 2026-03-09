'use client';

import { motion } from 'framer-motion';

export default function SaaSInfo() {
    const steps = [
        {
            number: '01',
            title: 'Create Account',
            description: 'Sign up in seconds and choose a plan tailored to your business scale.',
            icon: '👤',
            color: 'bg-indigo-500'
        },
        {
            number: '02',
            title: 'Setup Shop',
            description: 'Effortlessly import products, categories, and customer data.',
            icon: '🏪',
            color: 'bg-emerald-500'
        },
        {
            number: '03',
            title: 'Start Selling',
            description: 'Ring up sales instantly with our high-speed, intuitive POS interface.',
            icon: '💰',
            color: 'bg-amber-500'
        },
        {
            number: '04',
            title: 'Grow Business',
            description: 'Unlock deep insights into profits, inventory, and khata from anywhere.',
            icon: '📊',
            color: 'bg-primary'
        }
    ];

    return (
        <section id="about" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-24">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block"
                    >
                        Success Blueprint
                    </motion.span>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-foreground tracking-tight"
                    >
                        Your Journey to <span className="text-gradient">Digital Growth</span>
                    </motion.h3>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[45px] left-0 w-full h-[2px] bg-slate-100 dark:bg-white/5 z-0">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative z-10 group"
                            >
                                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                                    {/* Icon / Number Bubble */}
                                    <div className="relative mb-8">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl transition-all duration-300 relative z-10 glass border-white/10`}
                                        >
                                            {step.icon}
                                        </motion.div>
                                        <div className={`absolute -top-4 -right-4 w-10 h-10 ${step.color} rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg z-20`}>
                                            {step.number}
                                        </div>

                                        {/* Background Pulse Effect */}
                                        <div className={`absolute inset-0 ${step.color} opacity-5 blur-2xl group-hover:opacity-20 transition-opacity rounded-full`} />
                                    </div>

                                    <h4 className="text-2xl font-black text-foreground mb-4 italic tracking-tight">{step.title}</h4>
                                    <p className="text-muted font-medium leading-relaxed px-4 lg:px-0 lg:pr-6">
                                        {step.description}
                                    </p>

                                    {/* Mobile Connector */}
                                    <div className="lg:hidden w-px h-12 bg-slate-100 dark:bg-white/5 my-6 last:hidden" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
