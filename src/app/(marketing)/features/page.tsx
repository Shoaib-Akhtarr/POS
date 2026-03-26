'use client';

import { motion } from 'framer-motion';
import LandingNavbar from '@/components/marketing/LandingNavbar';
import Features from '@/components/marketing/Features';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

const detailedFeatures = [
    {
        id: 'pos-billing',
        title: 'High-Speed POS Billing',
        subtitle: 'The heart of your shop, optimized for speed.',
        description: 'Our cloud-based POS system is designed to handle your busiest hours without breaking a sweat. Print professional receipts, manage discounts, and process payments in seconds.',
        points: [
            'Support for Bluetooth, Thermal, and USB printers',
            'Customizable digital and paper receipts',
            'Quick-scan barcode support for faster checkout',
            'Instant item search and rapid cart management'
        ],
        icon: '🧾',
        color: 'from-blue-500/20 to-blue-600/10'
    },
    {
        id: 'khata-system',
        title: 'Digital Khata & Recoveries',
        subtitle: 'Never lose track of a single paisa again.',
        description: 'Transform how you manage customer credit. Karobar Sahulat automatically tracks every transaction, maintains running balances, and helps you recover dues faster.',
        points: [
            'Automated payment reminders via SMS & Notifications',
            'Complete customer transaction history (Ledger)',
            'Real-time running balance for every customer',
            'One-tap recovery logging and receipt generation'
        ],
        icon: '📒',
        color: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
        id: 'inventory-sync',
        title: 'Intelligent Inventory Sync',
        subtitle: 'Auto-syncing across all your devices, always.',
        description: 'Stop guessing what is in stock. Our multi-tenant architecture ensures that every sale immediately updates your inventory across mobile, tablet, and web apps.',
        points: [
            'Automated low-stock alerts and notifications',
            'Bulk product import via Excel/CSV',
            'Categorized stock management with images',
            'Purchase history and supplier tracking'
        ],
        icon: '📦',
        color: 'from-amber-500/20 to-amber-600/10'
    },
    {
        id: 'cloud-analytics',
        title: 'Advanced Cloud Analytics',
        subtitle: 'Data-driven decisions for your business growth.',
        description: 'Unlock the power of your data with beautiful, interactive charts. Understand your best-selling products, peak hours, and monthly profit margins at a glance.',
        points: [
            'Daily, weekly, and monthly sales reports',
            'Profit & Loss statements generated automatically',
            'Top customers and best-selling item tracking',
            'Export reports to PDF and Excel'
        ],
        icon: '📈',
        color: 'from-indigo-500/20 to-indigo-600/10'
    },
    {
        id: 'multi-shop',
        title: 'Multi-Shop Management',
        subtitle: 'One login, multiple businesses.',
        description: 'Scale your business with ease. Manage multiple branches or different shops from a single account. Switch between shops instantly and see consolidated reports.',
        points: [
            'Unified dashboard for multiple shop locations',
            'Inventory sharing across branches coming soon',
            'Centralized staff and permission management',
            'Branch-specific sales and expense tracking'
        ],
        icon: '🏠',
        color: 'from-cyan-500/20 to-cyan-600/10'
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <LandingNavbar />
            
            <main>
                {/* Hero Section of Features Page */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-grid">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 block"
                        >
                            Deep Dive
                        </motion.span>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-8xl font-black text-foreground tracking-tight leading-[0.95] mb-10"
                        >
                            Feature <span className="text-gradient italic">Showcase.</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-2xl text-black font-medium max-w-2xl mx-auto leading-relaxed"
                        >
                            Everything you need to transform your shop from traditional to <span className="text-foreground">Digital First.</span>
                        </motion.p>
                    </div>
                </section>

                {/* Grid Overview Section */}
                <Features />

                {/* Detailed Sections */}
                <div className="py-24 space-y-32">
                    {detailedFeatures.map((feature, index) => (
                        <section 
                            key={feature.id} 
                            id={feature.id} 
                            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-32"
                        >
                            <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-24`}>
                                {/* Text Content */}
                                <motion.div 
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex-1 space-y-8"
                                >
                                    <div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 block">
                                            {feature.subtitle}
                                        </span>
                                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight italic mb-6">
                                            {feature.title}
                                        </h2>
                                        <p className="text-lg md:text-xl text-black font-medium leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {feature.points.map((point, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className="mt-1 flex-shrink-0 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-[10px]">
                                                    ✓
                                                </div>
                                                <span className="text-sm font-bold text-foreground/80">{point}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Visual Element / Placeholder */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, rotate: index % 2 === 0 ? 5 : -5 }}
                                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                    viewport={{ once: true }}
                                    className="flex-1 w-full"
                                >
                                    <div className={`relative aspect-square lg:aspect-[4/3] rounded-[3rem] overflow-hidden bg-gradient-to-br ${feature.color} border border-white/5 shadow-2xl flex items-center justify-center group`}>
                                        <div className="text-9xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                                            {feature.icon}
                                        </div>
                                        
                                        {/* Decorative elements */}
                                        <div className="absolute inset-0 bg-grid opacity-20" />
                                        <div className="absolute top-8 right-8 glass px-4 py-2 rounded-xl text-[10px] font-black text-white/50 uppercase tracking-widest">
                                            Section {index + 1}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>
                    ))}
                </div>

                <CTASection />
            </main>
            
            <Footer />
        </div>
    );
}

