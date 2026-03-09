'use client';

import { motion } from 'framer-motion';

const features = [
    {
        title: 'POS Billing',
        description: 'Create professional receipts instantly with high-speed Bluetooth & USB support.',
        icon: '🧾',
        color: 'from-blue-500/20 to-blue-600/5'
    },
    {
        title: 'Khata System',
        description: 'Track customer credit effortlessly and recover dues with automated reminders.',
        icon: '📒',
        color: 'from-emerald-500/20 to-emerald-600/5'
    },
    {
        title: 'Inventory Sync',
        description: 'Real-time stock tracking with intelligent low-stock alerts across all devices.',
        icon: '📦',
        color: 'from-amber-500/20 to-amber-600/5'
    },
    {
        title: 'Cloud Analytics',
        description: 'Beautiful, deep-dive sales reports to help you master your business performance.',
        icon: '📈',
        color: 'from-indigo-500/20 to-indigo-600/5'
    },
    {
        title: 'Offline Mode',
        description: 'Keep selling even without internet. Your data syncs perfectly once back online.',
        icon: '🔋',
        color: 'from-rose-500/20 to-rose-600/5'
    },
    {
        title: 'Multi-User Access',
        description: 'Grant secure staff access with custom permissions and role-based management.',
        icon: '👥',
        color: 'from-violet-500/20 to-violet-600/5'
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 px-4">
                    <div className="max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block"
                        >
                            Core Capabilities
                        </motion.span>
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.05]"
                        >
                            Everything you need to <br />
                            <span className="text-gradient">Elevate Your Shop.</span>
                        </motion.h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative"
                        >
                            <div className="h-full glass p-10 rounded-[2.5rem] transition-all duration-500 border-white/5 shadow-2xl shadow-indigo-900/5">
                                {/* Feature Icon Container */}
                                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-inner`}>
                                    {feature.icon}
                                </div>

                                <h4 className="text-2xl font-black text-foreground mb-4 italic tracking-tight">{feature.title}</h4>
                                <p className="text-muted font-medium leading-relaxed">
                                    {feature.description}
                                </p>

                                <div className="mt-8 pt-8 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                        Learn more <span className="text-lg">→</span>
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
